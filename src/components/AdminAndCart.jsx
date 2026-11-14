import { useState } from 'react';
import { sanitizeInput } from '../security/sovereignCore.js';

export function UnlockedAdminBanner({ onOpenAdmin, onLock }) {
  const barCls =
    'bg-cream-highlight px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs';
  return (
    <div className={barCls}>
      <span className="font-semibold">Session Administrateur active</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onOpenAdmin}
          className="px-3 py-1 rounded-lg bg-white/80 font-semibold"
        >
          Ouvrir Admin
        </button>
        <button
          type="button"
          onClick={onLock}
          className="px-3 py-1 rounded-lg bg-[#EFE6D8] font-semibold"
        >
          Verrouiller
        </button>
      </div>
    </div>
  );
}

function AddProductForm({ catalogues, onAddProduct }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bijouterie');
  const [price, setPrice] = useState('120');
  const [photos, setPhotos] = useState([]);

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setPhotos((prev) => [...prev, String(reader.result || '')]);
      reader.readAsDataURL(file);
    });
  };

  const handleCreate = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    onAddProduct({
      id: `REF-${Date.now().toString().slice(-3)}`,
      name: sanitizeInput(name),
      category,
      price: Number(price) || 100,
      atelier: 'Collection Officielle',
      shortDesc: 'Pièce publiée depuis l’espace Admin.',
      descriptif: 'Pièce présentée en haute définition.',
      images: photos,
      variants: [{ id: 'v1', name: 'Standard', color: '#DECAB1' }]
    });
    setName('');
    setPhotos([]);
  };

  return (
    <form onSubmit={handleCreate} className="card-silk rounded-3xl p-6 space-y-3">
      <h2 className="font-serif text-lg font-semibold">Nouvelle Pièce & Photos</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom du produit"
        className="w-full px-3.5 py-2 rounded-xl border text-sm"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border text-sm"
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
          className="px-3 py-2 rounded-xl border text-sm"
        />
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="text-xs"
      />
      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-cream-highlight text-xs font-semibold"
      >
        Publier en Vitrine ({photos.length} photo(s))
      </button>
    </form>
  );
}

function MessagesInbox({ messages, productsCount, onReplyMessage }) {
  const [replyText, setReplyText] = useState('');
  return (
    <div className="card-silk rounded-3xl p-6 space-y-3">
      <h2 className="font-serif text-lg font-semibold">
        Messages ({messages.length}) · Produits ({productsCount})
      </h2>
      {messages.map((msg) => (
        <div key={msg.id} className="p-3 rounded-xl bg-[#F6EFE4] space-y-2 text-xs">
          <p className="font-semibold">
            {msg.sender} — {msg.subject}
          </p>
          <p>{msg.body}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Votre réponse..."
              className="flex-1 px-2.5 py-1.5 rounded-lg border bg-white"
            />
            <button
              type="button"
              onClick={() => {
                onReplyMessage(msg.id, sanitizeInput(replyText));
                setReplyText('');
              }}
              className="px-3 py-1.5 rounded-lg bg-cream-highlight font-semibold"
            >
              Répondre
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminPanel({ adminProps }) {
  const { products, catalogues, messages, onAddProduct } = adminProps;
  const { onClearVectorCatalog, onReplyMessage, onLock } = adminProps;
  const headCls =
    'bg-cream-highlight rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4';

  return (
    <section className="space-y-6 pt-4">
      <div className={headCls}>
        <h1 className="font-serif text-2xl font-semibold">Espace Administrateur</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClearVectorCatalog}
            className="px-4 py-2 rounded-xl bg-white/85 text-xs font-semibold"
          >
            Retirer le catalogue par défaut
          </button>
          <button
            type="button"
            onClick={onLock}
            className="px-4 py-2 rounded-xl bg-[#EFE6D8] text-xs font-semibold"
          >
            Fermer la session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddProductForm catalogues={catalogues} onAddProduct={onAddProduct} />
        <MessagesInbox
          messages={messages}
          productsCount={products.length}
          onReplyMessage={onReplyMessage}
        />
      </div>
    </section>
  );
}

export function AdminAuthModal({ modalState }) {
  const { isOpen, code, onChangeCode, onSubmit, onClose } = modalState;
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="card-silk rounded-3xl p-6 max-w-xs w-full space-y-4"
      >
        <h3 className="font-serif text-lg font-semibold">Accès</h3>
        <input
          type="password"
          value={code}
          onChange={(e) => onChangeCode(e.target.value)}
          placeholder="Code"
          className="w-full px-3.5 py-2 rounded-xl border text-sm"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs">
            Fermer
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-cream-highlight text-xs font-semibold"
          >
            Valider
          </button>
        </div>
      </form>
    </div>
  );
}

export function MessagePopup({ popupState }) {
  const { isOpen, messages, onSend, onClose } = popupState;
  const [text, setText] = useState('');
  if (!isOpen) {
    return null;
  }

  const handleSend = (event) => {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }
    onSend(sanitizeInput(text));
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="card-silk rounded-3xl p-6 max-w-md w-full space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-semibold">Messages</h3>
          <button type="button" onClick={onClose} className="text-xs underline">
            Fermer
          </button>
        </div>
        <div className="max-h-52 overflow-y-auto space-y-2 text-xs">
          {messages.map((m) => (
            <div key={m.id} className="p-3 rounded-xl bg-[#F6EFE4]">
              <p className="font-semibold">{m.body}</p>
              {m.reply && (
                <p className="text-[#5A3826] mt-1">Réponse : {m.reply}</p>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 px-3 py-2 rounded-xl border text-xs"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cream-highlight text-xs font-semibold"
          >
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}

export function CartDrawer({ cartState }) {
  const { isOpen, items, total, onClose, onUpdateQty, onCheckout } = cartState;
  if (!isOpen) {
    return null;
  }
  const drawerCls =
    'bg-[#FAF6F0] w-full max-w-md h-full p-6 flex flex-col justify-between';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
      <div className={drawerCls}>
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="font-serif text-xl font-semibold">Panier</h2>
          <button type="button" onClick={onClose} className="text-xs underline">
            Fermer
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.cartKey}
              className="card-silk p-3.5 rounded-2xl flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs">{item.price} $</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.cartKey, -1)}
                  className="px-2 py-1 border rounded"
                >
                  -
                </button>
                <span className="text-xs font-bold">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.cartKey, 1)}
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onCheckout}
            className="w-full py-3 rounded-xl bg-cream-highlight text-xs font-semibold"
          >
            Commander ({total} $)
          </button>
        )}
      </div>
    </div>
  );
}
