import { useState } from 'react';
import { sanitizeInput } from '../security/sovereignCore.js';

const ADMIN_TABS = [
  { id: 'pieces', label: 'Pièces & Photos' },
  { id: 'catalogues', label: 'Catalogues' },
  { id: 'messagerie', label: 'Messagerie' }
];
const BTN_CREAM = 'click-tactile rounded-xl bg-cream-highlight text-xs font-bold';
const BTN_SOFT = 'click-tactile rounded-xl bg-latte-soft text-xs font-semibold';
const INPUT_CLS = 'w-full px-3.5 py-2 rounded-xl border text-sm bg-white';

function getSubTabCls(isActive) {
  return isActive
    ? 'bg-cream-highlight font-bold shadow-xs'
    : 'bg-white/75 text-[#4A2E21] hover:bg-white';
}

export function UnlockedAdminBanner({ onOpenAdmin, onLock }) {
  const barCls =
    'bg-latte-soft px-4 sm:px-8 py-2 flex items-center justify-between text-xs';
  return (
    <div className={barCls}>
      <span className="font-semibold text-[#4A2E21]">Atelier actif</span>
      <div className="flex gap-2">
        <button type="button" onClick={onOpenAdmin} className={`${BTN_CREAM} px-3 py-1`}>
          Ouvrir
        </button>
        <button type="button" onClick={onLock} className={`${BTN_SOFT} px-3 py-1`}>
          Verrouiller
        </button>
      </div>
    </div>
  );
}

function ConfirmPurgeModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/45 grid place-items-center p-4">
      <div className="card-silk plane-sheen rounded-3xl p-6 max-w-sm w-full space-y-4">
        <h3 className="font-editorial text-2xl font-bold">
          Retirer le catalogue par défaut ?
        </h3>
        <p className="text-xs text-[#4A2E21]/85">
          Les pièces initiales seront retirées pour laisser place à vos photos.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={`${BTN_SOFT} px-4 py-2`}>
            Annuler
          </button>
          <button type="button" onClick={onConfirm} className={`${BTN_CREAM} px-4 py-2`}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProductForm({ catalogues, onAddProduct }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bijouterie');
  const [price, setPrice] = useState('120');
  const [shortDesc, setShortDesc] = useState('');
  const [photos, setPhotos] = useState([]);

  const handleFiles = (e) => {
    Array.from(e.target.files || []).forEach((f) => {
      const r = new FileReader();
      r.onload = () => setPhotos((prev) => [...prev, String(r.result || '')]);
      r.readAsDataURL(f);
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    const cleanDesc = sanitizeInput(shortDesc) || 'Finition atelier.';
    onAddProduct({
      id: `REF-${Date.now().toString().slice(-3)}`,
      name: sanitizeInput(name),
      category,
      price: Number(price) || 100,
      atelier: 'Collection Officielle',
      shortDesc: cleanDesc,
      descriptif: cleanDesc,
      images: photos,
      variants: [{ id: 'v1', name: 'Originale', color: '#DECAB1' }]
    });
    setName('');
    setShortDesc('');
    setPhotos([]);
  };

  const dropCls =
    'block p-3 rounded-xl bg-[#F6EFE4] border border-dashed ' +
    'text-xs text-center cursor-pointer';

  return (
    <form onSubmit={handleCreate} className="card-silk rounded-3xl p-6 space-y-3">
      <h2 className="font-editorial text-2xl font-bold">Nouvelle Pièce 2D/3D</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Intitulé de la pièce"
        className={INPUT_CLS}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={INPUT_CLS}
        >
          {catalogues
            .filter((c) => c.id !== 'Tous')
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
        </select>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Prix ($)"
          className={INPUT_CLS}
        />
      </div>
      <input
        type="text"
        value={shortDesc}
        onChange={(e) => setShortDesc(e.target.value)}
        placeholder="Descriptif (matière, dimensions...)"
        className={INPUT_CLS}
      />
      <label className={dropCls}>
        <span>Importer photos 2D/3D ({photos.length})</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
      </label>
      <button type="submit" className={`${BTN_CREAM} w-full py-2.5`}>
        Publier en Vitrine
      </button>
    </form>
  );
}

function ExistingProductsList({ products, onUpdatePhoto, onDeleteProduct }) {
  const handleReplace = (id, e) => {
    const f = e.target.files?.[0];
    if (!f) {
      return;
    }
    const r = new FileReader();
    r.onload = () => onUpdatePhoto(id, String(r.result || ''));
    r.readAsDataURL(f);
  };
  const rowCls =
    'p-2.5 rounded-2xl bg-[#F6EFE4] flex items-center justify-between gap-2';

  return (
    <div className="card-silk rounded-3xl p-6 space-y-2.5 max-h-96 overflow-y-auto">
      <h2 className="font-editorial text-2xl font-bold">
        Pièces Actives ({products.length})
      </h2>
      {products.map((p) => (
        <div key={p.id} className={rowCls}>
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={p.images?.[0] || ''}
              alt={p.name}
              className="w-10 h-10 rounded-xl object-cover bg-white shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-bold truncate">{p.name}</p>
              <p className="text-[11px] text-[#5A3826]">{p.price} $</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <label className={`${BTN_CREAM} px-2.5 py-1 cursor-pointer`}>
              Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleReplace(p.id, e)}
                className="hidden"
              />
