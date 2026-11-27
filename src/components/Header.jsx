import { useEffect, useState } from 'react';
import { BRAND_SLOGAN, COCKPIT_URL, NAV_TABS } from '../data/storeCatalog.js';
import { ArrowOutIcon, BagIcon } from './Icons.jsx';

/* Tracé sculptural Tribal × Gothique fidèle à l'inspiration :
 * - Aile gauche acérée avec ergot dorsal + arc concave en pointe vers le bas
 * - Pic central gothique net au sommet du fût
 * - Aile droite étirée au-dessus de "a référence" avec ergots tribaux fins
 *   s'achevant en pointe de lame exactement à l'aplomb du point .com (x = 166.5)
 * - Fût sinueux en dague gothique-tribale à épines alternées effilé jusqu'en bas
 */
const GOTHIC_TRIBAL_T_PATH =
  'M 1.5 10.6 ' +
  'C 6 8.2, 11.8 7.5, 16.4 5.2 ' +
  'C 15.1 6.7, 14.3 7.5, 14.8 8.2 ' +
  'C 18.2 8.2, 21.8 6.8, 24.8 4.4 ' +
  'C 27.6 6.8, 30.8 8.2, 34.4 8.2 ' +
  'C 33.8 7.3, 33 6.5, 31.8 5.4 ' +
  'C 52 7.2, 108 7.4, 150 9.4 ' +
  'L 166.5 10.8 ' +
  'C 153 12.2, 134 12.6, 118 12.4 ' +
  'C 122 13.3, 124.2 14, 125.6 15 ' +
  'C 118 13.8, 110 12.8, 96 12.2 ' +
  'C 72 11.4, 48 11.8, 36.2 15.2 ' +
  'C 37.2 13.4, 36.8 11.9, 34.4 11.3 ' +
  'C 31.4 10.6, 28.4 11.6, 27.9 13.6 ' +
  'C 28.6 14.2, 29.5 14.5, 30.2 14.6 ' +
  'C 28.6 17.6, 28.6 22.8, 29.8 27.4 ' +
  'C 30.3 29.6, 30.4 31.8, 29.8 32.8 ' +
  'C 29 32.4, 28.4 31.2, 27.9 30.2 ' +
  'C 27.7 32.8, 28 35.4, 28.5 37.2 ' +
  'C 29.1 36.2, 29.5 35.2, 29.9 34.2 ' +
  'C 30.2 38.6, 28 43.2, 26.5 47.4 ' +
  'C 25.4 50.4, 25 53.2, 24.8 55 ' +
  'C 23.6 52, 22.8 47.8, 22.2 44.2 ' +
  'C 21.6 41.2, 20.6 39.2, 19.6 38.2 ' +
  'C 22.2 35.6, 23.6 32.2, 23 28.4 ' +
  'C 22.5 25.6, 21.4 23.8, 20.6 21.6 ' +
  'C 21.6 22.4, 22.4 23.6, 23.2 24.8 ' +
  'C 23.5 21.2, 22.8 17.6, 20.8 14.4 ' +
  'C 21.6 14.2, 22.4 13.9, 23 13.3 ' +
  'C 22.4 11.5, 19.4 10.6, 16.4 11.6 ' +
  'C 14.4 12.2, 13.4 13.6, 14 15.2 ' +
  'C 10.2 12.2, 5.8 11.2, 1.5 10.6 Z';

function BrandLogo() {
  return (
    <div className="flex flex-col group min-w-0">
      <svg
        viewBox="0 0 212 58"
        preserveAspectRatio="xMinYMid meet"
        className="self-start h-8 sm:h-10 lg:h-11 w-auto select-none overflow-visible"
        aria-label="Ta référence.com"
      >
        <defs>
          <linearGradient id="trfTribalSheen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1C1914" />
            <stop offset="46%" stopColor="#1C1914" />
            <stop offset="52%" stopColor="#5C4D33" />
            <stop offset="56%" stopColor="#1C1914" />
            <stop offset="100%" stopColor="#1C1914" />
          </linearGradient>
        </defs>

        {/* Grand T Tribal × Gothique (dague sinueuse & aile étirée jusqu'au point .com) */}
        <path
          d={GOTHIC_TRIBAL_T_PATH}
          fill="url(#trfTribalSheen)"
          className="transition-transform duration-500 ease-out origin-left group-hover:scale-[1.015]"
        />

        {/* Typographie signature Tanker + Satoshi */}
        <text
          x="36"
          y="42"
          fill="#1C1914"
          fontFamily="Tanker, Georgia, serif"
          fontSize="26"
          letterSpacing="0.8"
        >
          a référence
        </text>

        {/* Point Limewood aligné exactement à l'aplomb de la pointe du T (x = 166.5) */}
        <circle
          cx="166.5"
          cy="39"
          r="5.5"
          fill="#C2B088"
          className="animate-dot-halo"
        />
        <circle cx="166.5" cy="39" r="2.7" fill="#C2B088" />
        <circle cx="165.8" cy="38.2" r="0.85" fill="#FAF7F0" opacity="0.92" />

        <text
          x="172.5"
          y="42"
          fill="#4E4634"
          fontFamily="Satoshi, sans-serif"
          fontSize="14"
          fontWeight="700"
        >
          com
        </text>
      </svg>
      <span className="text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.2em] uppercase text-[#665E4E] pl-0.5 flex items-center gap-1.5 truncate">
        <span>{BRAND_SLOGAN}</span>
        <span className="text-[#C2B088] text-[9px] animate-sparkle shrink-0">
          ✦
        </span>
      </span>
    </div>
  );
}

export function Header({ activeTab, onChangeTab, cartCount, onOpenCart }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 pt-[env(safe-area-inset-top)] border-b border-[#4E4634]/15 bg-[#F4EFE4]/92 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? 'shadow-md shadow-[#1C1914]/8' : ''
      }`}
    >
      {/* Barre de progression joaillière au scroll */}
      <div className="h-[2px] w-full bg-[#4E4634]/10 overflow-hidden">
        <div
          className="h-full scroll-progress-gold transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onChangeTab('boutique')}
          className="text-left focus:outline-none min-w-0 shrink"
        >
          <BrandLogo />
        </button>

        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-1.5 shrink-0"
        >
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'btn-limewood'
                  : 'text-[#1C1914]/80 hover:bg-[#EAE2D2]/85 hover:text-[#1C1914]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href={COCKPIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-medium btn-vintage-ghost"
          >
            <span>Cockpit</span>
            <ArrowOutIcon className="w-3.5 h-3.5 text-[#4E4634]" />
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 min-h-[38px] rounded-full text-xs font-medium btn-limewood"
            aria-label="Ouvrir le panier"
          >
            <BagIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Panier</span>
            {cartCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#C2B088] text-[#1C1914] text-[10px] font-bold animate-sparkle">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav
        aria-label="Navigation mobile"
        className="md:hidden border-t border-[#4E4634]/10 px-2.5 py-1.5 grid grid-cols-4 gap-1"
      >
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`px-1.5 py-2 rounded-full text-[11px] font-medium text-center truncate transition-all ${
              activeTab === tab.id ? 'btn-limewood' : 'text-[#4E4634]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
