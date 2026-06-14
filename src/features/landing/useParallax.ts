// Landing parallax controller (MOTION §3/§7). A thin wrapper over a scoped
// gsap.context() so every landing section builds its scroll-linked timeline the
// same way: register the plugin once at module scope, run the section's build
// callback inside gsap.context(..., scope) in useLayoutEffect, and revert on
// cleanup (kills the timeline + every ScrollTrigger and restores inline styles —
// React-StrictMode double-mount safe).
//
// GSAP is imported ONLY from landing files, so it stays in the landing chunk and
// never bleeds into the shared/route bundles.
//
// Reduced motion is LAW (MOTION §6): when the user prefers reduced motion we run
// NO build callback at all — sections render their static markup fully visible,
// no scrub, no pin, no scroll-jacking. The build callback receives a live `gsap`
// + `ScrollTrigger` so callers never import the plugin themselves.
import { useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { EASE, useReducedMotionSafe } from '../../lib/motion';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// GSAP can't read cubic-bezier() strings, so mint named CustomEases from the SAME
// bezier control points as the motion tokens — easing stays single-sourced.
// cubic-bezier(x1,y1,x2,y2) → SVG ease path "M0,0 C x1,y1 x2,y2 1,1".
export const EASE_OUT = 'f1-ease-out';
export const EASE_MOVE = 'f1-ease-move';
CustomEase.create(EASE_OUT, `M0,0 C${EASE.out[0]},${EASE.out[1]} ${EASE.out[2]},${EASE.out[3]} 1,1`);
CustomEase.create(EASE_MOVE, `M0,0 C${EASE.move[0]},${EASE.move[1]} ${EASE.move[2]},${EASE.move[3]} 1,1`);

/** The toolkit handed to every parallax build callback. */
export interface ParallaxContext {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  /** `true` when the build was skipped because the user prefers reduced motion. */
  reduced: boolean;
}

/**
 * Run a scoped GSAP build inside `scope` once it (and its children) are mounted.
 * `build` is called with the gsap toolkit; create timelines/ScrollTriggers there.
 * Returns nothing — cleanup is automatic via ctx.revert().
 *
 * When reduced motion is on, `build` is NOT called: the section stays static.
 */
export function useParallax(
  scope: RefObject<HTMLElement>,
  build: (ctx: ParallaxContext) => void,
): void {
  const reduced = useReducedMotionSafe();

  useLayoutEffect(() => {
    const root = scope.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      build({ gsap, ScrollTrigger, reduced });
    }, root);

    // A late refresh covers fonts/images settling after first paint so trigger
    // start/end positions are measured against the final layout.
    ScrollTrigger.refresh();

    return () => ctx.revert();
    // `build` is recreated each render; callers pass stable inline closures and
    // the only real dependency is the scope + reduced flag. We intentionally do
    // not depend on `build` to avoid tearing down triggers on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, reduced]);
}
