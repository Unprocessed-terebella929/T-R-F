import { useState } from 'react';
import { MAX_INITIAL_PHOTOS } from '../data/storeCatalog.js';
import {
  FOUNDER_MASTER_KEY,
  compressImageFile,
  isInitialImportSealed,
  sanitizePrice,
  sanitizeText,
  sealInitialImportForever,
  unsealInitialImportFounder,
  verifyPrivateKey
} from '../security/vaultCore.js';
import { CloseIcon, UploadIcon } from './Icons.jsx';
import { DraftRow, SealedNotice, UnlockForm } from './ImportModalParts.jsx';

const BACKDROP_CLS = [
  'fixed inset-0 z-50 bg-[#1C1914]/65 backdrop-blur-sm',
  'flex items-center justify-center p-3 sm:p-4'
].join(' ');
const PANEL_CLS = [
  'w-full max-w-3xl max-h-[90dvh] overflow-y-auto',
  'rounded-2xl archival-card p-4 sm:p-6 space-y-5 animate-rise'
].join(' ');
const CLOSE_CLS = [
  'min-w-[40px] min-h-[40px] flex items-center justify-center',
  'rounded-full btn-vintage-ghost shrink-0'
].join(' ');

async function buildProductFromFile(file, idx) {
  const dataUrl = await compressImageFile(file);
  const clean = sanitizeText(file.name.replace(/\.[^.]+$/, ''), 48);
  const suffix = Math.random().toString(36).slice(2, 6);
  return {
    id: `REF-${Date.now()}-${idx}-${suffix}`,
    title: clean || 'Pièce sans titre',
    category: 'bijouterie',
    price: 0,
    image: dataUrl
  };
}

function SealConfirmCard({ count, remaining, onKeepOpen, onSeal }) {
  return (
    <div className="rounded-xl border border-[#C2B088] bg-[#FAF7F0] p-4 space-y-3">
      <p className="text-xs font-bold text-[#1C1914]">
        Ces {count} photo(s) suffisent-elles pour votre vitrine initiale ?
      </p>
      <p className="text-[11px] text-[#665E4E]">
        Une fois scellé, ce canal privé se ferme définitivement et la suite se
        gère depuis le Cockpit Admin.
      </p>
      <div className="flex flex-wrap gap-2">
        {remaining > 0 && (
          <button
            type="button"
            onClick={onKeepOpen}
            className="px-4 py-2 min-h-[40px] rounded-full text-xs font-medium btn-vintage-ghost"
          >
            Non, j’ajouterai encore des photos
          </button>
        )}
        <button
          type="button"
          onClick={onSeal}
          className="px-4 py-2 min-h-[40px] rounded-full text-xs font-medium btn-limewood"
        >
          Oui, elles suffisent — Sceller ce canal
        </button>
      </div>
    </div>
  );
}

const TOOLBAR_ROW_CLS = [
  'flex flex-wrap items-center justify-between gap-3',
  'rounded-xl bg-[#EAE2D2]/65 px-4 py-3'
].join(' ');
const UPLOAD_LBL_CLS = [
  'inline-flex items-center gap-2 px-4 py-2 min-h-[40px]',
  'rounded-full text-xs font-medium cursor-pointer'
].join(' ');

function UploadToolbar({ count, remaining, busy, onFiles }) {
  const uploadCls =
    remaining === 0 ? 'opacity-40 pointer-events-none' : 'btn-limewood';
  return (
    <div className={TOOLBAR_ROW_CLS}>
      <div className="text-xs">
        <span className="font-bold text-[#1C1914]">
          {count} / {MAX_INITIAL_PHOTOS} photos importées
        </span>
        <span className="block text-[11px] text-[#665E4E]">
          Encore {remaining} emplacement(s) disponible(s).
        </span>
      </div>
      <label className={`${UPLOAD_LBL_CLS} ${uploadCls}`}>
        <UploadIcon className="w-3.5 h-3.5" />
        <span>{busy ? 'Traitement...' : 'Importer des photos'}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onFiles}
          className="hidden"
          disabled={busy || remaining === 0}
        />
      </label>
    </div>
  );
}

