import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { BRAND_SLOGAN, COCKPIT_URL } from '../data/storeCatalog.js';

const NAV_TABS = [
  { id: 'boutique', label: 'Boutique' },
  { id: 'studio', label: 'Studio' },
  { id: 'suivi', label: 'Suivi' },
  { id: 'signatures', label: 'Signatures' }
];

function BrandLogo() {
  return (
    <div className="flex flex-col">
      <div className="relative inline-flex items-end select-none">
        <svg
          viewBox="0 0 212 52"
          className="h-9 sm:h-10 w-auto"
          aria-label="Ta référence.com"
        >
          <path
            d="M4 11 C36 6, 98 6, 166 10 L170 13 L152 14 C108 12, 62 12, 34 15 L30 22 L28 49 L21 44 L23 20 L14 16 Z"
            fill="#1C1914"
          />
          <text
            x="35"
            y="40"
            fill="#1C1914"
            fontFamily="Tanker, Georgia, serif"
            fontSize="26"
            letterSpacing="0.8"
          >
            a référence
          </text>
          <circle cx="168" cy="37" r="2.6" fill="#C2B088" />
          <text
            x="173"
            y="40"
            fill="#4E4634"
            fontFamily="Satoshi, sans-serif"
            fontSize="14"
            fontWeight="700"
          >
            com
          </text>
        </svg>
      </div>
      <span className="text-[11px] tracking-[0.18em] uppercase text-[#665E4E] pl-1">
        {BRAND_SLOGAN}
      </span>
    </div>
  );
}

export function Header({ activeTab, onChangeTab, cartCount, onOpenCart }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#4E4634]/15 bg-[#F4EFE4]/92 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChangeTab('boutique')}
          className="text-left focus:outline-none"
        >
          <BrandLogo />
        </button>

        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  active
                    ? 'btn-limewood'
                    : 'text-[#1C1914]/80 hover:bg-[#EAE2D2]/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={COCKPIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium btn-vintage-ghost"
          >
            <span>Cockpit</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#4E4634]" />
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium btn-limewood"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Panier</span>
            {cartCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#C2B088] text-[#1C1914] text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="md:hidden border-t border-[#4E4634]/10 px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto">
        {NAV_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                active ? 'btn-limewood' : 'text-[#4E4634]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
