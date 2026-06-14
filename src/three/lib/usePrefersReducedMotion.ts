// matchMedia-based reduced-motion check for 3D scenes. Scenes are mounted via
// React.lazy and must stay self-contained (no Router/page imports), so they
// cannot rely on src/lib/motion.ts's useReducedMotionSafe() context. Semantics
// match MOTION §6: reduce → freeze turntables/particles, render static frames.
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
