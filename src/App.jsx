import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header.jsx';
import { BoutiqueView } from './components/BoutiqueView.jsx';
import { StudioView } from './components/StudioView.jsx';
import { SuiviView } from './components/SuiviView.jsx';
import { SignaturesView } from './components/SignaturesView.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { OneTimeImportPanel } from './components/OneTimeImportPanel.jsx';
import { ArrowUpIcon } from './components/Icons.jsx';
import { BRAND_SLOGAN, COCKPIT_URL, NAV_TABS } from './data/storeCatalog.js';
import {
  STORAGE_KEYS,
  readStorage,
  writeStorage
} from './security/vaultCore.js';

const TAB_ORDER = NAV_TABS.map((t) => t.id);

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
  const [showTop, setShowTop] = useState(false);
  const touchStart = useRef({ x: 0, y: 0, ignored: false });

  useEffect(() => {
    const onHashChange = () => setImportOpen(isPrivateImportHash());
    const onScroll = () => setShowTop(window.scrollY > 260);
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    switchTab('suivi');
  };

  const handleAddSignature = (entry) => {
    const nextList = [entry, ...signatures].slice(0, 50);
    setSignatures(nextList);
    writeStorage(STORAGE_KEYS.SIGNATURES, nextList);
  };

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    const target = e.target;
    const ignored = Boolean(
      target &&
        target.closest &&
        target.closest('input, select, textarea, button, .no-scrollbar, [role="dialog"]')
    );
    touchStart.current = { x: t.clientX, y: t.clientY, ignored };
  };

  const handleTouchEnd = (e) => {
    if (touchStart.current.ignored || cartOpen || importOpen) {
      return;
    }
    const t = e.changedTouches[0];
    const deltaX = t.clientX - touchStart.current.x;
    const deltaY = t.clientY - touchStart.current.y;
    if (Math.abs(deltaX) < 72 || Math.abs(deltaX) < Math.abs(deltaY) * 1.6) {
      return;
    }
    const idx = TAB_ORDER.indexOf(activeTab);
    if (deltaX < 0 && idx < TAB_ORDER.length - 1) {
      switchTab(TAB_ORDER[idx + 1]);
    } else if (deltaX > 0 && idx > 0) {
      switchTab(TAB_ORDER[idx - 1]);
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
      className="min-h-[100dvh] vintage-sand-bg flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Header
        activeTab={activeTab}
        onChangeTab={switchTab}
        cartCount={cart.length}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1 w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9">
        <div key={activeTab} className="animate-tab-enter">
          {activeTab === 'boutique' && (
            <BoutiqueView
              products={products}
              onAddToCart={handleAddToCart}
              onOpenStudio={(item) => {
                setStudioItem(item);
                switchTab('studio');
              }}
            />
          )}
          {activeTab === 'studio' && (
            <StudioView
              activeItem={studioItem}
              products={products}
              onSelectItem={setStudioItem}
            />
          )}
          {activeTab === 'suivi' && <SuiviView orders={orders} />}
          {activeTab === 'signatures' && (
            <SignaturesView
              signatures={signatures}
              onAddSignature={handleAddSignature}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-[#4E4634]/15 py-5 px-3.5 sm:px-6 lg:px-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
        <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#665E4E]">
          <span>© 2026 Ta référence.com — {BRAND_SLOGAN}</span>
          <a
            href={COCKPIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1C1914] transition-colors py-1"
          >
            Accès Cockpit privé ↗
          </a>
        </div>
      </footer>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-30 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full btn-limewood shadow-lg animate-rise"
          aria-label="Remonter en haut"
        >
          <ArrowUpIcon className="w-4 h-4" />
        </button>
      )}

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
