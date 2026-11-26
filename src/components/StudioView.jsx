import { useState } from 'react';
import { RotateIcon } from './Icons.jsx';

export function StudioView({ activeItem, products }) {
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const target = activeItem || products[0] || null;

  if (!target) {
    return (
      <section className="archival-card rounded-2xl p-8 text-center space-y-2 animate-rise">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#665E4E]">
          Studio d’examen
        </p>
        <h2 className="font-display text-2xl">Aucune pièce sélectionnée</h2>
        <p className="text-xs text-[#665E4E] max-w-md mx-auto">
          Dès que vos premières photographies seront publiées, elles pourront
          être inspectées ici sous différents angles.
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
          style={{ transform: `rotate(${angle}deg) scale(${zoom})` }}
          className="w-full h-full object-cover transition-transform duration-500"
        />
      </div>

      <div className="space-y-4">
        <span className="embroidered-mark">·⊹ STUDIO ⊹·</span>
        <h2 className="font-display text-3xl text-[#1C1914]">{target.title}</h2>
        <p className="text-sm font-bold text-[#4E4634]">
          {target.price > 0 ? `${target.price} USD` : 'Prix sur demande'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setAngle((prev) => prev + 90)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium btn-vintage-ghost"
          >
            <RotateIcon className="w-3.5 h-3.5" />
            <span>Pivoter 90°</span>
          </button>

          <label className="flex items-center gap-2 text-xs text-[#665E4E]">
            <span>Zoom</span>
            <input
              type="range"
              min="1"
              max="1.6"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24 accent-[#4E4634]"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
