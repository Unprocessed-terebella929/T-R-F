import { useState } from 'react';
import { SIGNATURE_INKS } from '../data/storeCatalog.js';
import { sanitizeText } from '../security/vaultCore.js';
import { FeatherIcon } from './Icons.jsx';
import { Reveal } from './Reveal.jsx';

const MAX_AUTHOR_LEN = 40;
const MAX_NOTE_LEN = 120;
const FIELD_CLS = [
  'w-full px-3.5 py-2.5 rounded-xl border border-[#4E4634]/20',
  'bg-white text-xs focus:outline-none focus:border-[#4E4634]'
].join(' ');

function InkPicker({ ink, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      {SIGNATURE_INKS.map((item) => {
        const active =
          ink === item.hex
            ? 'border-[#C2B088] scale-110 shadow-sm'
            : 'border-transparent';
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.hex)}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${active}`}
            style={{ backgroundColor: item.hex }}
            title={item.label}
            aria-label={item.label}
          />
        );
      })}
    </div>
  );
}

function buildSignatureEntry(author, note, ink) {
  const cleanAuthor = sanitizeText(author, MAX_AUTHOR_LEN);
  const cleanNote = sanitizeText(note, MAX_NOTE_LEN);
  if (!cleanAuthor || !cleanNote) {
    return null;
  }
  return {
    id: `SIG-${Date.now()}`,
    author: cleanAuthor,
    note: cleanNote,
    ink,
    date: new Date().toISOString().split('T')[0]
  };
}

function SignatureForm({ onAddSignature }) {
  const [author, setAuthor] = useState('');
  const [note, setNote] = useState('');
  const [ink, setInk] = useState(SIGNATURE_INKS[0].hex);

  const handleSubmit = (event) => {
    event.preventDefault();
    const entry = buildSignatureEntry(author, note, ink);
    if (!entry) {
      return;
    }
    onAddSignature(entry);
    setAuthor('');
    setNote('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="archival-card rounded-2xl p-4 sm:p-5 space-y-3"
    >
      <div className="flex items-center gap-2 text-xs text-[#4E4634]">
        <FeatherIcon className="w-4 h-4" />
        <span className="uppercase tracking-[0.16em]">Livre de Signatures</span>
      </div>
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Votre nom ou initiales"
        className={FIELD_CLS}
        required
      />
      <textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Votre appréciation..."
        className={FIELD_CLS}
        required
      />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <InkPicker ink={ink} onChange={setInk} />
        <button
          type="submit"
          className="px-5 py-2.5 min-h-[40px] rounded-full text-xs font-medium btn-limewood"
        >
          Apposer
        </button>
      </div>
    </form>
  );
}

function SignatureRegistry({ signatures }) {
  return (
    <div className="archival-card rounded-2xl p-4 sm:p-5 space-y-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#665E4E]">
        Registre ({signatures.length})
      </p>
      {signatures.length === 0 ? (
        <p className="text-xs text-[#665E4E] py-6 text-center">
          Aucune signature enregistrée pour le moment.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {signatures.map((sig) => (
            <div
              key={sig.id}
              className="p-3 rounded-xl bg-[#F4EFE4]/85 border border-[#4E4634]/10"
            >
              <p className="text-xs italic break-words" style={{ color: sig.ink }}>
                « {sig.note} »
              </p>
              <p className="text-[10px] text-[#665E4E] mt-1">
                — {sig.author} · {sig.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SignaturesView({ signatures, onAddSignature }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Reveal>
        <SignatureForm onAddSignature={onAddSignature} />
      </Reveal>
      <Reveal delay={90}>
        <SignatureRegistry signatures={signatures} />
      </Reveal>
    </section>
  );
}
