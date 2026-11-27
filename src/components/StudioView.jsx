import { useState } from 'react';
import { OrbitIcon, RotateIcon } from './Icons.jsx';
import { Reveal } from './Reveal.jsx';

export function StudioView({ activeItem, products, onSelectItem }) {
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [orbit, setOrbit] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const target = activeItem || products[0] || null;

  if (!target) {
    return (
      <Reveal>
        <section className="archival-card rounded-2xl p-8 text-center space-y-2">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#665E4E]">
            Studio d’examen
          </p>
          <h2 className="font-display text-2xl">Aucune pièce sélectionnée</h2>
          <p className="text-xs text-[#665E4E] max-w-md mx-auto">
            Dès que vos premières photographies seront publiées, vous pourrez
            les examiner ici avec rotation, zoom et vue 3D.
          </p>
        </section>
      </Reveal>
    );
  }

  const handlePointerMove = (e) => {
    if (orbit) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const imgTransform = orbit
    ? `rotate(${angle}deg) scale(${zoom})`
    : `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) rotate(${angle}deg) scale(${zoom})`;

  return (
    <section className="space-y-4 animate-rise">
      <div className="archival-card rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div
          onMouseMove={handlePointerMove}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          className="aspect-[4/5] rounded-xl bg-[#EAE2D2] overflow-hidden flex items-center justify-center"
        >
          <img
            src={target.image}
            alt={target.title}
            style={{ transform: imgTransform }}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              orbit ? 'animate-studio-orbit' : ''
            }`}
          />
        </div>

        <div className="space-y-4">
          <span className="embroidered-mark">·⊹ STUDIO ⊹·</span>
          <h2 className="font-display text-3xl text-[#1C1914]">
            {target.title}
          </h2>
          <p className="text-sm font-bold text-[#4E4634]">
            {target.price > 0 ? `${target.price} USD` : 'Prix sur demande'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setAngle((prev) => prev + 90)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium btn-vintage-ghost"
            >
              <RotateIcon className="w-3.5 h-3.5" />
              <span>Pivoter 90°</span>
            </button>

            <button
              type="button"
              onClick={() => setOrbit((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium ${
                orbit ? 'btn-limewood' : 'btn-vintage-ghost'
              }`}
            >
              <OrbitIcon className="w-3.5 h-3.5" />
              <span>{orbit ? 'Orbite active' : 'Orbite 3D'}</span>
            </button>
          </div>

          <label className="flex items-center gap-3 text-xs text-[#665E4E] pt-1">
            <span>Zoom</span>
            <input
              type="range"
              min="1"
              max="1.6"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-32 accent-[#4E4634]"
            />
          </label>
        </div>
      </div>

      {products.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {products.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`w-14 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                item.id === target.id
                  ? 'border-[#4E4634] scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
