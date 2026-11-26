import { X, Trash2 } from 'lucide-react';
import { PawaPayCheckout } from './PawaPayCheckout.jsx';

export function CartDrawer({ isOpen, items, onClose, onRemove, onCheckout }) {
  if (!isOpen) {
    return null;
  }
  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div className="fixed inset-0 z-40 bg-[#1C1914]/55 backdrop-blur-xs flex justify-end">
      <aside className="w-full max-w-md bg-[#FAF7F0] h-full p-5 flex flex-col justify-between shadow-2xl animate-rise">
        <div className="space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#4E4634]/15 pb-3">
            <h2 className="font-display text-2xl">Votre sélection</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full btn-vintage-ghost"
              aria-label="Fermer le panier"
            >
              <X className="w-4 h-4" />
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
                    <Trash2 className="w-3.5 h-3.5" />
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
