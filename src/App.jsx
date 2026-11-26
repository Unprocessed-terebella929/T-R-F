import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header.jsx';
import {
  BoutiqueView,
  SignaturesView,
  StudioView,
  SuiviView
} from './components/StoreViews.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { OneTimeImportPanel } from './components/OneTimeImportPanel.jsx';
import { BRAND_SLOGAN, COCKPIT_URL } from './data/storeCatalog.js';
import {
  STORAGE_KEYS,
  readStorage,
  writeStorage
} from './security/vaultCore.js';

const TAB_ORDER = ['boutique', 'studio', 'suivi', 'signatures'];

function isPrivateImportHash() {
  return window.location.hash === '#canal-initial';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('boutique');
  const [products, setProducts] = useState(() =>
    readStorage(STORAGE_KEYS.PRODUCTS, [])
  );
  const [cart, setCart] = useState(() => readStorage(STORAGE_KEYS.CART, []));
  const [orders, setOrders] = useState(() =>
    readStorage(STORAGE_KEYS.ORDERS, [])
  );
  const [signatures, setSignatures] = useState(() =>
    readStorage(STORAGE_KEYS.SIGNATURES, [])
  );
  const [studioItem, setStudioItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(() => isPrivateImportHash());
  const touchStartX = useRef(0);

  useEffect(() => {
    const onHashChange = () => setImportOpen(isPrivateImportHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const saveProducts = (nextList) => {
    setProducts(nextList);
    writeStorage(STORAGE_KEYS.PRODUCTS, nextList);
  };

  const handleAddToCart = (item) => {
    const nextCart = [...cart, item];
    setCart(nextCart);
    writeStorage(STORAGE_KEYS.CART, nextCart);
    setCartOpen(true);
  };

  const handleRemoveCart = (index) => {
    const nextCart = cart.filter((_, i) => i !== index);
    setCart(nextCart);
    writeStorage(STORAGE_KEYS.CART, nextCart);
  };

  const handleCheckout = (paymentInfo) => {
    const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const code = Math.floor(1000 + Math.random() * 9000);
    const order = {
      id: `TR-2026-${code}`,
      date: new Date().toISOString().split('T')[0],
      amount: total,
      paymentMethod: paymentInfo?.paymentMethod || 'Mobile Money',
      depositId: paymentInfo?.depositId || '',
      step: 1
    };
    const nextOrders = [order, ...orders];
    setOrders(nextOrders);
    writeStorage(STORAGE_KEYS.ORDERS, nextOrders);
    setCart([]);
    writeStorage(STORAGE_KEYS.CART, []);
    setCartOpen(false);
    setActiveTab('suivi');
  };

  const handleAddSignature = (entry) => {
    const nextList = [entry, ...signatures].slice(0, 50);
    setSignatures(nextList);
    writeStorage(STORAGE_KEYS.SIGNATURES, nextList);
  };

  const handleTouchEnd = (endX) => {
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) < 65) {
      return;
    }
    const idx = TAB_ORDER.indexOf(activeTab);
    if (delta < 0 && idx < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[idx + 1]);
    } else if (delta > 0 && idx > 0) {
      setActiveTab(TAB_ORDER[idx - 1]);
    }
  };

  const closePrivatePanel = () => {
    setImportOpen(false);
    if (window.location.hash === '#canal-initial') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <div
      className="min-h-screen vintage-sand-bg flex flex-col"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientX)}
    >
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        cartCount={cart.length}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-7">
        {activeTab === 'boutique' && (
          <BoutiqueView
            products={products}
            onAddToCart={handleAddToCart}
            onOpenStudio={(item) => {
              setStudioItem(item);
              setActiveTab('studio');
            }}
          />
        )}
        {activeTab === 'studio' && (
          <StudioView activeItem={studioItem} products={products} />
        )}
        {activeTab === 'suivi' && <SuiviView orders={orders} />}
        {activeTab === 'signatures' && (
          <SignaturesView
            signatures={signatures}
            onAddSignature={handleAddSignature}
          />
        )}
      </main>

      <footer className="border-t border-[#4E4634]/15 py-5 px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#665E4E]">
          <span>© 2026 Ta référence.com — {BRAND_SLOGAN}</span>
          <a
            href={COCKPIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1C1914] transition-colors"
          >
            Accès Cockpit privé ↗
          </a>
        </div>
      </footer>

      <CartDrawer
        isOpen={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onRemove={handleRemoveCart}
        onCheckout={handleCheckout}
      />

      {importOpen && (
        <OneTimeImportPanel
          products={products}
          onSaveProducts={saveProducts}
          onClose={closePrivatePanel}
        />
      )}
    </div>
  );
}