function ImportWorkspace({
  drafts,
  remaining,
  busy,
  note,
  onFiles,
  onUpdate,
  onRemove,
  onClose,
  onSeal
}) {
  return (
    <div className="space-y-4">
      <UploadToolbar
        count={drafts.length}
        remaining={remaining}
        busy={busy}
        onFiles={onFiles}
      />
      {note && <p className="text-xs text-[#4E4634] font-medium">{note}</p>}
      {drafts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
          {drafts.map((item) => (
            <DraftRow
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
      {drafts.length > 0 && (
        <SealConfirmCard
          count={drafts.length}
          remaining={remaining}
          onKeepOpen={onClose}
          onSeal={onSeal}
        />
      )}
    </div>
  );
}

function renderPanelBody(state) {
  if (state.sealed) {
    return (
      <SealedNotice
        count={state.productsCount}
        onFounderReopen={state.onFounderReopen}
      />
    );
  }
  if (!state.unlocked) {
    return (
      <UnlockForm
        accessKey={state.accessKey}
        setAccessKey={state.setAccessKey}
        authError={state.authError}
        busy={state.busy}
        onUnlock={state.onUnlock}
      />
    );
  }
  return <ImportWorkspace {...state.workspace} />;
}

async function compressBatch(batch) {
  const results = await Promise.allSettled(batch.map(buildProductFromFile));
  const created = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
  const failed = results.find((r) => r.status === 'rejected');
  const errorMsg = failed?.reason?.message || '';
  return { created, errorMsg };
}

function updateDraftList(drafts, id, field, value) {
  return drafts.map((item) => {
    if (item.id !== id) {
      return item;
    }
    const val =
      field === 'price' ? sanitizePrice(value) : sanitizeText(value, 60);
    return { ...item, [field]: val };
  });
}

function PanelHeader({ onClose }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#4E4634]/15 pb-4">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#4E4634] font-bold">
          Passe-Partout PDG · {FOUNDER_MASTER_KEY} · Exemption Pare-Feu
        </p>
        <h2 className="font-display text-xl sm:text-2xl text-[#1C1914]">
          Importation directe du catalogue (Accès Fondateur)
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className={CLOSE_CLS}
        aria-label="Fermer"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

function useImportDrafts(products, onSaveProducts) {
  const [drafts, setDrafts] = useState(products);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const remaining = Math.max(0, MAX_INITIAL_PHOTOS - drafts.length);

  const commit = (nextList) => {
    setDrafts(nextList);
    onSaveProducts(nextList);
  };

  const handleFiles = async (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) {
      return;
    }
    const msg =
      selected.length > remaining
        ? `Limite de ${MAX_INITIAL_PHOTOS} photos atteinte.`
        : '';
    setNote(msg);
    setBusy(true);
    const { created, errorMsg } = await compressBatch(
      selected.slice(0, remaining)
    );
    if (errorMsg) {
      setNote(errorMsg);
    }
    commit([...drafts, ...created].slice(0, MAX_INITIAL_PHOTOS));
    setBusy(false);
  };

  const handleUpdate = (id, field, value) =>
    commit(updateDraftList(drafts, id, field, value));
  const handleRemove = (id) => commit(drafts.filter((item) => item.id !== id));

  return {
    drafts,
    remaining,
    note,
    busy,
    setBusy,
    handleFiles,
    handleUpdate,
    handleRemove
  };
}

function usePanelAuth(setBusy) {
  const [unlocked, setUnlocked] = useState(true);
  const [accessKey, setAccessKey] = useState(FOUNDER_MASTER_KEY);
  const [authError, setAuthError] = useState('');

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

  return { unlocked, accessKey, setAccessKey, authError, handleUnlock };
}

export function OneTimeImportPanel({ products, onSaveProducts, onClose }) {
  const [sealed, setSealed] = useState(() => isInitialImportSealed());
  const d = useImportDrafts(products, onSaveProducts);
  const auth = usePanelAuth(d.setBusy);

  const handleSeal = () => {
    onSaveProducts(d.drafts);
    sealInitialImportForever();
    setSealed(true);
  };

  const handleFounderReopen = () => {
    unsealInitialImportFounder();
    setSealed(false);
  };

  const workspace = {
    drafts: d.drafts,
    remaining: d.remaining,
    busy: d.busy,
    note: d.note,
    onFiles: d.handleFiles,
    onUpdate: d.handleUpdate,
    onRemove: d.handleRemove,
    onClose,
    onSeal: handleSeal
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Canal privé d'importation"
      className={BACKDROP_CLS}
    >
      <div className={PANEL_CLS}>
        <PanelHeader onClose={onClose} />
        {renderPanelBody({
          sealed,
          unlocked: auth.unlocked,
          productsCount: products.length,
          accessKey: auth.accessKey,
          setAccessKey: auth.setAccessKey,
          authError: auth.authError,
          busy: d.busy,
          onUnlock: auth.handleUnlock,
          onFounderReopen: handleFounderReopen,
          workspace
        })}
      </div>
    </div>
  );
}
