import { useState } from 'react';
import { Lock, Upload, CheckCircle2, Trash2, ShieldCheck, X } from 'lucide-react';
import { COCKPIT_URL, MAISONS, MAX_INITIAL_PHOTOS } from '../data/storeCatalog.js';
import {
  compressImageFile,
  isInitialImportSealed,
  sanitizePrice,
  sanitizeText,
  sealInitialImportForever,
  verifyPrivateKey
} from '../security/vaultCore.js';

const CATEGORIES = MAISONS.filter((m) => m.id !== 'tous');

export function OneTimeImportPanel({ products, onSaveProducts, onClose }) {
  const [sealed, setSealed] = useState(() => isInitialImportSealed());
  const [unlocked, setUnlocked] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState(products);
  const [uploadNote, setUploadNote] = useState('');
  const [askConfirm, setAskConfirm] = useState(false);

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
    const allowedBatch = selected.slice(0, remaining);
    if (selected.length > remaining) {
      setUploadNote(`Limite atteinte : seules ${remaining} photo(s) ajoutées.`);
    } else {
      setUploadNote('');
    }
    setBusy(true);
    const created = [];
    for (const file of allowedBatch) {
      try {
        const dataUrl = await compressImageFile(file);
        const cleanTitle = sanitizeText(file.name.replace(/\.[^.]+$/, ''), 48);
        created.push({
          id: `REF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: cleanTitle || 'Pièce sans titre',
          category: 'bijouterie',
          price: 0,
          image: dataUrl
        });
      } catch (err) {
        setUploadNote(err.message);
      }
    }
    const nextList = [...drafts, ...created].slice(0, MAX_INITIAL_PHOTOS);
    setDrafts(nextList);
    onSaveProducts(nextList);
    if (created.length > 0) {
      setAskConfirm(true);
    }
    setBusy(false);
  };

  const updateItem = (id, field, value) => {
    const nextList = drafts.map((item) => {
      if (item.id !== id) {
        return item;
      }
      if (field === 'price') {
        return { ...item, price: sanitizePrice(value) };
      }
      return { ...item, [field]: sanitizeText(value, 60) };
    });
    setDrafts(nextList);
    onSaveProducts(nextList);
  };

  const removeItem = (id) => {
    const nextList = drafts.filter((item) => item.id !== id);
    setDrafts(nextList);
    onSaveProducts(nextList);
  };

  const handleSealChannel = () => {
    onSaveProducts(drafts);
    sealInitialImportForever();
    setSealed(true);
    setAskConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1914]/65 backdrop-blur-xs flex items-center justify-center p-4">
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
            <X className="w-4 h-4" />
          </button>
        </div>

        {sealed ? (
          <div className="rounded-xl bg-[#EAE2D2]/70 p-6 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 mx-auto text-[#4E4634]" />
            <h3 className="font-display text-xl">Canal initial définitivement scellé</h3>
            <p className="text-xs text-[#665E4E] max-w-md mx-auto">
              Vos {products.length} photo(s) sont publiées sur la boutique. Toute
              prochaine gestion passe exclusivement par votre Cockpit sécurisé.
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
        ) : !unlocked ? (
          <form onSubmit={handleUnlock} className="max-w-sm mx-auto py-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#4E4634]">
              <Lock className="w-4 h-4" />
              <span>Vérification serveur requise (clé Admin Vercel)</span>
            </div>
            <input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Saisissez votre clé d’accès privée"
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
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#EAE2D2]/60 px-4 py-3">
              <div className="text-xs">
                <span className="font-bold text-[#1C1914]">
                  {drafts.length} / {MAX_INITIAL_PHOTOS} photos importées
                </span>
                <span className="block text-[11px] text-[#665E4E]">
                  Il vous reste {remaining} emplacement(s) avant la limite unique.
                </span>
              </div>

              <label
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium cursor-pointer ${
                  remaining === 0 ? 'opacity-40 pointer-events-none' : 'btn-limewood'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
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

            {uploadNote && (
              <p className="text-xs text-[#4E4634] font-medium">{uploadNote}</p>
            )}

            {drafts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {drafts.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-2.5 rounded-xl border border-[#4E4634]/15 bg-white"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded-lg bg-[#EAE2D2]"
                    />
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                        placeholder="Nom de la pièce"
                        className="w-full px-2 py-1 text-xs border rounded-md"
                      />
                      <div className="flex gap-1.5">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            updateItem(item.id, 'category', e.target.value)
                          }
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
                          onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                          placeholder="USD"
                          className="w-20 px-2 py-1 text-[11px] border rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-[#665E4E] hover:text-[#1C1914]"
                          aria-label="Retirer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(askConfirm || drafts.length > 0) && (
              <div className="rounded-xl border border-[#C2B088] bg-[#FAF7F0] p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4E4634] mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-[#1C1914]">
                      Confirmation de votre dotation initiale ({drafts.length} /{' '}
                      {MAX_INITIAL_PHOTOS})
                    </p>
                    <p className="text-[#665E4E] mt-0.5">
                      Ces photos sont-elles suffisantes pour lancer votre vitrine, ou
                      souhaitez-vous encore en importer avant de fermer ce canal ?
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={() => setAskConfirm(false)}
                      className="px-4 py-2 rounded-full text-xs font-medium btn-vintage-ghost"
                    >
                      Non, j’ajouterai encore des photos
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSealChannel}
                    className="px-4 py-2 rounded-full text-xs font-medium btn-limewood"
                  >
                    Oui, elles suffisent — Sceller ce canal définitivement
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
