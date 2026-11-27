import crypto from 'node:crypto';

const ATTEMPTS = new Map();
const MAX_TRIES = 5;
const WINDOW_MS = 15 * 60 * 1000;

function parseBody(raw) {
  if (!raw) {
    return {};
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
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

function safeCompare(a, b) {
  if (!a || !b) {
    return false;
  }
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
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
    'Max-Age=7200'
  ].join('; ');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: 'Trop de tentatives. Réessayez dans 15 minutes.'
    });
  }

  const adminKey = (process.env.ADMIN_ACCESS_KEY || '').trim();
  const adminPlusKey = (process.env.ADMIN_PLUS_ACCESS_KEY || '').trim();
  const secret = (process.env.SESSION_SIGNING_SECRET || '').trim();

  if (!adminKey || !secret) {
    return res.status(503).json({
      error: 'Variables ADMIN_ACCESS_KEY ou SESSION_SIGNING_SECRET manquantes.'
    });
  }

  const body = parseBody(req.body);
  const submitted = String(body?.code || '').trim();

  let role = '';
  if (adminPlusKey && safeCompare(submitted, adminPlusKey)) {
    role = 'admin_plus';
  } else if (safeCompare(submitted, adminKey)) {
    role = 'admin';
  }

  if (!role) {
    recordFailure(ip);
    return res.status(401).json({ error: 'Clé privée incorrecte.' });
  }

  ATTEMPTS.delete(ip);
  res.setHeader('Set-Cookie', createSignedCookie(role, secret));
  return res.status(200).json({ ok: true, role });
}
