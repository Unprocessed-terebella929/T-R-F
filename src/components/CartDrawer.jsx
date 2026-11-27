import { PawaPayCheckout } from './PawaPayCheckout.jsx';
import { CloseIcon, TrashIcon } from './Icons.jsx';

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
      className="fixed inset-0 z-40 bg-[#1C1914]/55 backdrop-blur-sm flex justify-end"
    >
      <aside className="w-full sm:max-w-md bg-[#FAF7F0] h-[100dvh] p-4 sm:p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col justify-between gap-4 shadow-2xl animate-rise">
        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-0.5">
          <div className="flex items-center justify-between border-b border-[#4E4634]/15 pb-3 shrink-0">
            <h2 className="font-display text-2xl">Votre sélection</h2>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full btn-vintage-ghost"
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
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F4EFE4] border border-[#4E4634]/10"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.title}</p>
                    <p className="text-[11px] text-[#4E4634]">{item.price} $</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="p-1.5 text-[#665E4E] hover:text-[#1C1914]"
                    aria-label="Retirer du panier"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-4 space-y-2.5 border-t border-[#4E4634]/15">
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span>{total} $</span>
            </div>
            <PawaPayCheckout total={total} onSuccessOrder={onCheckout} />
            <button
              type="button"
              onClick={() =>
                onCheckout({ paymentMethod: 'Paiement à la livraison' })
              }
              className="w-full py-2.5 rounded-xl text-xs font-medium btn-vintage-ghost"
            >
              Commander — Paiement à la livraison
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
