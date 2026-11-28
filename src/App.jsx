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
import {
  pullPublishedState,
  pushClientEvent
} from './security/bridgeClient.js';

const TAB_ORDER = NAV_TABS.map((t) => t.id);
const SCROLL_TOP_PX = 260;
const SCROLL_HIDE_START_PX = 140;
const SCROLL_DELTA_DOWN = 14;
const SCROLL_DELTA_UP = -6;
const SWIPE_MIN_PX = 54;
const SWIPE_AXIS_RATIO = 1.35;
const SWIPE_COOLDOWN_MS = 160;
const ORDER_CODE_MIN = 1000;
const ORDER_CODE_SPAN = 9000;
const MAX_SIGNATURES = 50;
const SWIPE_IGNORE_SEL =
  'input, select, textarea, button, a, label, .no-scrollbar, [role="dialog"]';

const SHELL_WIDTH =
  'max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8';
const MAIN_CLS = `flex-1 w-full ${SHELL_WIDTH} py-5 sm:py-7 lg:py-9`;
const FOOTER_CLS = [
  'border-t border-[#4E4634]/15 py-5 text-center',
  'pb-[max(1.25rem,env(safe-area-inset-bottom))]'
].join(' ');
const FOOTER_ROW_CLS = [
  SHELL_WIDTH,
  'flex flex-col sm:flex-row items-center justify-between',
  'gap-2 text-[11px] text-[#665E4E]'
].join(' ');
const TOP_BTN_CLS = 'back-to-top animate-rise';

function isPrivateImportHash() {
  return window.location.hash === '#canal-initial';
}

function buildOrder(cart, paymentInfo) {
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const code = Math.floor(ORDER_CODE_MIN + Math.random() * ORDER_CODE_SPAN);
  return {
    id: `TR-2026-${code}`,
    date: new Date().toISOString().split('T')[0],
    amount: total,
    paymentMethod: paymentInfo?.paymentMethod || 'Mobile Money',
    depositId: paymentInfo?.depositId || '',
    step: 1
  };
}

function resolveSwipeTarget(activeTab, deltaX, deltaY) {
  const absX = Math.abs(deltaX);
  if (absX < SWIPE_MIN_PX || absX < Math.abs(deltaY) * SWIPE_AXIS_RATIO) {
    return null;
  }
  const idx = TAB_ORDER.indexOf(activeTab);
  if (deltaX < 0 && idx < TAB_ORDER.length - 1) {
    return TAB_ORDER[idx + 1];
  }
  if (deltaX > 0 && idx > 0) {
    return TAB_ORDER[idx - 1];
  }
  return null;
}

function ActiveView({
  activeTab,
  products,
  studioItem,
  orders,
  signatures,
  onAddToCart,
  onOpenStudio,
  onSelectItem,
  onAddSignature
}) {
  if (activeTab === 'studio') {
    return (
      <StudioView
        activeItem={studioItem}
        products={products}
        onSelectItem={onSelectItem}
      />
    );
  }
  if (activeTab === 'suivi') {
    return <SuiviView orders={orders} />;
  }
  if (activeTab === 'signatures') {
    return (
      <SignaturesView
        signatures={signatures}
        onAddSignature={onAddSignature}
      />
    );
  }
  return (
    <BoutiqueView
      products={products}
      onAddToCart={onAddToCart}
      onOpenStudio={onOpenStudio}
    />
  );
}

