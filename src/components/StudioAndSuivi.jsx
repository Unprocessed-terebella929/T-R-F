import { useState, useEffect } from 'react';
import { sanitizeInput } from '../security/sovereignCore.js';

const STEPS = ['Reçue', 'Atelier', 'Expédition', 'Livrée'];
const MODES = ['2D (Axes X·Y)', '3D (Volume X·Y·Z)', 'Orbite 360°'];
const ORBIT_TICK_MS = 40;
const ORBIT_STEP = 4;
const CIRCLE_DEG = 360;
const TILT_MAX = 24;
const PAN_MAX = 55;
const BTN_SOFT = 'click-tactile px-3 py-1.5 rounded-xl bg-latte-soft text-xs font-bold';

function getModeBtnClass(isActive) {
  return isActive
    ? 'bg-cream-highlight font-bold shadow-xs'
    : 'bg-latte-soft text-[#160E09]';
}

function StudioSidebar({ products, activeId, onSelect }) {
  const rowBase =
    'click-tactile w-full text-left p-3 rounded-xl text-xs flex justify-between';
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {products.map((item) => {
        const cls =
          item.id === activeId ? 'bg-cream-highlight font-bold' : 'bg-[#F6EFE4]';
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`${rowBase} ${cls}`}
          >
            <span className="truncate">{item.name}</span>
            <span>{item.price} $</span>
          </button>
        );
      })}
    </div>
  );
}

