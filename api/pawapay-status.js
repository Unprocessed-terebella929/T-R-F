const UUID_RE = /^[0-9a-f-]{36}$/i;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const depositId = String(req.query?.depositId || '').trim();
  if (!UUID_RE.test(depositId)) {
    return res.status(400).json({ error: 'Identifiant de dépôt invalide.' });
  }

  const token = (process.env.PAWAPAY_API_TOKEN || '').trim();
  const baseUrl = (
    process.env.PAWAPAY_BASE_URL || 'https://api.sandbox.pawapay.io'
  ).replace(/\/$/, '');

  if (!token) {
    return res.status(503).json({
      error: 'Clé PAWAPAY_API_TOKEN manquante dans Vercel.'
    });
  }

  try {
    const response = await fetch(`${baseUrl}/deposits/${depositId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000)
    });

    const text = await response.text();
    const raw = text ? JSON.parse(text) : null;
    const record = Array.isArray(raw) ? raw[0] : raw;

    if (!response.ok || !record) {
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
