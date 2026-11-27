import { useEffect, useState } from 'react';
import { BRAND_SLOGAN, COCKPIT_URL, NAV_TABS } from '../data/storeCatalog.js';
import { ArrowOutIcon, BagIcon } from './Icons.jsx';

/* Tracé sculptural Tribal × Gothique :
 * - Crête ogivale gothique + aile tribale acérée à gauche
 * - Lame supérieure tribale ciselée s'étirant au-dessus de "a référence"
 *   et s'arrêtant exactement à l'aplomb du point rond Limewood (cx = 166.5)
 * - Fût gothique gravé + pointe bifide en serre tribale à la base
 */
const GOTHIC_TRIBAL_T_MAIN =
  'M 2 15.5 ' +
  'C 6 7.5, 13 4.2, 20.5 6.4 ' +
  'L 25.5 2 L 29.8 7 ' +
  'C 58 4.4, 112 5.4, 152 9.4 ' +
  'L 166.5 12.2 ' +
  'L 152.5 15.4 ' +
  'L 156.5 12.6 ' +
  'C 118 10.6, 68 11.2, 36.2 14.8 ' +
  'L 39.2 18.8 L 32 19.2 ' +
  'C 29.4 25.8, 29 36.2, 30.8 44.6 ' +
  'L 35.4 47.4 L 27.2 46.8 ' +
  'L 24 52.6 L 21.8 46.6 ' +
  'C 16.5 47.8, 12 50.6, 8 52.8 ' +
  'C 12.6 46.2, 17 40.6, 18.8 34 ' +
  'C 20.4 27.8, 20.6 22, 19.6 18.4 ' +
  'L 12.6 19.2 L 16.2 14.2 ' +
  'C 11.4 13.4, 6.6 14.2, 2 15.5 Z';

/* Aile gothique-tribale effilée épousant le flanc gauche du fût */
const GOTHIC_TRIBAL_FLOURISH =
  'M 15.6 22.2 C 11.2 25.4, 9.2 30.2, 10.4 36.4 C 11.6 31.6, 14.2 28.4, 16.6 26.8 Z';

/* Losange ogival gothique incrusté au cœur du fût (or-tilleul) */
const GOTHIC_STEM_INLAY = 'M 25.1 20.4 L 27.3 29.4 L 24.7 38.8 L 22.6 29.4 Z';

/* Nervure tribale dorée longeant la lame supérieure jusqu'à la pointe */
const TRIBAL_BLADE_VEIN = 'M 38 10.4 C 76 8.2, 120 8.6, 159.5 12';

function BrandLogo() {
  return (
    <div className="flex flex-col group">
      <svg
        viewBox="0 0 212 56"
        className="h-10 sm:h-11 w-auto select-none overflow-visible"
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
          <linearGradient id="trfGoldVein" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C2B088" stopOpacity="0.25" />
            <stop offset="55%" stopColor="#E4D2A6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#C2B088" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Grand T Tribal × Gothique */}
        <path
          d={GOTHIC_TRIBAL_T_MAIN}
          fill="url(#trfTribalSheen)"
          className="transition-transform duration-500 ease-out origin-left group-hover:scale-[1.015]"
        />
        <path d={GOTHIC_TRIBAL_FLOURISH} fill="#1C1914" opacity="0.9" />
        <path d={GOTHIC_STEM_INLAY} fill="#C2B088" />
        <path
          d={TRIBAL_BLADE_VEIN}
          fill="none"
          stroke="url(#trfGoldVein)"
          strokeWidth="0.95"
          strokeLinecap="round"
        />

        {/* Typographie signature Tanker + Satoshi */}
        <text
          x="38"
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
      <span className="text-[10px] tracking-[0.2em] uppercase text-[#665E4E] pl-1 flex items-center gap-1.5">
        <span>{BRAND_SLOGAN}</span>
        <span className="text-[#C2B088] text-[9px] animate-sparkle">✦</span>
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
      className={`sticky top-0 z-30 border-b border-[#4E4634]/15 bg-[#F4EFE4]/92 backdrop-blur-md transition-shadow duration-300 ${
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChangeTab('boutique')}
          className="text-left focus:outline-none"
        >
          <BrandLogo />
        </button>

        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'btn-limewood'
                  : 'text-[#1C1914]/80 hover:bg-[#EAE2D2]/85 hover:text-[#1C1914]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={COCKPIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium btn-vintage-ghost"
          >
            <span>Cockpit</span>
            <ArrowOutIcon className="w-3.5 h-3.5 text-[#4E4634]" />
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium btn-limewood"
            aria-label="Ouvrir le panier"
          >
            <BagIcon className="w-3.5 h-3.5" />
            <span>Panier</span>
            {cartCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#C2B088] text-[#1C1914] text-[10px] font-bold animate-sparkle">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="md:hidden border-t border-[#4E4634]/10 px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'btn-limewood' : 'text-[#4E4634]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