function SiteFooter({ onOpenImport }) {
  return (
    <footer className={FOOTER_CLS}>
      <div className={FOOTER_ROW_CLS}>
        <span>© 2026 Ta référence.com — {BRAND_SLOGAN}</span>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="text-[10px] tracking-[0.16em] uppercase text-[#4E4634] font-bold">
            ✦ Passe-Partout PDG :
          </span>
          <button
            type="button"
            onClick={onOpenImport}
            className="hover:text-[#1C1914] underline decoration-[#C2B088] underline-offset-2 transition-colors py-1"
          >
            Canal #Initial
          </button>
          <span>·</span>
          <a
            href={`${COCKPIT_URL}?cercle=privilege`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1C1914] transition-colors py-1"
          >
            Mode Privilège (Admin) ↗
          </a>
          <span>·</span>
          <a
            href={`${COCKPIT_URL}?cercle=sovereign`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1C1914] font-bold text-[#1C1914] transition-colors py-1"
          >
            Mode Souverain (Admin+) ↗
          </a>
        </div>
      </div>
    </footer>
  );
}

function applyBridgePayload(payload, setters) {
  if (Array.isArray(payload.products)) {
    setters.setProducts(payload.products);
    writeStorage(STORAGE_KEYS.PRODUCTS, payload.products);
  }
  if (Array.isArray(payload.orders)) {
    setters.setOrders(payload.orders);
    writeStorage(STORAGE_KEYS.ORDERS, payload.orders);
  }
  if (Array.isArray(payload.signatures)) {
    setters.setSignatures(payload.signatures);
    writeStorage(STORAGE_KEYS.SIGNATURES, payload.signatures);
  }
  if (typeof payload.sealed === 'boolean') {
    writeStorage(STORAGE_KEYS.SEALED, payload.sealed);
  }
}

function useStoreState() {
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

  useEffect(() => {
    let active = true;
    pullPublishedState().then((payload) => {
      if (active && payload) {
        applyBridgePayload(payload, { setProducts, setOrders, setSignatures });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const saveProducts = (next) => {
    setProducts(next);
    writeStorage(STORAGE_KEYS.PRODUCTS, next);
  };
  const addToCart = (item) => {
    const next = [...cart, item];
    setCart(next);
    writeStorage(STORAGE_KEYS.CART, next);
  };
  const removeFromCart = (index) => {
    const next = cart.filter((_, i) => i !== index);
    setCart(next);
    writeStorage(STORAGE_KEYS.CART, next);
  };
  const completeOrder = (paymentInfo) => {
    const order = buildOrder(cart, paymentInfo);
    const next = [order, ...orders];
    setOrders(next);
    writeStorage(STORAGE_KEYS.ORDERS, next);
    setCart([]);
    writeStorage(STORAGE_KEYS.CART, []);
    pushClientEvent('order', order);
  };
  const addSignature = (entry) => {
    const next = [entry, ...signatures].slice(0, MAX_SIGNATURES);
    setSignatures(next);
    writeStorage(STORAGE_KEYS.SIGNATURES, next);
    pushClientEvent('signature', entry);
  };

  return {
    products,
    cart,
    orders,
    signatures,
    saveProducts,
    addToCart,
    removeFromCart,
    completeOrder,
    addSignature
  };
}

function useScrollChrome() {
  const [showTop, setShowTop] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY.current;
      setShowTop(y > SCROLL_TOP_PX);
      if (y <= SCROLL_HIDE_START_PX) {
        setChromeHidden(false);
      } else if (delta > SCROLL_DELTA_DOWN) {
        setChromeHidden(true);
      } else if (delta < SCROLL_DELTA_UP) {
        setChromeHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const resetChrome = () => {
    lastY.current = 0;
    setChromeHidden(false);
    setShowTop(false);
  };

  return { showTop, chromeHidden, resetChrome };
}

function useAppNavigation(cartOpen, importOpen) {
  const [activeTab, setActiveTab] = useState('boutique');
  const chrome = useScrollChrome();
  const touchStart = useRef({ x: 0, y: 0, ignored: false, time: 0 });
  const lastSwipeAt = useRef(0);

  const switchTab = (tabId) => {
    if (tabId === activeTab) {
      return;
    }
    chrome.resetChrome();
    setActiveTab(tabId);
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) {
      touchStart.current.ignored = true;
      return;
    }
    const t = e.touches[0];
    const ignored = Boolean(e.target?.closest?.(SWIPE_IGNORE_SEL));
    touchStart.current = {
      x: t.clientX,
      y: t.clientY,
      ignored,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    const now = Date.now();
    if (
      touchStart.current.ignored ||
      cartOpen ||
      importOpen ||
      now - lastSwipeAt.current < SWIPE_COOLDOWN_MS
    ) {
      return;
    }
    const t = e.changedTouches[0];
    const next = resolveSwipeTarget(
      activeTab,
      t.clientX - touchStart.current.x,
      t.clientY - touchStart.current.y
    );
    if (next) {
      lastSwipeAt.current = now;
      switchTab(next);
    }
  };

  return {
    activeTab,
    showTop: chrome.showTop,
    chromeHidden: chrome.chromeHidden,
    switchTab,
    handleTouchStart,
    handleTouchEnd
  };
}

function useImportModal() {
  const [importOpen, setImportOpen] = useState(() => isPrivateImportHash());

  useEffect(() => {
    const onHash = () => setImportOpen(isPrivateImportHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const closePrivatePanel = () => {
    setImportOpen(false);
    if (isPrivateImportHash()) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const openPrivatePanel = () => setImportOpen(true);

  return { importOpen, openPrivatePanel, closePrivatePanel };
}

function BackToTopButton({ visible }) {
  if (!visible) {
    return null;
  }
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={TOP_BTN_CLS}
      aria-label="Remonter en haut"
    >
      <ArrowUpIcon className="w-3.5 h-3.5" />
    </button>
  );
}

function AppOverlays({
  store,
  cartOpen,
  importOpen,
  onCloseCart,
  onCloseImport,
  onCheckoutDone
}) {
  return (
    <>
      <CartDrawer
        isOpen={cartOpen}
        items={store.cart}
        onClose={onCloseCart}
        onRemove={store.removeFromCart}
        onCheckout={onCheckoutDone}
      />
      {importOpen && (
        <OneTimeImportPanel
          products={store.products}
          onSaveProducts={store.saveProducts}
          onClose={onCloseImport}
        />
      )}
    </>
  );
}

export default function App() {
  const store = useStoreState();
  const [studioItem, setStudioItem] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { importOpen, openPrivatePanel, closePrivatePanel } = useImportModal();
  const nav = useAppNavigation(cartOpen, importOpen);

  return (
    <div
      className="min-h-[100dvh] vintage-sand-bg flex flex-col"
      onTouchStart={nav.handleTouchStart}
      onTouchEnd={nav.handleTouchEnd}
    >
      <div className="viewport-relief-frame" aria-hidden="true" />
      <Header
        activeTab={nav.activeTab}
        onChangeTab={nav.switchTab}
        cartCount={store.cart.length}
        onOpenCart={() => setCartOpen(true)}
        hidden={nav.chromeHidden}
      />
      <main className={MAIN_CLS}>
        <div key={nav.activeTab} className="animate-tab-enter">
          <ActiveView
            activeTab={nav.activeTab}
            products={store.products}
            studioItem={studioItem}
            orders={store.orders}
            signatures={store.signatures}
            onAddToCart={(item) => {
              store.addToCart(item);
              setCartOpen(true);
            }}
            onOpenStudio={(item) => {
              setStudioItem(item);
              nav.switchTab('studio');
            }}
            onSelectItem={setStudioItem}
            onAddSignature={store.addSignature}
          />
        </div>
      </main>
      <SiteFooter onOpenImport={openPrivatePanel} />
      <BackToTopButton visible={nav.showTop && !nav.chromeHidden} />
      <AppOverlays
        store={store}
        cartOpen={cartOpen}
        importOpen={importOpen}
        onCloseCart={() => setCartOpen(false)}
        onCloseImport={closePrivatePanel}
        onCheckoutDone={(info) => {
          store.completeOrder(info);
          setCartOpen(false);
          nav.switchTab('suivi');
        }}
      />
    </div>
  );
}
