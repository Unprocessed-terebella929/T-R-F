import { useState } from 'react';
import { Search, Plus, RotateCw, Feather, PackageCheck } from 'lucide-react';
import {
  DELIVERY_SPHERES,
  MAISONS,
  SIGNATURE_INKS
} from '../data/storeCatalog.js';
import { sanitizeText } from '../security/vaultCore.js';

function EmptyCatalogGrid() {
  const slots = ['I', 'II', 'III'];
  return (
    <div className="space-y-4 animate-rise">
      <div className="flex items-center justify-between border-y border-[#4E4634]/15 py-2.5 px-1">
        <span className="embroidered-mark">·⊹</span>
        <p className="text-xs text-[#665E4E] text-center">
          Catalogue vierge — prêt à accueillir votre première sélection photographique.
        </p>
        <span className="embroidered-mark">⊹·</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {slots.map((roman) => (
          <div
            key={roman}
            className="archival-card rounded-2xl p-4 flex flex-col justify-between min-h-[210px]"
          >
            <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-[#665E4E]">
              <span>ARCHIVE {roman}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C2B088] animate-archival-line" />
            </div>
            <div className="my-6 border-y border-dashed border-[#4E4634]/20 py-5 text-center">
              <span className="font-display text-lg text-[#4E4634]/75">
                Pièce à paraître
              </span>
            </div>
            <div className="h-1.5 w-14 rounded-full bg-[#EAE2D2]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BoutiqueView({ products, onAddToCart, onOpenStudio }) {
  const [maison, setMaison] = useState('tous');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const filtered = products
    .filter((item) => maison === 'tous' || item.category === maison)
    .filter((item) =>
      item.title.toLowerCase().includes(query.trim().toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'asc') {
        return a.price - b.price;
      }
      if (sortBy === 'desc') {
        return b.price - a.price;
      }
      return 0;
    });

  return (
    <section className="space-y-6 animate-rise">
      <div className="rounded-2xl border border-[#4E4634]/15 bg-[#FAF7F0]/80 px-5 py-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#665E4E]">
            Maison de sélection · Kinshasa
          </p>
          <h1 className="font-display text-2xl sm:text-3xl text-[#1C1914]">
            L’essentiel, bien choisi.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#665E4E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-8 pr-3 py-1.5 rounded-full border border-[#4E4634]/20 bg-white text-xs w-44"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-[#4E4634]/20 bg-white text-xs text-[#1C1914]"
          >
            <option value="recent">Récents</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {MAISONS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMaison(m.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              maison === m.id ? 'btn-limewood' : 'btn-vintage-ghost'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyCatalogGrid />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="archival-card rounded-2xl overflow-hidden flex flex-col"
            >
              <button
                type="button"
                onClick={() => onOpenStudio(item)}
                className="aspect-[4/5] bg-[#EAE2D2] overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </button>
              <div className="p-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#665E4E]">
                    {item.category}
                  </p>
                  <h3 className="font-display text-lg text-[#1C1914]">
                    {item.title}
                  </h3>
                  <p className="text-xs font-bold text-[#4E4634]">
                    {item.price > 0 ? `${item.price} $` : 'Sur demande'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddToCart(item)}
                  className="p-2.5 rounded-full btn-limewood"
                  aria-label="Ajouter au panier"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function StudioView({ activeItem, products }) {
  const [angle, setAngle] = useState(0);
  const target = activeItem || products[0] || null;

  if (!target) {
    return (
      <section className="archival-card rounded-2xl p-8 text-center space-y-2 animate-rise">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#665E4E]">
          Studio d’examen
        </p>
        <h2 className="font-display text-2xl">Aucune pièce sélectionnée</h2>
        <p className="text-xs text-[#665E4E]">
          Dès que vos premières photographies seront publiées, elles pourront être
          inspectées ici en détail.
        </p>
      </section>
    );
  }

  return (
    <section className="archival-card rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center animate-rise">
      <div className="aspect-[4/5] rounded-xl bg-[#EAE2D2] overflow-hidden flex items-center justify-center">
        <img
          src={target.image}
          alt={target.title}
          style={{ transform: `rotate(${angle}deg)` }}
          className="w-full h-full object-cover transition-transform duration-500"
        />
      </div>
      <div className="space-y-4">
        <span className="embroidered-mark">·⊹ STUDIO ⊹·</span>
        <h2 className="font-display text-3xl text-[#1C1914]">{target.title}</h2>
        <p className="text-sm font-bold text-[#4E4634]">
          {target.price > 0 ? `${target.price} USD` : 'Prix sur demande'}
        </p>
        <button
          type="button"
          onClick={() => setAngle((prev) => prev + 90)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium btn-vintage-ghost"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Pivoter l’angle</span>
        </button>
      </div>
    </section>
  );
}

export function SuiviView({ orders }) {
  if (!orders.length) {
    return (
      <section className="archival-card rounded-2xl p-8 text-center space-y-2 animate-rise">
        <PackageCheck className="w-6 h-6 mx-auto text-[#4E4634]/70" />
        <h2 className="font-display text-2xl">Aucun suivi en cours</h2>
        <p className="text-xs text-[#665E4E]">
          Votre suivi en 4 étapes apparaîtra automatiquement après votre première
          commande.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4 animate-rise">
      {orders.map((order) => (
        <div key={order.id} className="archival-card rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-display text-lg">{order.id}</span>
            <span className="text-[#665E4E]">
              {order.date} · {order.paymentMethod} · <strong>{order.amount} $</strong>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DELIVERY_SPHERES.map((s) => {
              const reached = order.step >= s.step;
              return (
                <div
                  key={s.step}
                  className={`rounded-xl px-3 py-2.5 text-xs border ${
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
      ))}
    </section>
  );
}

export function SignaturesView({ signatures, onAddSignature }) {
  const [author, setAuthor] = useState('');
  const [note, setNote] = useState('');
  const [ink, setInk] = useState(SIGNATURE_INKS[0].hex);

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanAuthor = sanitizeText(author, 40);
    const cleanNote = sanitizeText(note, 120);
    if (!cleanAuthor || !cleanNote) {
      return;
    }
    onAddSignature({
      id: `SIG-${Date.now()}`,
      author: cleanAuthor,
      note: cleanNote,
      ink,
      date: new Date().toISOString().split('T')[0]
    });
    setAuthor('');
    setNote('');
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-rise">
      <form onSubmit={handleSubmit} className="archival-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#4E4634]">
          <Feather className="w-4 h-4" />
          <span className="uppercase tracking-[0.16em]">Livre de Signatures</span>
        </div>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Votre nom ou initiales"
          className="w-full px-3.5 py-2 rounded-xl border border-[#4E4634]/20 bg-white text-xs"
          required
        />
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Votre appréciation..."
          className="w-full px-3.5 py-2 rounded-xl border border-[#4E4634]/20 bg-white text-xs"
          required
        />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {SIGNATURE_INKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setInk(item.hex)}
                className={`w-5 h-5 rounded-full border-2 ${
                  ink === item.hex ? 'border-[#C2B088] scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: item.hex }}
                title={item.label}
              />
            ))}
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-full text-xs font-medium btn-limewood"
          >
            Apposer
          </button>
        </div>
      </form>

      <div className="archival-card rounded-2xl p-5 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#665E4E]">
          Registre ({signatures.length})
        </p>
        {signatures.length === 0 ? (
          <p className="text-xs text-[#665E4E] py-6 text-center">
            Aucune signature enregistrée pour le moment.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {signatures.map((sig) => (
              <div
                key={sig.id}
                className="p-3 rounded-xl bg-[#F4EFE4]/80 border border-[#4E4634]/10"
              >
                <p className="text-xs italic" style={{ color: sig.ink }}>
                  « {sig.note} »
                </p>
                <p className="text-[10px] text-[#665E4E] mt-1">
                  — {sig.author} · {sig.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
