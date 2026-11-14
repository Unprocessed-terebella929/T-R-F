import { NAV_TABS } from '../data/catalog.js';

const T_PATHS = {
  scytheOuter: 'M 42 15 C 14 17, 5 36, 17 55 C 11 41, 18 25, 40 22 Z',
  undertuck: 'M 19 31 C 27 23, 39 22, 62 24 C 46 27, 30 27, 19 31 Z',
  harpoonWing:
    'M 10 16 C 24 9, 36 8, 43 12 L 46 3 L 49 12 L 196 12 ' +
    'L 188 8 L 222 14 L 194 20 L 201 16 L 52 16 L 42 20 Z',
  jaggedStem:
    'M 41 14 L 51 14 L 51 24 L 55 29 L 50 28 L 52 38 L 49 44 ' +
    'L 50 51 L 46 60 L 42 51 L 40 43 L 44 39 L 41 31 L 44 26 Z',
  gothicBase:
    'M 30 51 C 36 55, 42 55, 46 60 C 50 55, 56 55, 62 51 ' +
    'L 55 48 L 46 53 L 37 48 Z',
  thornyVine: 'M 40 22 C 51 28, 39 36, 51 43 C 42 48, 46 53, 46 56',
  crossTop: 'M 46 4 L 48 12 L 54 14 L 48 16 L 46 23 L 44 16 L 38 14 L 44 12 Z'
};

function getNavBtnClass(isActive) {
  if (isActive) {
    return 'bg-cream-highlight font-semibold shadow-sm';
  }
  return 'text-[#2B1D16]/80 hover:bg-[#EFE6D8]';
}

function SovereignTSvgDefs() {
  return (
    <defs>
      <linearGradient id="obsidianGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2B1B12" />
        <stop offset="55%" stopColor="#120B07" />
        <stop offset="100%" stopColor="#050302" />
      </linearGradient>
      <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F3E5D0" />
        <stop offset="50%" stopColor="#C8A97E" />
        <stop offset="100%" stopColor="#6E4B3A" />
      </linearGradient>
    </defs>
  );
}

function SovereignTSymbol() {
  return (
    <g>
      <path d={T_PATHS.scytheOuter} fill="url(#bronzeGrad)" stroke="#120B07" />
      <path d={T_PATHS.undertuck} fill="#8C6239" />
      <path d={T_PATHS.harpoonWing} fill="url(#obsidianGrad)" stroke="#C8A97E" />
      <path d={T_PATHS.jaggedStem} fill="url(#obsidianGrad)" stroke="#DECAB1" />
      <path d={T_PATHS.gothicBase} fill="url(#bronzeGrad)" stroke="#120B07" />
      <path d={T_PATHS.crossTop} fill="url(#bronzeGrad)" />
      <path d={T_PATHS.thornyVine} fill="none" stroke="#DFC39D" strokeWidth="1.5" />
    </g>
  );
}

function SovereignTLogo({ onSelectHome }) {
  return (
    <button
      type="button"
      onClick={onSelectHome}
      className="text-left focus:outline-none click-tactile"
      aria-label="Ta référence.com"
    >
      <svg viewBox="0 0 295 64" className="h-12 sm:h-14 w-auto">
        <SovereignTSvgDefs />
        <SovereignTSymbol />
        <text
          x="55"
          y="46"
          fill="#160E09"
          fontFamily="Georgia, serif"
          fontSize="28"
          fontWeight="700"
          letterSpacing="-0.7"
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
          Atelier
        </button>
      )}
    </nav>
  );
}

function MobileNavBar({ activeTab, onChangeTab, isAdminUnlocked }) {
  const tabs = isAdminUnlocked
    ? [...NAV_TABS, { id: 'admin', label: 'Atelier' }]
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
  const rowWrap =
    'max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between';
  const msgBtn =
    'click-tactile px-3.5 py-2 rounded-xl bg-latte-soft text-xs font-semibold';
  const cartBtn =
    'click-tactile px-3.5 py-2 rounded-xl bg-cream-highlight text-xs flex gap-2';

  return (
    <header className="sticky top-0 z-30 bg-[#FAF6F0]/95 backdrop-blur-md border-b">
      <div className={rowWrap}>
        <SovereignTLogo onSelectHome={() => onChangeTab('boutique')} />
        <DesktopNavBar
          activeTab={activeTab}
          onChangeTab={onChangeTab}
          isAdminUnlocked={isAdminUnlocked}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenMessages} className={msgBtn}>
            Messages
          </button>
          <button type="button" onClick={onOpenCart} className={cartBtn}>
            <span className="font-semibold">Panier</span>
            <span className="px-2 py-0.5 rounded-full bg-white/85 font-bold">
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
