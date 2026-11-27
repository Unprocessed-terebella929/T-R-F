export const MOBILE_OPERATORS = [
  { id: 'mpesa', label: 'M-Pesa' },
  { id: 'orange', label: 'Orange Money' },
  { id: 'airtel', label: 'Airtel Money' }
];

export async function initiatePawaPayDeposit({
  operator,
  phone,
  amount,
  currency
}) {
  const response = await fetch('/api/pawapay-deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operator, phone, amount, currency })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Échec de la demande pawaPay.');
  }
  return data;
}

export async function checkPawaPayStatus(depositId) {
  const url = `/api/pawapay-status?depositId=${encodeURIComponent(depositId)}`;
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Impossible de vérifier le paiement.');
  }
  return data;
}
