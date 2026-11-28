import { useState } from 'react';
import {
  MOBILE_OPERATORS,
  initiatePawaPayDeposit,
  checkPawaPayStatus
} from '../security/pawapayClient.js';

const PHONE_INPUT_CLS = [
  'flex-1 min-w-0 px-3 py-2.5 min-h-[42px]',
  'rounded-xl border border-[#4E4634]/25 text-xs bg-white'
].join(' ');
const CURRENCY_CLS = [
  'shrink-0 px-2.5 py-2.5 min-h-[42px]',
  'rounded-xl border border-[#4E4634]/25 text-xs bg-white font-bold'
].join(' ');
const OP_BTN_CLS = [
  'py-2.5 px-1.5 min-h-[40px] rounded-xl',
  'text-[11px] font-medium truncate'
].join(' ');
const LABEL_CLS = [
  'text-[10px] font-bold uppercase tracking-[0.16em]',
  'text-[#4E4634] text-center'
].join(' ');
const PAY_BTN_CLS = [
  'w-full py-2.5 min-h-[42px] rounded-xl text-xs',
  'font-medium btn-limewood disabled:opacity-50'
].join(' ');

function OperatorSelector({ operator, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {MOBILE_OPERATORS.map((op) => {
        const cls = operator === op.id ? 'btn-limewood' : 'btn-vintage-ghost';
        return (
          <button
            key={op.id}
            type="button"
            onClick={() => onSelect(op.id)}
            className={`${OP_BTN_CLS} ${cls}`}
          >
            {op.label}
          </button>
        );
      })}
    </div>
  );
}

function PhoneCurrencyRow({ phone, onPhone, currency, onCurrency }) {
  return (
    <div className="flex gap-2 min-w-0">
      <input
        type="tel"
        value={phone}
        onChange={(e) => onPhone(e.target.value)}
        placeholder="0812345678 ou 243..."
        className={PHONE_INPUT_CLS}
        required
      />
      <select
        value={currency}
        onChange={(e) => onCurrency(e.target.value)}
        aria-label="Devise"
        className={CURRENCY_CLS}
      >
        <option value="USD">USD</option>
        <option value="CDF">CDF</option>
      </select>
    </div>
  );
}

async function runDepositRequest(payload, onAccepted, onMessage) {
  onMessage('Connexion sécurisée vers pawaPay...');
  try {
    const res = await initiatePawaPayDeposit(payload);
    onAccepted(res.depositId);
    onMessage('Demande acceptée. Confirmez sur votre téléphone.');
  } catch (err) {
    onMessage(err.message);
  }
}

async function runStatusVerify(depositId, operator, onSuccess, onMessage) {
  try {
    const res = await checkPawaPayStatus(depositId);
    onMessage(`Statut pawaPay : ${res.status}`);
    if (res.status === 'COMPLETED' || res.status === 'ACCEPTED') {
      onSuccess({
        paymentMethod: `pawaPay (${operator.toUpperCase()})`,
        depositId
      });
    }
  } catch (err) {
    onMessage(err.message);
  }
}

function usePawaPayFlow(total, onSuccessOrder) {
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
    await runDepositRequest(
      { operator, phone, amount: total, currency },
      setDepositId,
      setStatusMsg
    );
    setBusy(false);
  };

  const handleVerify = async () => {
    if (!depositId || busy) {
      return;
    }
    setBusy(true);
    await runStatusVerify(depositId, operator, onSuccessOrder, setStatusMsg);
    setBusy(false);
  };

  return {
    operator,
    setOperator,
    phone,
    setPhone,
    currency,
    setCurrency,
    statusMsg,
    depositId,
    busy,
    handlePay,
    handleVerify
  };
}

export function PawaPayCheckout({ total, onSuccessOrder }) {
  const flow = usePawaPayFlow(total, onSuccessOrder);
  const payLabel = flow.busy
    ? 'Traitement...'
    : `Payer ${total} ${flow.currency} via pawaPay`;

  return (
    <form
      onSubmit={flow.handlePay}
      className="space-y-3 pt-3 border-t border-[#4E4634]/15"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="embroidered-mark shrink-0">·⊹</span>
        <span className={LABEL_CLS}>Mobile Money RDC (pawaPay)</span>
        <span className="embroidered-mark shrink-0">⊹·</span>
      </div>
      <OperatorSelector operator={flow.operator} onSelect={flow.setOperator} />
      <PhoneCurrencyRow
        phone={flow.phone}
        onPhone={flow.setPhone}
        currency={flow.currency}
        onCurrency={flow.setCurrency}
      />
      <button type="submit" disabled={flow.busy} className={PAY_BTN_CLS}>
        {payLabel}
      </button>
      {flow.depositId && (
        <button
          type="button"
          onClick={flow.handleVerify}
          disabled={flow.busy}
          className="w-full py-2 min-h-[40px] rounded-xl text-xs font-medium btn-vintage-ghost"
        >
          Vérifier la confirmation ({flow.depositId.slice(0, 8)}...)
        </button>
      )}
      {flow.statusMsg && (
        <p className="text-[11px] text-center font-medium text-[#4E4634]">
          {flow.statusMsg}
        </p>
      )}
    </form>
  );
}
