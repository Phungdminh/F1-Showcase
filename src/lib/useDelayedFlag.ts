// MOTION.md §4 — "Skeletons appear only after a 150ms delay (avoid flash on
// fast loads)". A tiny timer hook: returns `false` until `delayMs` has elapsed
// while `active` stays true; resets immediately when `active` flips false.
//
// Additive module (no existing API touched). Consumers: src/components/Skeleton.tsx
// and any component that wants flash-free loading affordances.
import { useEffect, useState } from 'react';

/**
 * Gates a boolean so it only becomes true after `delayMs` of continuous
 * `active === true`. Strict-mode safe (the effect's cleanup clears the timer on
 * the throwaway first mount). When `active` is false the flag is false at once.
 */
export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) {
      setElapsed(false);
      return;
    }
    const id = window.setTimeout(() => setElapsed(true), delayMs);
    return () => window.clearTimeout(id);
  }, [active, delayMs]);

  return active && elapsed;
}
