import { useState } from 'react';
import { MAISONS } from '../data/storeCatalog.js';
import { PlusIcon, SearchIcon } from './Icons.jsx';
import { Reveal } from './Reveal.jsx';

const EMPTY_SLOTS = ['I', 'II', 'III'];

function updateSpotlight(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
}

function EmptyCatalogGrid() {
  return (
    <div className="space-y-4">
      <Reveal>
        <div className="flex items-center justify-between gap-2 border-y border-[#4E4634]/15 py-2.5 px-1">
          <span className="embroidered-mark shrink-0">
            ·⊹ <span className="text-[#C2B088] animate-sparkle">✦</span>
          </span>
          <p className="text-[11px] sm:text-xs text-[#665E4E] text-center leading-snug">
            Catalogue vierge — prêt pour votre première sélection photographique.
          </p>
          <span className="embroidered-mark shrink-0">
            <span className="text-[#C2B088] animate-sparkle">✦</span> ⊹·
          </span>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {EMPTY_SLOTS.map((roman, index) => (
          <Reveal key={roman} delay={index * 95}>
            <div
              onMouseMove={updateSpotlight}
              style={{ '--glint-delay': `${index * 1.8}s` }}
              className="archival-card archival-ambient rounded-2xl p-4 flex flex-col justify-between min-h-[215px]"
            >
              <div className="relative z-10 flex items-center justify-between text-[10px] tracking-[0.2em] text-[#665E4E]">
                <span>ARCHIVE {roman}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#C2B088] animate-archival-dot" />
              </div>
              <div className="relative z-10 my-6 border-y border-dashed border-[#4E4634]/20 py-5 text-center space-y-1">
                <div className="flex justify-center">
                  <span className="text-[10px] text-[#C2B088] animate-sparkle">
                    ✦
                  </span>
                </div>
                <span className="block font-display text-lg text-[#4E4634]/85">
                  Pièce à paraître
                </span>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <span className="h-1.5 w-14 rounded-full bg-[#EAE2D2]" />
                <span className="text-[10px] tracking-[0.18em] text-[#665E4E]/75">
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
      <article
        onMouseMove={updateSpotlight}
        className="archival-card rounded-2xl overflow-hidden flex flex-col h-full"
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
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full btn-limewood shrink-0"
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
      <div className="bling-banner rounded-2xl border border-[#4E4634]/15 bg-[#FAF7F0]/90 px-4 sm:px-5 lg:px-6 py-4 sm:py-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#665E4E] flex items-center gap-1.5">
            <span className="text-[#C2B088] animate-sparkle">✦</span>
            <span>Maison de sélection · Kinshasa</span>
          </p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#1C1914] leading-tight">
            L’essentiel, bien choisi.
          </h1>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:w-52 lg:w-60 min-w-0">
            <SearchIcon className="w-3.5 h-3.5 text-[#665E4E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[36px] rounded-full border border-[#4E4634]/20 bg-white text-xs focus:outline-none focus:border-[#4E4634]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Trier les pièces"
            className="w-full sm:w-auto px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-[36px] rounded-full border border-[#4E4634]/20 bg-white text-xs text-[#1C1914] focus:outline-none focus:border-[#4E4634]"
          >
            <option value="recent">Récents</option>
            <option value="asc">Prix croissant</option>
            <option value="desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar -mx-0.5 px-0.5">
        {MAISONS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMaison(m.id)}
            className={`px-3.5 py-2 sm:py-1.5 min-h-[36px] rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
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
