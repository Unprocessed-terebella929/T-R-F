import { COCKPIT_URL, MAISONS } from '../data/storeCatalog.js';
import { LockIcon, ShieldIcon, TrashIcon } from './Icons.jsx';

const CATEGORIES = MAISONS.filter((m) => m.id !== 'tous');

export function SealedNotice({ count }) {
  return (
    <div className="rounded-xl bg-[#EAE2D2]/80 p-6 text-center space-y-3">
      <ShieldIcon className="w-8 h-8 mx-auto text-[#4E4634]" />
      <h3 className="font-display text-xl">
        Canal initial définitivement scellé
      </h3>
      <p className="text-xs text-[#665E4E] max-w-md mx-auto">
        Vos {count} photo(s) sont publiées sur la vitrine. Toute gestion future
        passe exclusivement par votre Cockpit privé.
      </p>
      <a
        href={COCKPIT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-5 py-2.5 rounded-full text-xs font-medium btn-limewood"
      >
        Ouvrir le Cockpit Admin ↗
      </a>
    </div>
  );
}

export function UnlockForm({
  accessKey,
  setAccessKey,
  authError,
  busy,
  onUnlock
}) {
  return (
    <form onSubmit={onUnlock} className="max-w-sm mx-auto py-6 space-y-4">
      <div className="flex items-center gap-2 text-xs text-[#4E4634]">
        <LockIcon className="w-4 h-4" />
        <span>Vérification serveur requise (clé Admin Vercel)</span>
      </div>
      <input
        type="password"
        value={accessKey}
        onChange={(e) => setAccessKey(e.target.value)}
        placeholder="Clé privée ADMIN_ACCESS_KEY"
        className="w-full px-4 py-2.5 rounded-xl border border-[#4E4634]/25 bg-white text-sm"
        required
      />
      {authError && (
        <p className="text-xs text-[#8A2C2C] font-medium">{authError}</p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full py-2.5 rounded-xl text-xs font-medium btn-limewood"
      >
        {busy ? 'Vérification...' : 'Déverrouiller le canal unique'}
      </button>
    </form>
  );
}

export function DraftRow({ item, onUpdate, onRemove }) {
  return (
    <div className="flex gap-3 p-2.5 rounded-xl border border-[#4E4634]/15 bg-white">
      <img
        src={item.image}
        alt={item.title}
        className="w-16 h-20 object-cover rounded-lg bg-[#EAE2D2]"
      />
      <div className="flex-1 space-y-1.5">
        <input
          type="text"
          value={item.title}
          onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
          placeholder="Nom de la pièce"
          className="w-full px-2 py-1 text-xs border rounded-md"
        />
        <div className="flex gap-1.5">
          <select
            value={item.category}
            onChange={(e) => onUpdate(item.id, 'category', e.target.value)}
            className="flex-1 px-2 py-1 text-[11px] border rounded-md bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={item.price}
            onChange={(e) => onUpdate(item.id, 'price', e.target.value)}
            placeholder="USD"
            className="w-20 px-2 py-1 text-[11px] border rounded-md"
          />
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1 text-[#665E4E] hover:text-[#1C1914]"
            aria-label="Retirer"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
