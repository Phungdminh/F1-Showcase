// Loading skeleton — MOTION.md §4: appears only after a 150ms delay (no flash on
// fast loads) and fades in once it does, so content never pops on top of a freshly
// appeared skeleton. The element keeps its box from the first frame (so layout never
// shifts); only its opacity is gated. Reduced motion → no fade, just the delayed reveal.
//
// Backward compatible: `className` is unchanged; `delayMs` is new + optional (default
// 150). Existing call sites (StandingsPage TableSkeleton, DriverDetailPage,
// CarExplorerPage poster, FeaturedTabs) keep working untouched.
import { motion } from 'framer-motion';
import { DUR, useReducedMotionSafe } from '../lib/motion';
import { useDelayedFlag } from '../lib/useDelayedFlag';

export default function Skeleton({
  className = '',
  delayMs = 150,
}: {
  className?: string;
  delayMs?: number;
}) {
  const reduced = useReducedMotionSafe();
  const visible = useDelayedFlag(true, delayMs);

  return (
    <motion.div
      aria-hidden="true"
      className={`animate-pulse rounded bg-neutral-200 ${className}`.trim()}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : DUR.fast }}
    />
  );
}
