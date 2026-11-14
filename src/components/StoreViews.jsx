import { useState } from 'react';

function getCatCardClass(isSelected) {
  if (isSelected) {
    return 'bg-cream-highlight shadow-md border border-[#5A3826]/30';
  }
  return 'card-silk hover:bg-[#F6EFE4]';
}

function HeroBanner({ searchQuery, onSearch }) {
  const wrapCls =
    'card-silk rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row ' +
    'lg:items-center justify-between gap-6';
  const inputWrap =
    'w-full lg:w-[52%] flex items-center gap-2 bg-[#F6EFE4] ' +
    'border border-[#C8A97E]/60 rounded-2xl px-4 py-3';

  return (
    <div className={wrapCls}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold">
          L’essentiel bien choisi.
        </h1>
        <p className="text-xs sm:text-sm text-[#4A2E21]/80 mt-1">
          Pièces choisies pour leur finition, leur tenue et leur sobriété.
        </p>
      </div>
      <div className={inputWrap}>
        <span className="text-[#4A2E21] font-bold">⌕</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher une pièce, une référence..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}

export function HeroSearchAndCatalogues({ heroState }) {
  const { searchQuery, onSearch, catalogues, products } = heroState;
  const { selectedCategory, onSelectCategory } = heroState;
  const countFor = (id) =>
    id === 'Tous'
      ? products.length
      : products.filter((p) => p.category === id).length;

  return (
    <section className="space-y-6 pt-3">
      <HeroBanner searchQuery={searchQuery} onSearch={onSearch} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {catalogues.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`click-tactile text-left p-4 rounded-2xl ${getCatCardClass(
              selectedCategory === cat.id
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg font-semibold">
                {cat.title}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/80 text-xs">
                {countFor(cat.id)}
              </span>
            </div>
            <p className="text-xs text-[#4A2E21]/75 mt-1">{cat.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProductImageBox({ product, onOpenFiche }) {
  const [idx, setIdx] = useState(0);
  const imgs = product.images || [];
  const current = imgs[idx] || '';
  const badgeCls =
    'absolute bottom-2 right-2 px-2.5 py-1 rounded-lg ' +
    'bg-cream-highlight text-xs font-semibold';

  return (
    <div className="relative h-52 bg-white overflow-hidden">
      <img
        src={current}
        alt={product.name}
        onClick={() => onOpenFiche(product.id)}
        className="w-full h-full object-cover cursor-pointer"
      />
      {imgs.length > 1 && (
        <button
          type="button"
          onClick={() => setIdx((idx + 1) % imgs.length)}
          className={badgeCls}
        >
          Photo {idx + 1}/{imgs.length}
        </button>
      )}
    </div>
  );
}

function ProductCard({ product, onOpenFiche, onAdd }) {
  const defaultVariant = product.variants[0];
  const cardCls =
    'card-silk rounded-3xl overflow-hidden flex flex-col justify-between';
  const footCls =
    'px-5 pb-5 pt-3 border-t flex items-center justify-between';
  const ficheBtn =
    'click-tactile px-3 py-2 rounded-xl bg-[#EFE6D8] text-xs font-semibold';
  const addBtn =
    'click-tactile px-4 py-2 rounded-xl bg-cream-highlight text-xs font-semibold';

  return (
    <article className={cardCls}>
      <div>
        <ProductImageBox product={product} onOpenFiche={onOpenFiche} />
        <div className="p-5">
          <div className="flex justify-between text-[11px] uppercase mb-1">
            <span>{product.id}</span>
            <span>{product.category}</span>
          </div>
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-xs text-[#4A2E21]/75 mt-1">{product.shortDesc}</p>
        </div>
      </div>
      <div className={footCls}>
        <span className="text-lg font-bold">{product.price} $</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onOpenFiche(product.id)}
            className={ficheBtn}
          >
            Fiche
          </button>
          <button
            type="button"
            onClick={() => onAdd(product, defaultVariant)}
            className={addBtn}
          >
            Ajouter
          </button>
        </div>
      </div>
    </article>
  );
}

export function BoutiqueView({ products, onOpenFiche, onAdd }) {
  const gridCls =
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pt-6';
  return (
    <section className={gridCls}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpenFiche={onOpenFiche}
          onAdd={onAdd}
        />
      ))}
    </section>
  );
}

export function FichesView({ products, focusedId, onAdd }) {
  const btnCls =
    'click-tactile px-4 py-2.5 rounded-xl bg-cream-highlight text-xs font-semibold';
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      {products.map((item) => {
        const ring = focusedId === item.id ? 'ring-2 ring-[#C8A97E]' : '';
        return (
          <div key={item.id} className={`card-silk rounded-3xl p-6 space-y-3 ${ring}`}>
            <div className="flex justify-between text-xs uppercase">
              <span>
                {item.id} — {item.atelier}
              </span>
              <span className="font-bold">{item.price} $</span>
            </div>
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-sm text-[#2B1D16]/85">{item.descriptif}</p>
            <button
              type="button"
              onClick={() => onAdd(item, item.variants[0])}
              className={btnCls}
            >
              Commander ({item.price} $)
            </button>
          </div>
        );
      })}
    </section>
  );
}
