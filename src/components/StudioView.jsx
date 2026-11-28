import { useState } from 'react';
import { OrbitIcon, RotateIcon } from './Icons.jsx';
import { Reveal } from './Reveal.jsx';

const TILT_RANGE = 16;
const ROTATE_STEP_DEG = 90;

const STAGE_CARD_CLS = [
  'archival-card rounded-2xl p-4 sm:p-6 lg:p-8',
  'grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 items-center'
].join(' ');
const FRAME_CLS = [
  'w-full max-w-sm mx-auto md:max-w-none aspect-[4/5]',
  'max-h-[55dvh] md:max-h-[65dvh] rounded-xl bg-[#EAE2D2]',
  'overflow-hidden flex items-center justify-center'
].join(' ');
const CTRL_BTN_CLS = [
  'inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px]',
  'rounded-full text-xs font-medium'
].join(' ');

function EmptyStudio() {
  return (
    <Reveal>
      <section className="archival-card rounded-2xl p-8 text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#665E4E]">
          Studio d’examen
        </p>
        <h2 className="font-display text-2xl">Aucune pièce sélectionnée</h2>
        <p className="text-xs text-[#665E4E] max-w-md mx-auto">
          Dès que vos premières photographies seront publiées, vous pourrez les
          examiner ici avec rotation, zoom et vue 3D.
        </p>
      </section>
    </Reveal>
  );
}

function StudioControls({
  target,
  orbit,
  zoom,
  onRotate,
  onToggleOrbit,
  onZoomChange
}) {
  const priceText =
    target.price > 0 ? `${target.price} USD` : 'Prix sur demande';
  const orbitCls = orbit ? 'btn-limewood' : 'btn-vintage-ghost';

  return (
    <div className="space-y-4 min-w-0">
      <span className="embroidered-mark">·⊹ STUDIO ⊹·</span>
      <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#1C1914] break-words">
        {target.title}
      </h2>
      <p className="text-sm font-bold text-[#4E4634]">{priceText}</p>
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onRotate}
          className={`${CTRL_BTN_CLS} btn-vintage-ghost`}
        >
          <RotateIcon className="w-3.5 h-3.5" />
          <span>Pivoter 90°</span>
        </button>
        <button
          type="button"
          onClick={onToggleOrbit}
          className={`${CTRL_BTN_CLS} ${orbitCls}`}
        >
          <OrbitIcon className="w-3.5 h-3.5" />
          <span>{orbit ? 'Orbite active' : 'Orbite 3D'}</span>
        </button>
      </div>
      <label className="flex items-center gap-3 text-xs text-[#665E4E] pt-1">
        <span className="shrink-0">Zoom ({Math.round(zoom * 100)}%)</span>
        <input
          type="range"
          min="1"
          max="1.6"
          step="0.05"
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="w-full max-w-[200px] accent-[#4E4634]"
        />
      </label>
    </div>
  );
}

const THUMB_BASE_CLS =
  'w-14 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-transform';

function computeImgTransform(orbit, tilt, angle, zoom) {
  if (orbit) {
    return `rotate(${angle}deg) scale(${zoom})`;
  }
  return [
    `perspective(900px) rotateX(${tilt.y}deg)`,
    `rotateY(${tilt.x}deg) rotate(${angle}deg) scale(${zoom})`
  ].join(' ');
}

function StudioThumbnailStrip({ products, targetId, onSelectItem }) {
  if (products.length <= 1) {
    return null;
  }
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
      {products.map((item) => {
        const active = item.id === targetId;
        const border = active
          ? 'border-[#4E4634] scale-105'
          : 'border-transparent opacity-70 hover:opacity-100';
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item)}
            className={`${THUMB_BASE_CLS} ${border}`}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </button>
        );
      })}
    </div>
  );
}

function getPointerTilt(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width - 0.5) * TILT_RANGE,
    y: ((event.clientY - rect.top) / rect.height - 0.5) * -TILT_RANGE
  };
}

export function StudioView({ activeItem, products, onSelectItem }) {
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [orbit, setOrbit] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const target = activeItem || products[0] || null;

  if (!target) {
    return <EmptyStudio />;
  }

  const transform = computeImgTransform(orbit, tilt, angle, zoom);
  const orbitAnim = orbit ? 'animate-studio-orbit' : '';

  return (
    <section className="space-y-4 animate-rise">
      <div className={STAGE_CARD_CLS}>
        <div
          onMouseMove={(e) => !orbit && setTilt(getPointerTilt(e))}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          className={FRAME_CLS}
        >
          <img
            src={target.image}
            alt={target.title}
            style={{ transform }}
            className={`w-full h-full object-cover transition-transform duration-300 ${orbitAnim}`}
          />
        </div>
        <StudioControls
          target={target}
          orbit={orbit}
          zoom={zoom}
          onRotate={() => setAngle((prev) => prev + ROTATE_STEP_DEG)}
          onToggleOrbit={() => setOrbit((prev) => !prev)}
          onZoomChange={setZoom}
        />
      </div>
      <StudioThumbnailStrip
        products={products}
        targetId={target.id}
        onSelectItem={onSelectItem}
      />
    </section>
  );
}
