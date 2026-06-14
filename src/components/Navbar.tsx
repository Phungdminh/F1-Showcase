// Navbar — DESIGN.md §1 exactly: logo + 4 desktop links (gap-12), rounded
// search w-72 with lucide Search inside, mobile Menu button in a 40px circle
// toggling a dropdown (vertical links + full-width search).
//
// `variant` recolors the chrome for the surface underneath. `light` (default)
// is the hero on #FBFDFD; `dark` is the inner pages on #0F0F0F (DESIGN.md §4).
// Layout, links, and structure are identical across variants — only the
// neutral palette flips, so the change is additive and backward-compatible.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useReducedMotionSafe } from '../lib/motion';

const NAV_LINKS = [
  { to: '/teams', label: 'Đội đua' },
  { to: '/calendar', label: 'Lịch thi đấu' },
  { to: '/news', label: 'Tin tức' },
  { to: '/standings', label: 'Bảng xếp hạng' },
] as const;

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500';

type NavbarVariant = 'light' | 'dark';

const THEME: Record<
  NavbarVariant,
  {
    active: string;
    idle: string;
    hover: string;
    searchBorder: string;
    searchText: string;
    menuBorder: string;
    menuText: string;
    dropdownBg: string;
    dropdownBorder: string;
  }
> = {
  light: {
    active: 'text-f1',
    idle: 'text-neutral-500',
    hover: 'hover:text-f1',
    searchBorder: 'border-neutral-300',
    searchText: 'text-neutral-600 placeholder:text-neutral-400',
    menuBorder: 'border-neutral-300',
    menuText: 'text-neutral-700',
    dropdownBg: 'bg-[#FBFDFD]',
    dropdownBorder: 'border-neutral-200',
  },
  dark: {
    active: 'text-f1',
    idle: 'text-neutral-200',
    hover: 'hover:text-f1',
    searchBorder: 'border-neutral-700',
    searchText: 'text-neutral-300 placeholder:text-neutral-500',
    menuBorder: 'border-neutral-700',
    menuText: 'text-neutral-300',
    dropdownBg: 'bg-[#0F0F0F]',
    dropdownBorder: 'border-neutral-800',
  },
};

function makeNavLinkClass(theme: (typeof THEME)[NavbarVariant]) {
  return ({ isActive }: { isActive: boolean }) =>
    `text-base font-medium transition-colors ${isActive ? theme.active : theme.idle} ${theme.hover} ${FOCUS}`;
}

function SearchField({
  className = '',
  inputId,
  theme,
}: {
  className?: string;
  inputId: string;
  theme: (typeof THEME)[NavbarVariant];
}) {
  return (
    <div className={`relative ${className}`.trim()}>
      <label htmlFor={inputId} className="sr-only">
        Tìm đội, tay đua
      </label>
      <input
        id={inputId}
        type="text"
        placeholder="Tìm đội, tay đua..."
        className={`w-full rounded-full border bg-transparent px-5 py-2.5 pr-11 text-sm focus:border-f1 focus:outline-none ${theme.searchBorder} ${theme.searchText}`}
      />
      <Search
        aria-hidden="true"
        className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}

/** Scroll distance (px) after which the landing navbar gains its solid chrome. */
const SOLIDIFY_AT = 24;

export interface NavbarProps {
  /** Surface underneath — `light` hero (default) or `dark` inner pages. */
  variant?: NavbarVariant;
  /**
   * Landing-only: the bar is transparent over the hero and gains a subtle
   * translucent bg + bottom border once the page is scrolled past the hero top
   * (MOTION §3 nav solidify). Inner pages leave this off — they're already on a
   * solid surface. Additive + backward-compatible (defaults to off).
   */
  solidifyOnScroll?: boolean;
}

export default function Navbar({ variant = 'light', solidifyOnScroll = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const theme = THEME[variant];
  const navLinkClass = makeNavLinkClass(theme);

  // Nav solidify-on-scroll (landing). rAF-throttled scroll listener so we touch
  // style at most once per frame. Reduced motion still toggles the chrome — it
  // just skips the CSS transition (handled by the conditional `transition-colors`).
  const reduced = useReducedMotionSafe();
  const [solid, setSolid] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    if (!solidifyOnScroll) return;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        setSolid(window.scrollY > SOLIDIFY_AT);
        ticking.current = false;
      });
    };
    onScroll(); // sync initial state (e.g. restored scroll position)
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [solidifyOnScroll]);

  // Positioning stays `relative z-10` for ALL variants — the hero wrapper is
  // `overflow-hidden`, which makes `position: sticky` clip to the wrapper and risks
  // layout surprises, so we keep the original flow and only toggle the chrome color
  // on scroll (the visible MOTION §3 requirement). No layout change for any page.
  const positionClass = 'relative z-10';
  const solidifyClass = solidifyOnScroll
    ? `border-b ${reduced ? '' : 'transition-colors duration-300'} ${
        solid
          ? variant === 'dark'
            ? 'bg-[#0F0F0F]/80 border-neutral-800 backdrop-blur'
            : 'bg-[#FBFDFD]/80 border-neutral-200 backdrop-blur'
          : 'bg-transparent border-transparent'
      }`
    : '';

  return (
    <header
      className={`${positionClass} flex items-center justify-between px-5 py-4 md:px-12 md:py-6 ${solidifyClass}`.trim()}
    >
      <div className="flex items-center gap-12">
        <Link to="/" className={FOCUS} aria-label="F1 Showcase 2026 — về trang chủ">
          <img
            src="/image.png"
            alt="F1 Showcase 2026"
            width={128}
            height={32}
            className="h-7 w-auto md:h-8"
          />
        </Link>
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-12 md:flex">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop search */}
      <SearchField className="hidden w-72 md:block" inputId="navbar-search" theme={theme} />

      {/* Mobile menu button — 40px circle */}
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-controls="navbar-mobile-menu"
        aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
        className={`flex h-10 w-10 items-center justify-center rounded-full border ${theme.menuBorder} ${theme.menuText} md:hidden ${FOCUS}`}
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>

      {/* Mobile dropdown: vertical links + full-width search */}
      {menuOpen && (
        <div
          id="navbar-mobile-menu"
          className={`absolute left-0 right-0 top-full z-20 border-b px-5 pb-6 pt-2 md:hidden ${theme.dropdownBorder} ${theme.dropdownBg}`}
        >
          <nav aria-label="Điều hướng di động" className="flex flex-col gap-4 py-4">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass} onClick={closeMenu}>
                {label}
              </NavLink>
            ))}
          </nav>
          <SearchField className="w-full" inputId="navbar-search-mobile" theme={theme} />
        </div>
      )}
    </header>
  );
}
