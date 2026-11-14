import { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_CATALOGUES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_MESSAGES
} from './data/catalog.js';
import {
  SECURITY_LIMITS,
  sanitizeInput,
  verifyAccessDigest,
  loadGuestCart,
  saveGuestCart
} from './security/sovereignCore.js';
import { Header } from './components/Header.jsx';
import {
  HeroSearchAndCatalogues,
  BoutiqueView,
  FichesView
} from './components/StoreViews.jsx';
import { StudioView, SuiviView } from './components/StudioAndSuivi.jsx';
import {
  UnlockedAdminBanner,
  AdminPanel,
  AdminAuthModal,
  MessagePopup,
  CartDrawer
} from './components/AdminAndCart.jsx';

function mergeItem(prev, product, variant) {
  const cartKey = `${product.id}-${variant.id}`;
  const found = prev.find((i) => i.cartKey === cartKey);
  if (found) {
    return prev.map((i) =>
      i.cartKey === cartKey
        ? { ...i, qty: Math.min(i.qty + 1, SECURITY_LIMITS.MAX_ITEM_QTY) }
        : i
    );
  }
  return [
    ...prev,
    { cartKey, id: product.id, name: product.name, price: product.price, qty: 1 }
  ];
}

function useStoreData() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(loadGuestCart(null));
  }, []);

  useEffect(() => {
    saveGuestCart(cart, null);
  }, [cart]);

  const addMessage = (body) => {
    const entry = {
      id: `MSG-${Date.now()}`,
      sender: 'Visiteur',
      subject: 'Demande',
      body,
      reply: ''
    };
    setMessages((prev) => [entry, ...prev]);
  };

  const replyMessage = (id, reply) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, reply } : m))
    );
  };

  return {
    products,
    setProducts,
    orders,
    setOrders,
    messages,
    addMessage,
    replyMessage,
    cart,
    setCart
  };
}

function useAdminGate(setActiveTab) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSealClick = () => {
    if (clicks + 1 >= SECURITY_LIMITS.ADMIN_UNLOCK_CLICKS) {
      setIsModalOpen(true);
      setClicks(0);
      return;
    }
    setClicks(clicks + 1);
  };

  const handleVerify = (event) => {
    event.preventDefault();
    if (verifyAccessDigest(code)) {
      setIsUnlocked(true);
      setIsModalOpen(false);
      setActiveTab('admin');
    }
    setCode('');
  };

  return {
    isUnlocked,
    setIsUnlocked,
    isModalOpen,
    setIsModalOpen,
    code,
    setCode,
    handleSealClick,
    handleVerify
  };
}

