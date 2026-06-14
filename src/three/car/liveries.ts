// Per-team livery palettes for the car explorer. COLOR SCHEMES ONLY — no logos,
// sponsors, or copyrighted artwork (those aren't reproducible). Each livery
// paints the procedural 2026-spec car so every team's car reads as its own:
//   body  → main shells (nose, cockpit, engine cover, sidepods, halo) [carbon role]
//   wing  → front/rear wings + floor [matte role]
//   accent→ active-aero flaps + accent strips + highlight/hotspot color [accent role]
//   trim  → wheel rims + small metal [rim role]
// Approximations of real 2026 identities; tweak the hexes freely.
export interface Livery {
  body: string;
  wing: string;
  accent: string;
  trim: string;
}

// Vivid, clearly-distinct paint per team. `body` is the main team colour;
// `wing` is a darker tint of the SAME hue (NOT near-black) so wings + the floor
// read as coloured, not black; `accent` pops on active-aero/strips; `trim` =
// wheel/metal. Tuned for visibility on the dark 3D stage.
export const LIVERIES: Record<string, Livery> = {
  mclaren: { body: '#FF8000', wing: '#B85600', accent: '#16C8FF', trim: '#C8CCD0' },
  ferrari: { body: '#E8002D', wing: '#9C0020', accent: '#FFE600', trim: '#BBBFC4' },
  'red-bull': { body: '#2C5BD6', wing: '#1B3A8C', accent: '#FFC400', trim: '#D4A12A' },
  mercedes: { body: '#00C9B1', wing: '#0B6E62', accent: '#D6F0EC', trim: '#C2CACE' },
  'aston-martin': { body: '#009B73', wing: '#015C45', accent: '#CCEE00', trim: '#B6BEBC' },
  alpine: { body: '#2188DA', wing: '#14528C', accent: '#FF63A5', trim: '#CFD6DD' },
  williams: { body: '#2E9BE6', wing: '#155F9E', accent: '#BFE9FF', trim: '#D7DDE3' },
  'racing-bulls': { body: '#2A44C8', wing: '#18306F', accent: '#F0325E', trim: '#D0D4DC' },
  audi: { body: '#C00018', wing: '#760010', accent: '#F50537', trim: '#C7CDD2' },
  haas: { body: '#E2E5E8', wing: '#6B7178', accent: '#E0001E', trim: '#9AA0A6' },
  cadillac: { body: '#C9A24A', wing: '#7A6230', accent: '#F2DCA0', trim: '#E0CF9A' },
};

// Neutral carbon fallback (also the back-compat shape when only an accent is
// known): a dark carbon body with the given accent — matches the pre-livery look.
const NEUTRAL_BODY = '#23262C';
const NEUTRAL_WING = '#15181D';
const NEUTRAL_TRIM = '#4A5057';

/** Stable livery for a team id; falls back to a carbon body tinted by `accent`. */
export function getLivery(
  teamId: string | undefined,
  accent = '#C9CED4',
): Livery {
  if (teamId && LIVERIES[teamId]) return LIVERIES[teamId];
  return { body: NEUTRAL_BODY, wing: NEUTRAL_WING, accent, trim: NEUTRAL_TRIM };
}
