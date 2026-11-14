import { useState, useEffect } from 'react';
import { sanitizeInput } from '../security/sovereignCore.js';

const STEPS = ['Reçue', 'Atelier', 'Expédition', 'Livrée'];
const ORBIT_TICK_MS = 45;
const ORBIT_STEP = 5;
const CIRCLE_DEG = 360;
const TILT_LIMIT = 18;

function getModeBtnClass(isActive) {
  if (isActive) {
    return 'bg-cream-highlight font-bold shadow-xs';
  }
  return 'bg-latte-soft text-[#160E09]';
}

function StudioSidebar({ products, activeId, onSelect }) {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {products.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`click-tactile w-full text-left p-3 rounded-xl text-xs flex justify-between ${
            item.id === activeId
              ? 'bg-cream-highlight font-bold'
              : 'bg-[#F6EFE4]'
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
          className="click-tactile px-3 py-1.5 rounded-lg bg-latte-soft text-xs font-bold"
        >
          Liste
        </button>
      )}
      <div className="flex gap-2">
        {['2D', '3D', 'Orbite 3D'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChangeMode(m)}
            className={`click-tactile px-3.5 py-1.5 rounded-xl text-xs ${getModeBtnClass(
              mode === m
            )}`}
          >
            {m}
          </button>
        ))}
      </div>
      <input
        type="range"
        min="100"
        max="190"
        value={zoom}
        onChange={(e) => onZoom(Number(e.target.value))}
      />
    </div>
  );
}

function InteractiveStage({ active, mode, zoom }) {
  const [tilt, setTilt] = useState({ rx: 6, ry: -12 });
  const is3D = mode === '3D' || mode === 'Orbite 3D';

  useEffect(() => {
    if (mode !== 'Orbite 3D') {
      return undefined;
    }
    let deg = 0;
    const id = window.setInterval(() => {
      deg = (deg + ORBIT_STEP) % CIRCLE_DEG;
      const rad = (deg * Math.PI) / 180;
      setTilt({
        rx: Math.round(Math.sin(rad) * 10),
        ry: Math.round(Math.cos(rad) * 18)
      });
    }, ORBIT_TICK_MS);
    return () => window.clearInterval(id);
  }, [mode]);

  const onMove = (e) => {
    if (mode === '2D') {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({
      rx: Math.round(-ny * TILT_LIMIT),
      ry: Math.round(nx * TILT_LIMIT)
    });
  };

  const rx = is3D ? tilt.rx : 0;
  const ry = is3D ? tilt.ry : 0;
  const scale = (zoom / 100).toFixed(2);
  const shine = `radial-gradient(circle at ${50 + ry * 2}% ${50 - rx * 2}%, rgba(255,255,255,0.55), transparent 60%)`;

  return (
    <div
      onMouseMove={onMove}
      style={{ perspective: '1200px' }}
      className="h-80 rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#E5D5C0] grid place-items-center overflow-hidden cursor-grab"
    >
      <div
        style={{
          transform: `scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg)`
        }}
        className="w-56 h-56 rounded-3xl overflow-hidden bg-white shadow-2xl relative transition-transform duration-150"
      >
        <img
          src={active.images[0]}
          alt={active.name}
          className="w-full h-full object-cover"
        />
        {is3D && (
          <div
            style={{ background: shine }}
            className="pointer-events-none absolute inset-0"
          />
        )}
      </div>
    </div>
  );
}

export function StudioView({ products, onAdd }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id || 'REF-01');
  const [mode, setMode] = useState('3D');
  const [zoom, setZoom] = useState(115);
  const [showList, setShowList] = useState(true);

  const active = products.find((p) => p.id === selectedId) || products[0];
  if (!active) {
    return null;
  }
  const mainCol = showList ? 'lg:col-span-8' : 'lg:col-span-12';

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
      {showList && (
        <div className="lg:col-span-4 card-silk rounded-3xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-editorial text-xl font-bold">Pièces</h2>
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

      <div className={`${mainCol} card-silk plane-sheen rounded-3xl p-6 space-y-4`}>
        <StudioToolbar
          showList={showList}
          onShowList={() => setShowList(true)}
          mode={mode}
          onChangeMode={setMode}
          zoom={zoom}
          onZoom={setZoom}
        />
        <InteractiveStage active={active} mode={mode} zoom={zoom} />
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-editorial text-xl font-bold">{active.name}</h3>
            <p className="text-xs text-[#4A2E21]/75">{active.shortDesc}</p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(active, active.variants[0])}
            className="click-tactile px-4 py-2.5 rounded-xl bg-cream-highlight text-xs font-bold"
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
        <h2 className="font-editorial text-2xl font-bold">Suivi Commande</h2>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(sanitizeInput(e.target.value))}
          placeholder="TR-2026-1089"
          className="w-full px-4 py-2.5 rounded-xl border text-sm"
        />
      </div>

      <div className="lg:col-span-7 card-silk plane-sheen rounded-3xl p-6 space-y-5">
        <div className="flex justify-between text-sm font-bold">
          <span>{found.id}</span>
          <span>{found.amount} $</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((label, idx) => {
            const done = idx + 1 <= found.step;
            const dotCls = done
              ? 'bg-cream-highlight shadow-sm'
              : 'bg-latte-soft opacity-60';
            return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span
                  className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${dotCls}`}
                >
                  {idx + 1}
                </span>
                <span className="text-[11px] font-semibold">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
