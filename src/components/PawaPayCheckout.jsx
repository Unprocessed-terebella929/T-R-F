import { useState } from 'react';
import {
  MOBILE_OPERATORS,
  initiatePawaPayDeposit,
  checkPawaPayStatus
} from '../security/pawapayClient.js';

export function PawaPayCheckout({ total, onSuccessOrder }) {
  const [operator, setOperator] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [statusMsg, setStatusMsg] = useState('');
  const [depositId, setDepositId] = useState('');
  const [busy, setBusy] = useState(false);

  const handlePay = async (event) => {
    event.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    setStatusMsg('Connexion sécurisée vers pawaPay...');
    try {
      const res = await initiatePawaPayDeposit({
        operator,
        phone,
        amount: total,
        currency
      });
      setDepositId(res.depositId);
      setStatusMsg('Demande acceptée. Confirmez sur votre téléphone.');
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!depositId || busy) {
      return;
    }
    setBusy(true);
    try {
      const res = await checkPawaPayStatus(depositId);
      setStatusMsg(`Statut pawaPay : ${res.status}`);
      if (res.status === 'COMPLETED' || res.status === 'ACCEPTED') {
        onSuccessOrder({
          paymentMethod: `pawaPay (${operator.toUpperCase()})`,
          depositId
        });
      }
    } catch (err) {
      setStatusMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handlePay}
      className="space-y-3 pt-3 border-t border-[#4E4634]/15"
    >
      <div className="flex items-center justify-between">
        <span className="embroidered-mark">·⊹</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4E4634]">
          Mobile Money RDC (pawaPay)
        </span>
        <span className="embroidered-mark">⊹·</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {MOBILE_OPERATORS.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => setOperator(op.id)}
            className={`py-2.5 px-1.5 min-h-[40px] rounded-xl text-[11px] font-medium truncate ${
              operator === op.id ? 'btn-limewood' : 'btn-vintage-ghost'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 min-w-0">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0812345678 ou 243..."
          className="flex-1 min-w-0 px-3 py-2.5 min-h-[42px] rounded-xl border border-[#4E4634]/25 text-xs bg-white"
          required
        />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label="Devise"
          className="shrink-0 px-2.5 py-2.5 min-h-[42px] rounded-xl border border-[#4E4634]/25 text-xs bg-white font-bold"
        >
          <option value="USD">USD</option>
          <option value="CDF">CDF</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full py-2.5 rounded-xl text-xs font-medium btn-limewood disabled:opacity-50"
      >
        {busy ? 'Traitement...' : `Payer ${total} ${currency} via pawaPay`}
      </button>

      {depositId && (
        <button
          type="button"
          onClick={handleVerify}
          disabled={busy}
          className="w-full py-2 rounded-xl text-xs font-medium btn-vintage-ghost"
        >
          Vérifier la confirmation ({depositId.slice(0, 8)}...)
        </button>
      )}

      {statusMsg && (
        <p className="text-[11px] text-center font-medium text-[#4E4634]">
          {statusMsg}
        </p>
      )}
    </form>
  );
}
