import { useState } from 'react';
import { sanitizeInput } from '../security/sovereignCore.js';

const STEPS = ['Reçue', 'Atelier', 'Expédition', 'Livrée'];

function getModeBtnClass(isActive) {
  if (isActive) {
    return 'bg-cream-highlight font-semibold';
  }
  return 'bg-[#EFE6D8] text-[#160E09]';
}

function StudioSidebar({ products, activeId, onSelect }) {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {products.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`w-full text-left p-3 rounded-xl text-xs flex justify-between ${
            item.id === activeId ? 'bg-cream-highlight font-semibold' : 'bg-[#F6EFE4]'
          }`}
        >
          <span className="truncate">{item.name}</span>
          <span>{item.price} $</span>
        </button>
      ))}
    </div>
  );
}

function StudioToolbar({ showList, onShowList, mode, onChangeMode, zoom, onZoom }) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-2">
      {!showList && (
        <button
          type="button"
          onClick={onShowList}
          className="px-3 py-1.5 rounded-lg bg-[#EFE6D8] text-xs"
        >
          Liste
        </button>
      )}
      <div className="flex gap-2">
        {['2D', '3D'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChangeMode(m)}
            className={`px-3.5 py-1.5 rounded-xl text-xs ${getModeBtnClass(
              mode === m
            )}`}
          >
            Vue {m}
          </button>
        ))}
      </div>
      <input
        type="range"
        min="100"
        max="180"
        value={zoom}
        onChange={(e) => onZoom(Number(e.target.value))}
      />
    </div>
  );
}

export function StudioView({ products, onAdd }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id || 'REF-01');
  const [mode, setMode] = useState('2D');
  const [zoom, setZoom] = useState(115);
  const [showList, setShowList] = useState(true);

  const active = products.find((p) => p.id === selectedId) || products[0];
  if (!active) {
    return null;
  }

  const transformStyle =
    mode === '3D'
      ? `perspective(900px) rotateY(14deg) rotateX(6deg) scale(${zoom / 100})`
      : `scale(${zoom / 100})`;
  const mainCol = showList ? 'lg:col-span-8' : 'lg:col-span-12';

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
      {showList && (
        <div className="lg:col-span-4 card-silk rounded-3xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-lg font-semibold">Pièces</h2>
            <button
              type="button"
              onClick={() => setShowList(false)}
              className="text-xs underline"
            >
              Masquer
            </button>
          </div>
          <StudioSidebar
            products={products}
            activeId={active.id}
            onSelect={setSelectedId}
          />
        </div>
      )}

      <div className={`${mainCol} card-silk rounded-3xl p-6 space-y-4`}>
        <StudioToolbar
          showList={showList}
          onShowList={() => setShowList(true)}
          mode={mode}
          onChangeMode={setMode}
          zoom={zoom}
          onZoom={setZoom}
        />
        <div className="h-72 bg-white rounded-2xl flex items-center justify-center">
          <img
            src={active.images[0]}
            alt={active.name}
            style={{ transform: transformStyle }}
            className="max-h-60 object-contain transition-transform duration-300"
          />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{active.name}</h3>
            <p className="text-xs text-[#4A2E21]/75">{active.shortDesc}</p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(active, active.variants[0])}
            className="px-4 py-2.5 rounded-xl bg-cream-highlight text-xs font-semibold"
          >
            Ajouter ({active.price} $)
          </button>
        </div>
      </div>
    </section>
  );
}

export function SuiviView({ orders }) {
  const [code, setCode] = useState('TR-2026-1089');
  const found =
    orders.find((o) => o.id.toLowerCase() === code.trim().toLowerCase()) ||
    orders[0];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
      <div className="lg:col-span-5 card-silk rounded-3xl p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Suivi Commande</h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(sanitizeInput(e.target.value))}
          placeholder="TR-2026-1089"
          className="w-full px-4 py-2.5 rounded-xl border text-sm"
        />
      </div>

      <div className="lg:col-span-7 card-silk rounded-3xl p-6 space-y-5">
        <div className="flex justify-between text-sm font-semibold">
          <span>{found.id}</span>
          <span>{found.amount} $</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((label, idx) => {
            const done = idx + 1 <= found.step;
            const dotCls = done ? 'bg-cream-highlight' : 'bg-[#EFE6D8] opacity-60';
            return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span
                  className={`w-7 h-7 rounded-full grid place-items-center ${dotCls}`}
                >
                  {idx + 1}
                </span>
                <span className="text-[11px]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
