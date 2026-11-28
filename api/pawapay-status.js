const UUID_RE = /^[0-9a-f-]{36}$/i;
const TIMEOUT_MS = 15000;
const DEFAULT_BASE_URL = 'https://api.sandbox.pawapay.io';

function extractRecord(text) {
  if (!text) {
    return null;
  }
  const raw = JSON.parse(text);
  return Array.isArray(raw) ? raw[0] : raw;
}

async function fetchDeposit(baseUrl, token, depositId) {
  const response = await fetch(`${baseUrl}/deposits/${depositId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  const record = extractRecord(await response.text());
  return { ok: response.ok, record };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
  const depositId = String(req.query?.depositId || '').trim();
  if (!UUID_RE.test(depositId)) {
    return res.status(400).json({ error: 'Identifiant de dépôt invalide.' });
  }
  const token = (process.env.PAWAPAY_API_TOKEN || '').trim();
  if (!token) {
    return res.status(503).json({
      error: 'Clé PAWAPAY_API_TOKEN manquante dans Vercel.'
    });
  }
  const baseUrl = (process.env.PAWAPAY_BASE_URL || DEFAULT_BASE_URL).replace(
    /\/$/,
    ''
  );
  try {
    const { ok, record } = await fetchDeposit(baseUrl, token, depositId);
    if (!ok || !record) {
      return res.status(404).json({ error: 'Transaction introuvable.' });
    }
    return res.status(200).json({
      depositId: record.depositId || depositId,
      status: record.status || 'SUBMITTED',
      failureReason: record.failureReason || null
    });
  } catch (err) {
    return res.status(502).json({
      error: 'Vérification indisponible pour le moment.',
      code: err?.name || 'NETWORK_ERROR'
    });
  }
}
