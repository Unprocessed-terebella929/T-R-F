const VALID_TYPES = ['deposit', 'payout', 'refund', 'remittance'];

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

export default function handler(req, res) {
  const rawType = String(req.query?.type || 'deposit').toLowerCase();
  const type = VALID_TYPES.includes(rawType) ? rawType : 'deposit';

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, endpoint: type });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const event = parseBody(req.body);
  const reference =
    event?.depositId ||
    event?.payoutId ||
    event?.refundId ||
    event?.remittanceId ||
    'unknown';

  return res.status(200).json({
    received: true,
    type,
    reference: String(reference).slice(0, 64),
    status: String(event?.status || 'RECEIVED').slice(0, 32)
  });
}
