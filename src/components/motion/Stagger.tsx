// MOTION.md §2 primitive — list entrance choreography (Phase 4, f1-motion-designer).
// Staggers its DIRECT children in on mount: each child rises RISE.section (24px)
// and fades over DUR.base with EASE.out, STAGGER.cards (60ms) apart by default
// (override via `interval`). Built on Framer variants so the timing lives in one
// place; each child is wrapped in a `motion.div` item that inherits the container's
// `staggerChildren` orchestration. Generic — works for the TeamsPage grid Links.
//
// Reduced motion (MOTION §6): children render at opacity 1 with NO transform and
// NO stagger — instant, layout identical.
//
// Coordination: this only animates a transform/opacity WRAPPER around each child;
// any Lane A `layoutId`/`layout` shared-element node lives INSIDE a child and is
// untouched (the wrapper never carries a layoutId, so it can't fight the morph).
import { Children, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { DUR, EASE, RISE, STAGGER, useReducedMotionSafe } from '../../lib/motion';

export interface StaggerProps {
  children: ReactNode;
  /** seconds between items — defaults to STAGGER.cards in the real impl */
  interval?: number;
  className?: string;
}

const item: Variants = {
  hidden: { opacity: 0, y: RISE.section },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE.out } },
};

export default function Stagger({ children, interval = STAGGER.cards, className }: StaggerProps) {
  const reduced = useReducedMotionSafe();

  // Reduced motion → no container orchestration, no per-item transform.
  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: interval } },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {Children.map(children, (child) => (
        <StaggerItem>{child}</StaggerItem>
      ))}
    </motion.div>
  );
}

function StaggerItem({ children }: { children: ReactNode }) {
  // will-change is set only while the rise plays and cleared once it lands, so the
  // hint never lingers on the dozens of cards we may stagger (MOTION §7).
  const [animating, setAnimating] = useState(true);

  return (
    <motion.div
      variants={item}
      onAnimationComplete={() => setAnimating(false)}
      style={{ willChange: animating ? 'transform, opacity' : 'auto' }}
    >
      {children}
    </motion.div>
  );
}