function TabContent({ state }) {
  const { activeTab, filtered, focusedId, onOpenFiche, onAdd } = state;
  const { orders, adminProps, isAdminUnlocked } = state;

  if (activeTab === 'fiches') {
    return (
      <FichesView products={filtered} focusedId={focusedId} onAdd={onAdd} />
    );
  }
  if (activeTab === 'studio') {
    return <StudioView products={filtered} onAdd={onAdd} />;
  }
  if (activeTab === 'suivi') {
    return <SuiviView orders={orders} />;
  }
  if (activeTab === 'admin' && isAdminUnlocked) {
    return <AdminPanel adminProps={adminProps} />;
  }
  return (
    <BoutiqueView products={filtered} onOpenFiche={onOpenFiche} onAdd={onAdd} />
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState('boutique');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedId, setFocusedId] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [clickHalo, setClickHalo] = useState(null);

  const store = useStoreData();
  const gate = useAdminGate(setActiveTab);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return store.products.filter((p) => {
      const catOk = selectedCategory === 'Tous' || p.category === selectedCategory;
      const qOk =
        !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [store.products, selectedCategory, searchQuery]);

  const total = store.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = store.cart.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = () => {
    const rand = Math.floor(
      SECURITY_LIMITS.ORDER_ID_MIN + Math.random() * SECURITY_LIMITS.ORDER_ID_RANGE
    );
    const order = {
      id: `TR-2026-${rand}`,
      date: new Date().toISOString().split('T')[0],
      customerMasked: 'Client Invité',
      amount: total,
      paymentMethod: 'USD',
      step: 1,
      priority: 'crucial'
    };
    store.setOrders([order, ...store.orders]);
    store.setCart([]);
    setIsCartOpen(false);
    setActiveTab('suivi');
  };

  const triggerHalo = (e) => {
    setClickHalo({ id: Date.now(), x: e.clientX, y: e.clientY });
  };

  return (
    <div
      onClickCapture={triggerHalo}
      className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#160E09]"
    >
      {clickHalo && (
        <span
          key={clickHalo.id}
          onAnimationEnd={() => setClickHalo(null)}
          style={{ left: `${clickHalo.x}px`, top: `${clickHalo.y}px` }}
          className="click-halo-burst"
        />
      )}

      <Header
        navState={{
          activeTab,
          onChangeTab: setActiveTab,
          isAdminUnlocked: gate.isUnlocked,
          cartCount: count,
          onOpenCart: () => setIsCartOpen(true),
          onOpenMessages: () => setIsMsgOpen(true)
        }}
      />

      {gate.isUnlocked && activeTab !== 'admin' && (
        <UnlockedAdminBanner
          onOpenAdmin={() => setActiveTab('admin')}
          onLock={() => gate.setIsUnlocked(false)}
        />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pb-12">
        {activeTab !== 'admin' && (
          <HeroSearchAndCatalogues
            heroState={{
              searchQuery,
              onSearch: (v) => setSearchQuery(sanitizeInput(v)),
              catalogues: INITIAL_CATALOGUES,
              products: store.products,
              selectedCategory,
              onSelectCategory: setSelectedCategory
            }}
          />
        )}
        <TabContent
          state={{
            activeTab,
            filtered,
            focusedId,
            onOpenFiche: (id) => {
              setFocusedId(id);
              setActiveTab('fiches');
            },
            onAdd: (p, v) => {
              store.setCart((prev) => mergeItem(prev, p, v));
              setIsCartOpen(true);
            },
            orders: store.orders,
            isAdminUnlocked: gate.isUnlocked,
            adminProps: {
              products: store.products,
              catalogues: INITIAL_CATALOGUES,
              messages: store.messages,
              onAddProduct: (item) => store.setProducts([item, ...store.products]),
              onClearVectorCatalog: () => store.setProducts([]),
              onReplyMessage: store.replyMessage,
              onLock: () => {
                gate.setIsUnlocked(false);
                setActiveTab('boutique');
              }
            }
          }}
        />
      </main>

      <footer className="border-t py-6 px-4 text-center text-xs text-[#4A2E21]/70">
        <span>© 2026 Ta référence.com </span>
        <button type="button" onClick={gate.handleSealClick} className="px-1">
          ◆
        </button>
      </footer>

      <AdminAuthModal
        modalState={{
          isOpen: gate.isModalOpen,
          code: gate.code,
          onChangeCode: gate.setCode,
          onSubmit: gate.handleVerify,
          onClose: () => gate.setIsModalOpen(false)
        }}
      />
      <MessagePopup
        popupState={{
          isOpen: isMsgOpen,
          messages: store.messages,
          onSend: store.addMessage,
          onClose: () => setIsMsgOpen(false)
        }}
      />
      <CartDrawer
        cartState={{
          isOpen: isCartOpen,
          items: store.cart,
          total,
          onClose: () => setIsCartOpen(false),
          onUpdateQty: (key, d) =>
            store.setCart((prev) =>
              prev
                .map((i) => (i.cartKey === key ? { ...i, qty: i.qty + d } : i))
                .filter((i) => i.qty > 0)
            ),
          onCheckout: handleCheckout
        }}
      />
    </div>
  );
}