function StudioToolbar({ barProps }) {
  const { showList, onShowList, mode, onChangeMode, zoom, onZoom, onReset } =
    barProps;
  return (
    <div className="flex flex-wrap justify-between items-center gap-3">
      <div className="flex items-center gap-2">
        {!showList && (
          <button type="button" onClick={onShowList} className={BTN_SOFT}>
            Catalogue
          </button>
        )}
        {MODES.map((m) => (
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
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-semibold">{zoom}%</span>
        <input
          type="range"
          min="95"
          max="185"
          value={zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
          className="luxury-slider w-28"
        />
        <button type="button" onClick={onReset} className={BTN_SOFT}>
          Centrer
        </button>
      </div>
    </div>
  );
}

function computePrismStyle(pose, zoom) {
  const { rx, ry, panX, panY, is3D } = pose;
  const sc = (zoom / 100).toFixed(2);
  const transform = is3D
    ? `translate3d(${panX}px,${panY}px,0) scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg)`
    : `translate(${panX}px,${panY}px) scale(${sc})`;
  const shine =
    `radial-gradient(circle at ${50 + ry * 1.6}% ${50 - rx * 1.6}%, ` +
    'rgba(255,250,240,0.65), transparent 62%)';
  const boxShadow = `${-ry}px ${18 + rx}px 32px rgba(22,14,9,0.28)`;
  return { transform, shine, boxShadow };
}

function Volumetric3DPrism({ active, pose, zoom }) {
  const { transform, shine, boxShadow } = computePrismStyle(pose, zoom);
  const prismCls =
    'stage-3d-preserve relative w-64 h-64 rounded-3xl transition-transform duration-150';
  const backSlabCls =
    'absolute inset-0 rounded-3xl bg-gradient-to-br from-[#8C6239] ' +
    'via-[#4A2E21] to-[#1A110C] border border-[#DECAB1]/60';
  const frontFaceCls =
    'relative w-full h-full rounded-3xl overflow-hidden bg-white border-2 border-[#DECAB1]';

  return (
    <div style={{ transform, boxShadow }} className={prismCls}>
      {pose.is3D && (
        <div style={{ transform: 'translateZ(-18px)' }} className={backSlabCls} />
      )}
      <div
        style={{ transform: pose.is3D ? 'translateZ(16px)' : 'none' }}
        className={frontFaceCls}
      >
        <img
          src={active.images[0]}
          alt={active.name}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
        <div style={{ background: shine }} className="pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
}

function computePointerPose(e, is2D) {
  const rect = e.currentTarget.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
  const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  if (is2D) {
    return {
      rx: 0,
      ry: 0,
      panX: Math.round(nx * PAN_MAX),
      panY: Math.round(ny * PAN_MAX)
    };
  }
  return {
    rx: Math.round(-ny * TILT_MAX),
    ry: Math.round(nx * TILT_MAX),
    panX: 0,
    panY: 0
  };
}

function useOrbitAnimation(isOrbit, setPose) {
  useEffect(() => {
    if (!isOrbit) {
      return undefined;
    }
    let deg = 0;
    const id = window.setInterval(() => {
      deg = (deg + ORBIT_STEP) % CIRCLE_DEG;
      const rad = (deg * Math.PI) / 180;
      setPose((prev) => ({
        ...prev,
        rx: Math.round(Math.sin(rad) * 14),
        ry: Math.round(Math.cos(rad) * TILT_MAX)
      }));
    }, ORBIT_TICK_MS);
    return () => window.clearInterval(id);
  }, [isOrbit, setPose]);
}

function InteractiveStage({ stageProps }) {
  const { active, mode, zoom, pose, setPose } = stageProps;
  const is2D = mode.startsWith('2D');
  const isOrbit = mode.startsWith('Orbite');
  useOrbitAnimation(isOrbit, setPose);

  const hudText = is2D
    ? `Plan 2D · X: ${pose.panX}px · Y: ${pose.panY}px`
    : `Volume 3D · X: ${pose.rx}° · Y: ${pose.ry}° · Z: +16mm`;
  const stageCls =
    'relative h-80 rounded-2xl bg-gradient-to-b from-[#FFFDF9] ' +
    'to-[#E6D5BE]/70 grid place-items-center overflow-hidden cursor-move border';
  const hudCls =
    'absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 text-[11px] font-mono';

  return (
    <div
      onMouseMove={(e) => !isOrbit && setPose(computePointerPose(e, is2D))}
      style={{ perspective: '1100px' }}
      className={stageCls}
    >
      <Volumetric3DPrism
        active={active}
        pose={{ ...pose, is3D: !is2D }}
        zoom={zoom}
      />
      <span className={hudCls}>{hudText}</span>
    </div>
  );
}

function StudioLeftDrawer({ showList, products, activeId, onSelect, onHide }) {
  if (!showList) {
    return null;
  }
  return (
    <div className="lg:col-span-4 card-silk rounded-3xl p-5 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="font-editorial text-xl font-bold">Sélection</h2>
        <button type="button" onClick={onHide} className="text-xs underline">
          Réduire
        </button>
      </div>
      <StudioSidebar products={products} activeId={activeId} onSelect={onSelect} />
    </div>
  );
}

function StudioCaptionBar({ active, onAdd }) {
  const addBtnCls =
    'click-tactile px-5 py-2.5 rounded-xl bg-cream-highlight text-xs font-bold';
  return (
    <div className="flex justify-between items-center pt-1">
      <div>
        <h3 className="font-editorial text-2xl font-bold">{active.name}</h3>
        <p className="text-xs text-[#4A2E21]/80">{active.shortDesc}</p>
      </div>
      <button
        type="button"
        onClick={() => onAdd(active, active.variants[0])}
        className={addBtnCls}
      >
        Ajouter ({active.price} $)
      </button>
    </div>
  );
}

export function StudioView({ products, onAdd }) {
  const [selectedId, setSelectedId] = useState(products[0]?.id || 'REF-01');
  const [mode, setMode] = useState('3D (Volume X·Y·Z)');
  const [zoom, setZoom] = useState(110);
  const [showList, setShowList] = useState(true);
  const [pose, setPose] = useState({ rx: 10, ry: -16, panX: 0, panY: 0 });

  const active = products.find((p) => p.id === selectedId) || products[0];
  if (!active) {
    return null;
  }
  const mainCol = showList ? 'lg:col-span-8' : 'lg:col-span-12';
  const barProps = {
    showList,
    onShowList: () => setShowList(true),
    mode,
    onChangeMode: setMode,
    zoom,
    onZoom: setZoom,
    onReset: () => setPose({ rx: 8, ry: -12, panX: 0, panY: 0 })
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
      <StudioLeftDrawer
        showList={showList}
        products={products}
        activeId={active.id}
        onSelect={setSelectedId}
        onHide={() => setShowList(false)}
      />
      <div className={`${mainCol} card-silk plane-sheen rounded-3xl p-6 space-y-4`}>
        <StudioToolbar barProps={barProps} />
        <InteractiveStage stageProps={{ active, mode, zoom, pose, setPose }} />
        <StudioCaptionBar active={active} onAdd={onAdd} />
      </div>
    </section>
  );
}

export function SuiviView({ orders }) {
  const [code, setCode] = useState('TR-2026-1089');
  const found =
    orders.find((o) => o.id.toLowerCase() === code.trim().toLowerCase()) ||
    orders[0];
  const dotBase = 'w-8 h-8 rounded-full grid place-items-center text-xs font-bold';

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
            const dotCls =
              idx + 1 <= found.step ? 'bg-cream-highlight' : 'bg-latte-soft opacity-60';
            return (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className={`${dotBase} ${dotCls}`}>{idx + 1}</span>
                <span className="text-[11px] font-semibold">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
