import crypto from 'node:crypto';

const ATTEMPTS = new Map();
const MAX_TRIES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const COOKIE_MAX_AGE = 7200;
const TIMEOUT_MS = 8000;
const RING_PATH = '/storage/v1/object/trf-state/auth-ring.json';

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

function getClientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '');
  return fwd.split(',')[0].trim() || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ATTEMPTS.get(ip);
  if (!entry || now > entry.resetAt) {
    ATTEMPTS.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return entry.count >= MAX_TRIES;
}

function recordFailure(ip) {
  const now = Date.now();
  const entry = ATTEMPTS.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  entry.count += 1;
  ATTEMPTS.set(ip, entry);
}

function hashPassword(raw) {
  return crypto
    .createHash('sha256')
    .update(`trf_salt_v1:${String(raw || '').trim()}`)
    .digest('hex');
}

function safeEqualHex(hexA, hexB) {
  if (!hexA || !hexB || hexA.length !== hexB.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(hexA), Buffer.from(hexB));
}

function createSignedCookie(role, secret) {
  const payload = Buffer.from(
    JSON.stringify({ role, iat: Date.now() })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  return [
    `trf_session=${payload}.${sig}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE}`
  ].join('; ');
}

function readFallbackRing() {
  try {
    const raw = process.env.ADMIN_KEY_RING;
    if (raw) {
      const keys = JSON.parse(raw);
      return { strictSequential: false, activeIndex: 0, rotationCount: 0, keys };
    }
  } catch {
    // ignore malformed fallback
  }
  return { strictSequential: false, activeIndex: 0, rotationCount: 0, keys: [] };
}

async function loadRing() {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) {
    return readFallbackRing();
  }
  try {
    const resp = await fetch(`${url}${RING_PATH}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!resp.ok) {
      return readFallbackRing();
    }
    return await resp.json();
  } catch {
    return readFallbackRing();
  }
}

async function saveRing(ring) {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) {
    return;
  }
  try {
    await fetch(`${url}${RING_PATH}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true'
      },
      body: JSON.stringify(ring),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
  } catch {
    // non-blocking rotation persist
  }
}

function matchKeyInRing(submitted, ring) {
  const candidateHash = hashPassword(submitted);
  const keys = Array.isArray(ring?.keys) ? ring.keys : [];
  if (!keys.length) {
    return null;
  }
  const activeIdx = Number(ring.activeIndex || 0) % keys.length;
  if (ring.strictSequential) {
    const target = keys[activeIdx];
    return safeEqualHex(candidateHash, target?.hash)
      ? { key: target, index: activeIdx }
      : null;
  }
  for (let i = 0; i < keys.length; i += 1) {
    if (safeEqualHex(candidateHash, keys[i]?.hash)) {
      return { key: keys[i], index: i };
    }
  }
  return null;
}

export default async function handler(req, res) {
  const ring = await loadRing();
  const keys = Array.isArray(ring?.keys) ? ring.keys : [];
  const activeIdx = keys.length ? Number(ring.activeIndex || 0) % keys.length : 0;

  if (req.method === 'GET') {
    const activeKey = keys[activeIdx] || null;
    return res.status(200).json({
      totalKeys: keys.length,
      activeSlot: activeIdx + 1,
      activeHint: activeKey?.hint || '•••',
      strictSequential: Boolean(ring.strictSequential),
      rotationCount: Number(ring.rotationCount || 0)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Trop de tentatives (15 min).' });
  }
  const secret = (process.env.SESSION_SIGNING_SECRET || '').trim();
  if (!secret || !keys.length) {
    return res.status(503).json({ error: 'Trousseau de clés non initialisé.' });
  }
  const submitted = String(parseBody(req.body)?.code || '').trim();
  const matched = matchKeyInRing(submitted, ring);
  if (!matched) {
    recordFailure(ip);
    const hint = ring.strictSequential
      ? `Clé attendue en rotation : #${activeIdx + 1} (${keys[activeIdx]?.hint}).`
      : 'Mot de passe incorrect.';
    return res.status(401).json({ error: hint });
  }

  ATTEMPTS.delete(ip);
  const nextIndex = (matched.index + 1) % keys.length;
  const nowIso = new Date().toISOString();
  const nextRing = {
    ...ring,
    activeIndex: nextIndex,
    rotationCount: Number(ring.rotationCount || 0) + 1,
    updatedAt: nowIso,
    keys: keys.map((k, idx) =>
      idx === matched.index ? { ...k, lastUsedAt: nowIso.slice(0, 16).replace('T', ' ') } : k
    )
  };
  await saveRing(nextRing);

  const role = matched.key.role || 'admin_plus';
  res.setHeader('Set-Cookie', createSignedCookie(role, secret));
  return res.status(200).json({
    ok: true,
    role,
    usedSlot: matched.index + 1,
    nextSlot: nextIndex + 1,
    nextHint: keys[nextIndex]?.hint || '•••',
    rotationCount: nextRing.rotationCount
  });
}
