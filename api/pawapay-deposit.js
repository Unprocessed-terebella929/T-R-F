import crypto from 'node:crypto';

const CORRESPONDENTS = {
  mpesa: 'VODACOM_MPESA_COD',
  orange: 'ORANGE_COD',
  airtel: 'AIRTEL_COD'
};

const CURRENCIES = ['USD', 'CDF'];
const MAX_AMOUNT = 1000000;
const TIMEOUT_MS = 15000;
const DRC_PHONE_RE = /^243[0-9]{9}$/;
const DEFAULT_BASE_URL = 'https://api.sandbox.pawapay.io';

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
  if (!correspondent) {
    return { error: 'Opérateur Mobile Money non reconnu.' };
  }
  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    return { error: 'Montant invalide.' };
  }
  const phone = normalizePhone(body?.phone);
  if (!DRC_PHONE_RE.test(phone)) {
    return { error: 'Numéro RDC invalide (ex: 0812345678).' };
  }
  const currency = CURRENCIES.includes(body?.currency) ? body.currency : 'USD';
  return {
    correspondent,
    currency,
    amount: formatAmount(amount, currency),
    phone
  };
}

function buildDepositPayload(depositId, valid) {
  return {
    depositId,
    amount: valid.amount,
    currency: valid.currency,
    correspondent: valid.correspondent,
    payer: { type: 'MSISDN', address: { value: valid.phone } },
    customerTimestamp: new Date().toISOString(),
    statementDescription: 'Ta reference'
  };
}

function safeParseJson(text) {
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 120) };
  }
}

async function sendDepositRequest(baseUrl, token, payload) {
  const response = await fetch(`${baseUrl}/deposits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  const data = safeParseJson(await response.text());
  return { ok: response.ok, status: response.status, data };
}

function getRejectionMessage(data) {
  return (
    data?.rejectionReason?.rejectionMessage ||
    data?.errorMessage ||
    'Demande refusée par pawaPay.'
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }
  const token = (process.env.PAWAPAY_API_TOKEN || '').trim();
  if (!token) {
    return res.status(503).json({
      error: 'Clé PAWAPAY_API_TOKEN manquante dans Vercel.'
    });
  }
  const valid = validateInput(parseBody(req.body));
  if (valid.error) {
    return res.status(400).json({ error: valid.error });
  }
  const baseUrl = (process.env.PAWAPAY_BASE_URL || DEFAULT_BASE_URL).replace(
    /\/$/,
    ''
  );
  const depositId = crypto.randomUUID();
  try {
    const payload = buildDepositPayload(depositId, valid);
    const result = await sendDepositRequest(baseUrl, token, payload);
    if (!result.ok || result.data?.status === 'REJECTED') {
      const code = result.ok ? 400 : result.status;
      return res.status(code).json({
        error: getRejectionMessage(result.data),
        status: result.data?.status || 'REJECTED'
      });
    }
    return res.status(200).json({
      depositId,
      status: result.data?.status || 'ACCEPTED',
      correspondent: valid.correspondent
    });
  } catch (err) {
    return res.status(502).json({
      error: 'Connexion impossible à pawaPay. Réessayez.',
      code: err?.name || 'NETWORK_ERROR'
    });
  }
}
