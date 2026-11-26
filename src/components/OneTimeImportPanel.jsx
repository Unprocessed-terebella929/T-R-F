import { useState } from 'react';
import { MAX_INITIAL_PHOTOS } from '../data/storeCatalog.js';
import {
  compressImageFile,
  isInitialImportSealed,
  sanitizePrice,
  sanitizeText,
  sealInitialImportForever,
  verifyPrivateKey
} from '../security/vaultCore.js';
import { CloseIcon, UploadIcon } from './Icons.jsx';
import { DraftRow, SealedNotice, UnlockForm } from './ImportModalParts.jsx';

export function OneTimeImportPanel({ products, onSaveProducts, onClose }) {
  const [sealed, setSealed] = useState(() => isInitialImportSealed());
  const [unlocked, setUnlocked] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState(products);
  const [note, setNote] = useState('');

  const remaining = Math.max(0, MAX_INITIAL_PHOTOS - drafts.length);

  const handleUnlock = async (event) => {
    event.preventDefault();
    setBusy(true);
    setAuthError('');
    try {
      await verifyPrivateKey(accessKey);
      setUnlocked(true);
      setAccessKey('');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFiles = async (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) {
      return;
    }
    const batch = selected.slice(0, remaining);
    setNote(
      selected.length > remaining
        ? `Limite de ${MAX_INITIAL_PHOTOS} photos atteinte.`
        : ''
    );
    setBusy(true);
    const created = [];
    for (const file of batch) {
      try {
        const dataUrl = await compressImageFile(file);
        const clean = sanitizeText(file.name.replace(/\.[^.]+$/, ''), 48);
        created.push({
          id: `REF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: clean || 'Pièce sans titre',
          category: 'bijouterie',
          price: 0,
          image: dataUrl
        });
      } catch (err) {
        setNote(err.message);
      }
    }
    const nextList = [...drafts, ...created].slice(0, MAX_INITIAL_PHOTOS);
    setDrafts(nextList);
    onSaveProducts(nextList);
    setBusy(false);
  };

  const handleUpdate = (id, field, value) => {
    const nextList = drafts.map((item) => {
      if (item.id !== id) {
        return item;
      }
      return field === 'price'
        ? { ...item, price: sanitizePrice(value) }
        : { ...item, [field]: sanitizeText(value, 60) };
    });
    setDrafts(nextList);
    onSaveProducts(nextList);
  };

  const handleRemove = (id) => {
    const nextList = drafts.filter((item) => item.id !== id);
    setDrafts(nextList);
    onSaveProducts(nextList);
  };

  const handleSeal = () => {
    onSaveProducts(drafts);
    sealInitialImportForever();
    setSealed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1914]/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl archival-card p-6 space-y-5 animate-rise">
        <div className="flex items-start justify-between gap-4 border-b border-[#4E4634]/15 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#665E4E]">
              Canal privé · Usage unique
            </p>
            <h2 className="font-display text-2xl text-[#1C1914]">
              Importation initiale du catalogue
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full btn-vintage-ghost"
            aria-label="Fermer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {sealed ? (
          <SealedNotice count={products.length} />
        ) : !unlocked ? (
          <UnlockForm
            accessKey={accessKey}
            setAccessKey={setAccessKey}
            authError={authError}
            busy={busy}
            onUnlock={handleUnlock}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#EAE2D2]/65 px-4 py-3">
              <div className="text-xs">
                <span className="font-bold text-[#1C1914]">
                  {drafts.length} / {MAX_INITIAL_PHOTOS} photos importées
                </span>
                <span className="block text-[11px] text-[#665E4E]">
                  Encore {remaining} emplacement(s) disponible(s).
                </span>
              </div>

              <label
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium cursor-pointer ${
                  remaining === 0
                    ? 'opacity-40 pointer-events-none'
                    : 'btn-limewood'
                }`}
              >
                <UploadIcon className="w-3.5 h-3.5" />
                <span>{busy ? 'Traitement...' : 'Importer des photos'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                  disabled={busy || remaining === 0}
                />
              </label>
            </div>

            {note && <p className="text-xs text-[#4E4634] font-medium">{note}</p>}

            {drafts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {drafts.map((item) => (
                  <DraftRow
                    key={item.id}
                    item={item}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}

            {drafts.length > 0 && (
              <div className="rounded-xl border border-[#C2B088] bg-[#FAF7F0] p-4 space-y-3">
                <p className="text-xs font-bold text-[#1C1914]">
                  Ces {drafts.length} photo(s) suffisent-elles pour votre vitrine
                  initiale ?
                </p>
                <p className="text-[11px] text-[#665E4E]">
                  Une fois scellé, ce canal privé se ferme définitivement et la
                  suite se gère depuis le Cockpit Admin.
                </p>
                <div className="flex flex-wrap gap-2">
                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-full text-xs font-medium btn-vintage-ghost"
                    >
                      Non, j’ajouterai encore des photos
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSeal}
                    className="px-4 py-2 rounded-full text-xs font-medium btn-limewood"
                  >
                    Oui, elles suffisent — Sceller ce canal
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
