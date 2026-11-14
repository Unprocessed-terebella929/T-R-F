import { useState } from 'react';

function getCatCardClass(isSelected) {
  if (isSelected) {
    return 'bg-cream-highlight shadow-md -translate-y-0.5';
  }
  return 'card-silk hover:bg-[#F6EFE4]';
}

function HeroBanner({ searchQuery, onSearch }) {
  const wrapCls =
    'card-silk plane-sheen rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row ' +
    'lg:items-center justify-between gap-6';
  const inputWrap =
    'w-full lg:w-[54%] flex items-center gap-3 bg-[#F6EFE4] ' +
    'border border-[#C8A97E]/60 rounded-2xl px-4 py-3.5 shadow-inner';

  return (
    <div className={wrapCls}>
      <div>
        <h1 className="text-3xl sm:text-4xl font-editorial font-bold">
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
          placeholder="Rechercher une pièce, une matière, une référence..."
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
            className={`click-tactile plane-sheen text-left p-4 rounded-2xl ${getCatCardClass(
              selectedCategory === cat.id
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-editorial text-xl font-bold">
                {cat.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/85 text-xs font-bold">
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
  const navBtn =
    'click-tactile absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full ' +
    'bg-cream-highlight text-xs font-bold grid place-items-center shadow';

  return (
    <div className="relative h-56 bg-[#F8F4EC] overflow-hidden group">
      <img
        src={current}
        alt={product.name}
        onClick={() => onOpenFiche(product.id)}
        className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-latte-soft text-[10px] font-mono font-bold">
        {product.id}
      </span>
      {imgs.length > 1 && (
        <button
          type="button"
          onClick={() => setIdx((idx + 1) % imgs.length)}
          className={`${navBtn} right-2.5`}
          aria-label="Photo suivante"
        >
          ›
        </button>
      )}
    </div>
  );
}

function VariantSelectorRow({ variants, activeVariant, onSelect }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-1.5">
        {variants.map((v) => {
          const ring =
            v.id === activeVariant.id ? 'ring-2 ring-offset-1 ring-[#4A2E21]' : '';
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v)}
              title={v.name}
              style={{ backgroundColor: v.color }}
              className={`click-tactile w-4 h-4 rounded-full ${ring}`}
            />
          );
        })}
      </div>
      <span className="text-[11px] font-semibold text-[#5A3826]">
        {activeVariant.name}
      </span>
    </div>
  );
}

function ProductCard({ product, onOpenFiche, onAdd }) {
  const [variant, setVariant] = useState(product.variants[0]);
  const cardCls =
    'card-silk plane-sheen rounded-3xl overflow-hidden flex flex-col ' +
    'justify-between hover:-translate-y-1';
  const footCls = 'px-5 pb-5 pt-3 border-t flex items-center justify-between';
  const ficheBtn =
    'click-tactile px-3 py-2 rounded-xl bg-latte-soft text-xs font-bold';
  const addBtn =
    'click-tactile px-4 py-2 rounded-xl bg-cream-highlight text-xs font-bold';

  return (
    <article className={cardCls}>
      <div>
        <ProductImageBox product={product} onOpenFiche={onOpenFiche} />
        <div className="p-5 pb-3">
          <span className="text-[10px] uppercase tracking-wider text-[#5A3826]">
            {product.category}
          </span>
          <h2 className="font-editorial text-xl font-bold mt-0.5">
            {product.name}
          </h2>
          <p className="text-xs text-[#4A2E21]/75 mt-1">{product.shortDesc}</p>
          <VariantSelectorRow
            variants={product.variants}
            activeVariant={variant}
            onSelect={setVariant}
          />
        </div>
      </div>
      <div className={footCls}>
        <span className="font-editorial text-2xl font-bold">
          {product.price} $
        </span>
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
            onClick={() => onAdd(product, variant)}
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
    'click-tactile px-4 py-2.5 rounded-xl bg-cream-highlight text-xs font-bold';
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      {products.map((item) => {
        const ring = focusedId === item.id ? 'ring-2 ring-[#C8A97E]' : '';
        return (
          <div
            key={item.id}
            className={`card-silk plane-sheen rounded-3xl p-6 space-y-3 ${ring}`}
          >
            <div className="flex justify-between text-xs uppercase font-bold">
              <span>
                {item.id} — {item.atelier}
              </span>
              <span>{item.price} $</span>
            </div>
            <h2 className="font-editorial text-2xl font-bold">{item.name}</h2>
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
