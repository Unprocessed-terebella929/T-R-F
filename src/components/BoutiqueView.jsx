import { useState } from 'react';
import { MAISONS } from '../data/storeCatalog.js';
import { PlusIcon, SearchIcon } from './Icons.jsx';
import { Reveal } from './Reveal.jsx';

const EMPTY_SLOTS = ['I', 'II', 'III'];

function EmptyCatalogGrid() {
  return (
    <div className="space-y-4">
      <Reveal>
        <div className="flex items-center justify-between border-y border-[#4E4634]/15 py-2.5 px-1">
          <span className="embroidered-mark">·⊹</span>
          <p className="text-xs text-[#665E4E] text-center">
            Catalogue vierge — prêt pour votre première sélection photographique.
          </p>
          <span className="embroidered-mark">⊹·</span>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {EMPTY_SLOTS.map((roman, index) => (
          <Reveal key={roman} delay={index * 90}>
            <div className="archival-card rounded-2xl p-4 flex flex-col justify-between min-h-[215px]">
              <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-[#665E4E]">
                <span>ARCHIVE {roman}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#C2B088] animate-archival-dot" />
              </div>
              <div className="my-6 border-y border-dashed border-[#4E4634]/20 py-5 text-center">
                <span className="font-display text-lg text-[#4E4634]/80">
                  Pièce à paraître
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="h-1.5 w-14 rounded-full bg-[#EAE2D2]" />
                <span className="text-[10px] tracking-[0.18em] text-[#665E4E]/70">
                  ÉDITION I
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function ProductTile({ item, index, onOpenStudio, onAddToCart }) {
  return (
    <Reveal delay={(index % 3) * 80}>
      <article className="archival-card rounded-2xl overflow-hidden flex flex-col h-full">
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
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#665E4E]">
              {item.category}
            </p>
            <h3 className="font-display text-lg text-[#1C1914] truncate">
              {item.title}
            </h3>
            <p className="text-xs font-bold text-[#4E4634]">
              {item.price > 0 ? `${item.price} $` : 'Sur demande'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="p-2.5 rounded-full btn-limewood shrink-0"
            aria-label="Ajouter au panier"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </article>
    </Reveal>
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
      <div className="rounded-2xl border border-[#4E4634]/15 bg-[#FAF7F0]/88 px-5 py-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
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
            <SearchIcon className="w-3.5 h-3.5 text-[#665E4E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="pl-8 pr-3 py-1.5 rounded-full border border-[#4E4634]/20 bg-white text-xs w-44 focus:outline-none focus:border-[#4E4634]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-[#4E4634]/20 bg-white text-xs text-[#1C1914] focus:outline-none"
          >
            <option value="recent">Récents</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {MAISONS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMaison(m.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
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
          {filtered.map((item, idx) => (
            <ProductTile
              key={item.id}
              item={item}
              index={idx}
              onOpenStudio={onOpenStudio}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
