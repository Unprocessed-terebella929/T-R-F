import { NAV_TABS } from '../data/catalog.js';

function getNavBtnClass(isActive) {
  if (isActive) {
    return 'bg-cream-highlight font-semibold shadow-sm';
  }
  return 'text-[#2B1D16]/80 hover:bg-[#EFE6D8]';
}

function SovereignTLogo({ onSelectHome }) {
  const harpoonWing = 'M6 9 L246 9 L258 13 L244 16 L38 16 L24 22 L6 9 Z';
  const leftScythe = 'M25 14 C10 22, 10 42, 22 49 C15 39, 17 25, 29 19 Z';
  const stemBlade = 'M26 11 L35 11 L35 45 L30 53 L26 45 Z';

  return (
    <button
      type="button"
      onClick={onSelectHome}
      className="text-left focus:outline-none click-tactile"
      aria-label="Ta référence.com"
    >
      <svg viewBox="0 0 285 56" className="h-11 sm:h-12 w-auto">
        <path d={harpoonWing} fill="#160E09" />
        <path d={leftScythe} fill="#4A2E21" />
        <path d={stemBlade} fill="#160E09" />
        <path d="M21 25 L30 20 L40 25 L30 23 Z" fill="#C8A97E" />
        <text
          x="41"
          y="42"
          fill="#160E09"
          fontFamily="Georgia, serif"
          fontSize="24"
          fontWeight="600"
          letterSpacing="-0.5"
        >
          a référence.com
        </text>
      </svg>
    </button>
  );
}

function DesktopNavBar({ activeTab, onChangeTab, isAdminUnlocked }) {
  const btnBase = 'px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider';
  return (
    <nav className="hidden md:flex items-center gap-1.5">
      {NAV_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChangeTab(tab.id)}
          className={`click-tactile ${btnBase} ${getNavBtnClass(
            activeTab === tab.id
          )}`}
        >
          {tab.label}
        </button>
      ))}
      {isAdminUnlocked && (
        <button
          type="button"
          onClick={() => onChangeTab('admin')}
          className={`click-tactile ${btnBase} ${getNavBtnClass(
            activeTab === 'admin'
          )}`}
        >
          Admin
        </button>
      )}
    </nav>
  );
}

function MobileNavBar({ activeTab, onChangeTab, isAdminUnlocked }) {
  const tabs = isAdminUnlocked
    ? [...NAV_TABS, { id: 'admin', label: 'Admin' }]
    : NAV_TABS;
  const barCls =
    'grid md:hidden grid-flow-col auto-cols-fr gap-1 px-3 py-2 border-t';

  return (
    <div className={barCls}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChangeTab(tab.id)}
          className={`py-1.5 rounded-lg text-[11px] uppercase ${getNavBtnClass(
            activeTab === tab.id
          )}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Header({ navState }) {
  const { activeTab, onChangeTab, isAdminUnlocked, cartCount } = navState;
  const { onOpenCart, onOpenMessages } = navState;
  const headerWrap =
    'sticky top-0 z-30 bg-[#FAF6F0]/95 backdrop-blur-md border-b';
  const rowWrap =
    'max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between';
  const msgBtn =
    'click-tactile px-3 py-2 rounded-xl bg-[#EFE6D8] text-xs font-medium';
  const cartBtn =
    'click-tactile px-3.5 py-2 rounded-xl bg-cream-highlight text-xs flex gap-2';

  return (
    <header className={headerWrap}>
      <div className={rowWrap}>
        <SovereignTLogo onSelectHome={() => onChangeTab('boutique')} />
        <DesktopNavBar
          activeTab={activeTab}
          onChangeTab={onChangeTab}
          isAdminUnlocked={isAdminUnlocked}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenMessages} className={msgBtn}>
            Message
          </button>
          <button type="button" onClick={onOpenCart} className={cartBtn}>
            <span className="font-semibold">Panier</span>
            <span className="px-2 py-0.5 rounded-full bg-white/80 font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
      <MobileNavBar
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        isAdminUnlocked={isAdminUnlocked}
      />
    </header>
  );
}
