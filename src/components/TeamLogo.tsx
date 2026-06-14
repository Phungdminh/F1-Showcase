// TeamLogo — per-team mark for lists/headers. Two tiers:
//   1) Real logo drop-in: put a file at public/logos/{teamId}.svg (or .png) and
//      register its path in TEAM_LOGO_SRC below → it renders as an <img>.
//   2) Fallback (default): a clean monogram badge — the team's 3-letter F1
//      constructor code on its primary color, with auto-contrasting text.
// Team hex comes from the Team record (data), never hardcoded here.
import type { CSSProperties } from 'react';
import type { Team } from '../types';

// Standard F1 3-letter constructor codes (fans recognise these).
const TEAM_CODE: Record<string, string> = {
  mclaren: 'MCL',
  ferrari: 'FER',
  'red-bull': 'RBR',
  mercedes: 'MER',
  'aston-martin': 'AMR',
  alpine: 'ALP',
  williams: 'WIL',
  'racing-bulls': 'RB',
  audi: 'AUD',
  haas: 'HAA',
  cadillac: 'CAD',
};

// Optional real-logo drop-in (disabled by default — we ship the monogram badges).
// To use a real logo: drop an official file at public/logos/{teamId}.svg and map
// it here, e.g. mclaren: '/logos/mclaren.svg'. Logos are trademarks of their
// owners; only add files you have the right to use.
const TEAM_LOGO_SRC: Record<string, string> = {};

/** WCAG relative luminance → pick black or white text for legibility on `hex`. */
function readableText(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#ffffff';
  const toLin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = toLin(parseInt(h.slice(0, 2), 16));
  const g = toLin(parseInt(h.slice(2, 4), 16));
  const b = toLin(parseInt(h.slice(4, 6), 16));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? '#0a0a0a' : '#ffffff';
}

export interface TeamLogoProps {
  team: Team;
  /** px — the square badge size. */
  size?: number;
  className?: string;
}

export default function TeamLogo({ team, size = 44, className = '' }: TeamLogoProps) {
  const src = TEAM_LOGO_SRC[team.id];

  if (src) {
    // Real logos vary in color; a light chip keeps any mark legible on the dark
    // UI. The logo is padded inside the chip via object-contain.
    return (
      <span
        role="img"
        aria-label={`Logo ${team.name}`}
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-inset ring-black/10 ${className}`}
        style={{ width: size, height: size, borderRadius: size * 0.26 }}
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          className="object-contain"
          style={{ width: size * 0.74, height: size * 0.74 }}
        />
      </span>
    );
  }

  const code = TEAM_CODE[team.id] ?? team.name.slice(0, 3).toUpperCase();
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: team.primaryColor,
    color: readableText(team.primaryColor),
    fontSize: size * 0.3,
    // Squircle-ish badge with a faint top light + edge ring for definition on dark.
    borderRadius: size * 0.26,
    backgroundImage:
      'linear-gradient(160deg, rgba(255,255,255,0.18), rgba(0,0,0,0.12))',
  };

  return (
    <span
      role="img"
      aria-label={`Logo ${team.name}`}
      className={`inline-flex shrink-0 items-center justify-center font-bold tracking-tight ring-1 ring-inset ring-white/10 ${className}`}
      style={style}
    >
      {code}
    </span>
  );
}
