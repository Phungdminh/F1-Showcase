// Motion tokens — docs/MOTION.md §1, verbatim. Single source of truth:
// no component invents its own duration/easing.
import { useReducedMotion } from 'framer-motion';
import { useNavigationType } from 'react-router-dom';

export const DUR = { fast: 0.2, base: 0.32, slow: 0.5, set: 0.9 }; // seconds

type Bezier = [number, number, number, number];
export const EASE: { out: Bezier; in: Bezier; move: Bezier } = {
  out: [0.16, 1, 0.3, 1], // entrances (expo-out feel)
  in: [0.5, 0, 0.75, 0], // exits — always quicker + sharper than entrances
  move: [0.83, 0, 0.17, 1], // shared elements & camera glides
};

export const SPRING = { stiffness: 260, damping: 24 }; // preview cards
export const RISE = { hero: 16, section: 24, max: 32 }; // px
export const STAGGER = { cards: 0.06, hero: 0.08 }; // seconds

/** Central reduced-motion check — every animated component must respect this. */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}

export type NavDirection = 'forward' | 'back';

/**
 * Back/forward direction for direction-aware route transitions (MOTION.md §2).
 * POP = history back/forward → treat as "back"; PUSH/REPLACE → "forward".
 */
export function useNavDirection(): NavDirection {
  const navType = useNavigationType();
  return navType === 'POP' ? 'back' : 'forward';
}
