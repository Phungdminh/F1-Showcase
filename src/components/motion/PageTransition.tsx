// MOTION.md §2/§3 primitive — direction-aware CINEMATIC PARALLAX route transition
// (upgraded per the user's "very smooth parallax transitions between URLs"
// direction). Wraps the routed outlet in <AnimatePresence mode="wait"> so the
// exiting tree holds until the next page enters: never a blank/white/black frame.
//
//   Forward (drill IN):  incoming rises from y:+48 + fade in
//                        outgoing eases UP to y:-32, scale 0.985 + fade out
//   Back   (drill OUT):  mirrored — incoming drops from y:-48, outgoing slides
//                        DOWN to y:+32 + fade — so going back feels reversed.
//   Reduced motion:      0.15s opacity crossfade only — no transform (MOTION §6).
//
// Both directions run on EASE.move over ~DUR.slow so the two pages feel like
// layered planes sliding past each other (the parallax hand-off). mode="wait"
// sequences exit→enter so they never overlap and input isn't blocked > ~300ms.
//
// This is the generic rule for every UNMAPPED route pair (MOTION §2). Mapped
// pairs add shared-element morphs on top via layoutId inside the shared
// <LayoutGroup> in App.tsx — untouched here, so layout animations still work.
//
// will-change is set only while animating and cleared after (MOTION §7).
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { DUR, EASE, useNavDirection, useReducedMotionSafe } from '../../lib/motion';

// Parallax travel distances (px) — entrance comes from further away than the
// exit retreats, so the incoming plane reads as "below/above" the outgoing one.
const ENTER_OFFSET = 48;
const EXIT_OFFSET = 32;
const EXIT_SCALE = 0.985;

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const direction = useNavDirection();
  const reduced = useReducedMotionSafe();

  // Forward drills in (incoming rises from below); back reverses (from above).
  const sign = direction === 'back' ? -1 : 1;

  const variants: Variants = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        initial: { opacity: 0, y: sign * ENTER_OFFSET, scale: 1 },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: DUR.slow, ease: EASE.move },
        },
        exit: {
          opacity: 0,
          y: sign * -EXIT_OFFSET,
          scale: EXIT_SCALE,
          transition: { duration: DUR.slow, ease: EASE.move },
        },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Page key={location.pathname} variants={variants} reduced={reduced}>
        {children}
      </Page>
    </AnimatePresence>
  );
}

function Page({
  children,
  variants,
  reduced,
}: {
  children: ReactNode;
  variants: Variants;
  reduced: boolean;
}) {
  // will-change only during flight; transform hint omitted entirely under reduced motion.
  const [animating, setAnimating] = useState(true);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      onAnimationStart={() => setAnimating(true)}
      onAnimationComplete={() => setAnimating(false)}
      style={{ willChange: animating ? (reduced ? 'opacity' : 'transform, opacity') : 'auto' }}
    >
      {children}
    </motion.div>
  );
}
