import { DELIVERY_SPHERES } from '../data/storeCatalog.js';
import { ShieldIcon } from './Icons.jsx';
import { Reveal } from './Reveal.jsx';

export function SuiviView({ orders }) {
  if (!orders.length) {
    return (
      <Reveal>
        <section className="archival-card rounded-2xl p-8 text-center space-y-2">
          <ShieldIcon className="w-6 h-6 mx-auto text-[#4E4634]/75" />
          <h2 className="font-display text-2xl">Aucun suivi en cours</h2>
          <p className="text-xs text-[#665E4E] max-w-md mx-auto">
            Votre suivi en 4 sphères apparaîtra automatiquement dès votre
            première commande validée.
          </p>
        </section>
      </Reveal>
    );
  }

  return (
    <section className="space-y-4">
      {orders.map((order, idx) => (
        <Reveal key={order.id} delay={idx * 70}>
          <div className="archival-card rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-display text-lg">{order.id}</span>
              <span className="text-[#665E4E]">
                {order.date} · {order.paymentMethod} ·{' '}
                <strong>{order.amount} $</strong>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DELIVERY_SPHERES.map((s) => {
                const reached = order.step >= s.step;
                return (
                  <div
                    key={s.step}
                    className={`rounded-xl px-3 py-2.5 text-xs border transition-colors ${
                      reached
                        ? 'bg-[#4E4634] text-[#FAF7F0] border-[#4E4634]'
                        : 'bg-[#F4EFE4] text-[#665E4E] border-[#4E4634]/15'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">0{s.step}</span>
                    <p className="font-medium mt-0.5">{s.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
