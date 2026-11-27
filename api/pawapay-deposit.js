import crypto from 'node:crypto';

const CORRESPONDENTS = {
  mpesa: 'VODACOM_MPESA_COD',
  orange: 'ORANGE_COD',
  airtel: 'AIRTEL_COD'
};

const CURRENCIES = ['USD', 'CDF'];
const MAX_AMOUNT = 1000000;
const DRC_PHONE_RE = /^243[0-9]{9}$/;

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

function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return `243${digits.slice(1)}`;
  }
  return digits;
}

function formatAmount(amount, currency) {
  if (currency === 'CDF') {
    return String(Math.round(amount));
  }
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function validateInput(body) {
  const correspondent = CORRESPONDENTS[body?.operator];
  const currency = CURRENCIES.includes(body?.currency)
    ? body.currency
    : 'USD';
  const amount = Number(body?.amount);
  const phone = normalizePhone(body?.phone);

  if (!correspondent) {
    return { error: 'Opérateur Mobile Money non reconnu.' };
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    return { error: 'Montant invalide.' };
  }
  if (!DRC_PHONE_RE.test(phone)) {
    return { error: 'Numéro RDC invalide (ex: 0812345678 ou 243812345678).' };
  }
  return {
    correspondent,
    currency,
    amount: formatAmount(amount, currency),
    phone
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
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

  const valid = validateInput(parseBody(req.body));
  if (valid.error) {
    return res.status(400).json({ error: valid.error });
  }

  const depositId = crypto.randomUUID();
  const payload = {
    depositId,
    amount: valid.amount,
    currency: valid.currency,
    correspondent: valid.correspondent,
    payer: {
      type: 'MSISDN',
      address: { value: valid.phone }
    },
    customerTimestamp: new Date().toISOString(),
    statementDescription: 'Ta reference'
  };

  try {
    const response = await fetch(`${baseUrl}/deposits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text.slice(0, 120) };
    }

    if (!response.ok || data?.status === 'REJECTED') {
      const reason =
        data?.rejectionReason?.rejectionMessage ||
        data?.errorMessage ||
        'Demande refusée par pawaPay.';
      return res.status(response.ok ? 400 : response.status).json({
        error: reason,
        status: data?.status || 'REJECTED'
      });
    }

    return res.status(200).json({
      depositId,
      status: data?.status || 'ACCEPTED',
      correspondent: valid.correspondent
    });
  } catch (err) {
    return res.status(502).json({
      error: 'Connexion impossible à pawaPay. Réessayez.',
      code: err?.name || 'NETWORK_ERROR'
    });
  }
}
