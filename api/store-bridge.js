import crypto from 'node:crypto';

const TIMEOUT_MS = 10000;
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

async function fetchStoreState(cfg) {
  const endpoint =
    `${cfg.url}/rest/v1/trf_store_state?id=eq.main&select=payload,updated_at`;
  const resp = await fetch(endpoint, {
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`
    },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!resp.ok) {
    throw new Error('Lecture Supabase impossible.');
  }
  const rows = await resp.json();
  return rows[0] || { payload: null, updated_at: null };
}

async function upsertStoreState(cfg, payload) {
  const endpoint = `${cfg.url}/rest/v1/trf_store_state`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify({
      id: 'main',
      payload,
      updated_at: new Date().toISOString()
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!resp.ok) {
    throw new Error('Écriture Supabase impossible.');
  }
  return resp.json();
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
    sealed: false
  };
  if (event.type === 'order' && event.item) {
    const orders = [event.item, ...(base.orders || [])].slice(0, 200);
    return { ...base, orders };
  }
  if (event.type === 'signature' && event.item) {
    const signatures = [event.item, ...(base.signatures || [])].slice(0, 100);
    return { ...base, signatures };
  }
  return base;
}

async function handleGet(cfg, res) {
  if (!cfg.url || !cfg.key) {
    return res.status(200).json({
      mode: 'local',
      synced: false,
      payload: null
    });
  }
  const row = await fetchStoreState(cfg);
  return res.status(200).json({
    mode: 'cloud',
    synced: true,
    updatedAt: row.updated_at,
    payload: row.payload
  });
}

async function handlePost(req, cfg, res) {
  const body = parseBody(req.body);
  const action = String(req.query?.action || body?.action || 'sync');
  if (!cfg.url || !cfg.key) {
    return res.status(200).json({
      ok: true,
      mode: 'local',
      persisted: false
    });
  }
  if (action === 'client-event') {
    const row = await fetchStoreState(cfg);
    const merged = mergeClientEvent(row.payload, body);
    await upsertStoreState(cfg, merged);
    return res.status(200).json({ ok: true, mode: 'cloud', persisted: true });
  }
  if (!verifyBridgeAuth(req)) {
    return res.status(401).json({ error: 'Clé de pont non autorisée.' });
  }
  await upsertStoreState(cfg, body.payload || body);
  return res.status(200).json({
    ok: true,
    mode: 'cloud',
    persisted: true,
    updatedAt: new Date().toISOString()
  });
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
