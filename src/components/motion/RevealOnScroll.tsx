// MOTION.md §2 primitive — scroll-triggered reveal (Phase 4, f1-motion-designer).
// Fades + rises its children RISE.section (24px) over DUR.base with EASE.out the
// first time they scroll into view. Uses Framer's `whileInView` with `viewport.once`
// so it fires a single time, plus a negative bottom margin so the reveal kicks in
// slightly BEFORE the element reaches the fold (feels anticipatory, not laggy).
//
// Reduced motion (MOTION §6): pure passthrough — children render at opacity 1 with
// no transform, no observer. Functionality identical.
import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { DUR, EASE, RISE, useReducedMotionSafe } from '../../lib/motion';

export interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
}

const variants: Variants = {
  hidden: { opacity: 0, y: RISE.section },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE.out } },
};

export default function RevealOnScroll({ children, className }: RevealOnScrollProps) {
  const reduced = useReducedMotionSafe();
  // will-change only during the one-shot reveal, then dropped (MOTION §7).
  const [animating, setAnimating] = useState(false);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      onAnimationStart={() => setAnimating(true)}
      onAnimationComplete={() => setAnimating(false)}
      style={{ willChange: animating ? 'transform, opacity' : 'auto' }}
    >
      {children}
    </motion.div>
  );
}
