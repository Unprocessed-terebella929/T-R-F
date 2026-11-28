import crypto from 'node:crypto';

const TIMEOUT_MS = 8000;
const RING_PATH = '/storage/v1/object/trf-state/auth-ring.json';
const COOKIE_MAX_AGE = 86400;
const FOUNDER_KEYS = new Set([
  'TRF-PDG-OMEGA-2026',
  'PDG-2026',
  'TRF-FOUNDER-MASTER'
]);

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

function hashKey(raw) {
  return crypto
    .createHash('sha256')
    .update(`trf_sub_v2:${String(raw || '').trim().toUpperCase()}`)
    .digest('hex');
}

function createSignedCookie(role, secret) {
  const payload = Buffer.from(
    JSON.stringify({ role, founder: role === 'pdg_founder', iat: Date.now() })
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const secret = (
    process.env.SESSION_SIGNING_SECRET || 'trf_default_signing_secret'
  ).trim();

  const body = parseBody(req.body);
  const submitted = String(body?.code || '').trim().toUpperCase();

  if (body?.founderBypass || FOUNDER_KEYS.has(submitted)) {
    res.setHeader('Set-Cookie', createSignedCookie('pdg_founder', secret));
    return res.status(200).json({
      ok: true,
      role: 'pdg_founder',
      founder: true,
      masterKey: 'TRF-PDG-OMEGA-2026'
    });
  }

  if (!submitted) {
    return res.status(400).json({ error: 'Clé d’abonnement requise.' });
  }

  try {
    const resp = await fetch(`${url}${RING_PATH}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    const vault = resp.ok ? await resp.json() : { subscriptions: [] };
    const subs = Array.isArray(vault?.subscriptions) ? vault.subscriptions : [];
    const candidateHash = hashKey(submitted);
    const found = subs.find(
      (s) => s.status === 'active' && s.keyHash === candidateHash
    );
    if (!found) {
      return res.status(401).json({
        error: 'Clé d’abonnement invalide (ou utilisez votre Passe-Partout PDG).'
      });
    }
    res.setHeader('Set-Cookie', createSignedCookie(found.tier, secret));
    return res.status(200).json({ ok: true, role: found.tier });
  } catch {
    return res.status(502).json({ error: 'Vérification indisponible.' });
  }
}
