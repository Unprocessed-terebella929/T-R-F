import { PawaPayCheckout } from './PawaPayCheckout.jsx';
import { CloseIcon, TrashIcon } from './Icons.jsx';

const BACKDROP_CLS =
  'fixed inset-0 z-40 bg-[#1C1914]/55 backdrop-blur-sm flex justify-end';
const ASIDE_CLS = [
  'w-full sm:max-w-md bg-[#FAF7F0] h-[100dvh] p-4 sm:p-5',
  'pt-[max(1.25rem,env(safe-area-inset-top))]',
  'pb-[max(1.25rem,env(safe-area-inset-bottom))]',
  'flex flex-col justify-between gap-4 shadow-2xl animate-rise'
].join(' ');
const CLOSE_BTN_CLS = [
  'min-w-[40px] min-h-[40px] flex items-center justify-center',
  'rounded-full btn-vintage-ghost'
].join(' ');

const ROW_CLS = [
  'flex items-center gap-3 p-2.5 rounded-xl',
  'bg-[#F4EFE4] border border-[#4E4634]/10'
].join(' ');
const REMOVE_BTN_CLS = [
  'min-w-[36px] min-h-[36px] flex items-center justify-center',
  'text-[#665E4E] hover:text-[#1C1914]'
].join(' ');
const HEAD_ROW_CLS = [
  'flex items-center justify-between',
  'border-b border-[#4E4634]/15 pb-3 shrink-0'
].join(' ');

function CartItemRow({ item, onRemove }) {
  return (
    <div className={ROW_CLS}>
      <img
        src={item.image}
        alt={item.title}
        className="w-12 h-14 object-cover rounded-lg shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate">{item.title}</p>
        <p className="text-[11px] text-[#4E4634]">{item.price} $</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className={REMOVE_BTN_CLS}
        aria-label="Retirer du panier"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function CartSummary({ total, onCheckout }) {
  return (
    <div className="pt-4 space-y-2.5 border-t border-[#4E4634]/15 shrink-0">
      <div className="flex justify-between text-sm font-bold">
        <span>Total</span>
        <span>{total} $</span>
      </div>
      <PawaPayCheckout total={total} onSuccessOrder={onCheckout} />
      <button
        type="button"
        onClick={() => onCheckout({ paymentMethod: 'Paiement à la livraison' })}
        className="w-full py-2.5 min-h-[42px] rounded-xl text-xs font-medium btn-vintage-ghost"
      >
        Commander — Paiement à la livraison
      </button>
    </div>
  );
}

export function CartDrawer({ isOpen, items, onClose, onRemove, onCheckout }) {
  if (!isOpen) {
    return null;
  }
  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panier"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={BACKDROP_CLS}
    >
      <aside className={ASIDE_CLS}>
        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-0.5">
          <div className={HEAD_ROW_CLS}>
            <h2 className="font-display text-2xl">Votre sélection</h2>
            <button
              type="button"
              onClick={onClose}
              className={CLOSE_BTN_CLS}
              aria-label="Fermer le panier"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-[#665E4E] text-center py-10">
              Votre panier est actuellement vide.
            </p>
          ) : (
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <CartItemRow
                  key={`${item.id}-${idx}`}
                  item={item}
                  onRemove={() => onRemove(idx)}
                />
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <CartSummary total={total} onCheckout={onCheckout} />
        )}
      </aside>
    </div>
  );
}
