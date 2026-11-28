import crypto from 'node:crypto';

const TIMEOUT_MS = 10000;
const BUCKET_PATH = '/storage/v1/object/trf-state/main.json';
const ALLOWED_ORIGINS = [
  'https://tareference.click',
  'https://www.tareference.click',
  'https://cockpit.tareference.click'
];

function parseBody(raw) {
  if (!raw) {
    return {};
  }
  if (typeof raw !== 'string') {
    return raw;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function applyCors(req, res) {
  const origin = String(req.headers.origin || '');
  const extra = (process.env.COCKPIT_ORIGIN || '').trim();
  const valid = ALLOWED_ORIGINS.includes(origin) || (extra && origin === extra);
  if (valid) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-TRF-Bridge-Key'
  );
}

function safeEqual(a, b) {
  if (!a || !b) {
    return false;
  }
  const hA = crypto.createHash('sha256').update(a).digest();
  const hB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hA, hB);
}

function readSupabaseConfig() {
  return {
    url: (process.env.SUPABASE_URL || '').trim().replace(/\/$/, ''),
    key: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  };
}

function storageHeaders(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra
  };
}

async function fetchStoreState(cfg) {
  const resp = await fetch(`${cfg.url}${BUCKET_PATH}`, {
    method: 'GET',
    headers: storageHeaders(cfg.key),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (resp.status === 404) {
    return { payload: null, updatedAt: null };
  }
  if (!resp.ok) {
    throw new Error('Lecture Supabase Storage impossible.');
  }
  const payload = await resp.json();
  return { payload, updatedAt: payload?.updatedAt || null };
}

async function upsertStoreState(cfg, payload) {
  const updatedAt = new Date().toISOString();
  const body = JSON.stringify({ ...payload, updatedAt });
  const resp = await fetch(`${cfg.url}${BUCKET_PATH}`, {
    method: 'POST',
    headers: storageHeaders(cfg.key, {
      'Content-Type': 'application/json',
      'x-upsert': 'true'
    }),
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!resp.ok) {
    throw new Error('Écriture Supabase Storage impossible.');
  }
  return updatedAt;
}

function verifyBridgeAuth(req) {
  const secret = (
    process.env.BRIDGE_SYNC_SECRET ||
    process.env.SESSION_SIGNING_SECRET ||
    ''
  ).trim();
  const headerKey = String(req.headers['x-trf-bridge-key'] || '').trim();
  return Boolean(secret && safeEqual(headerKey, secret));
}

function mergeClientEvent(current, event) {
  const base = current || {
    products: [],
    orders: [],
    signatures: [],
    movements: [],
    snapshots: [],
    sealed: false
  };
  if (event.type === 'order' && event.item) {
    return { ...base, orders: [event.item, ...(base.orders || [])].slice(0, 200) };
  }
  if (event.type === 'signature' && event.item) {
    const signatures = [event.item, ...(base.signatures || [])].slice(0, 100);
    return { ...base, signatures };
  }
  return base;
}

async function handleGet(cfg, res) {
  if (!cfg.url || !cfg.key) {
    return res.status(200).json({ mode: 'local', synced: false, payload: null });
  }
  const row = await fetchStoreState(cfg);
  return res.status(200).json({
    mode: 'cloud',
    synced: true,
    updatedAt: row.updatedAt,
    payload: row.payload
  });
}

async function handlePost(req, cfg, res) {
  const body = parseBody(req.body);
  const action = String(req.query?.action || body?.action || 'sync');
  if (!cfg.url || !cfg.key) {
    return res.status(200).json({ ok: true, mode: 'local', persisted: false });
  }
  if (action === 'client-event') {
    const row = await fetchStoreState(cfg);
    const merged = mergeClientEvent(row.payload, body);
    const updatedAt = await upsertStoreState(cfg, merged);
    return res.status(200).json({ ok: true, mode: 'cloud', persisted: true, updatedAt });
  }
  if (!verifyBridgeAuth(req)) {
    return res.status(401).json({ error: 'Clé de pont non autorisée.' });
  }
  const updatedAt = await upsertStoreState(cfg, body.payload || body);
  return res.status(200).json({ ok: true, mode: 'cloud', persisted: true, updatedAt });
}

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  const cfg = readSupabaseConfig();
  try {
    if (req.method === 'GET') {
      return await handleGet(cfg, res);
    }
    if (req.method === 'POST') {
      return await handlePost(req, cfg, res);
    }
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  } catch (err) {
    return res.status(502).json({
      error: err?.message || 'Pont de synchronisation indisponible.'
    });
  }
}
