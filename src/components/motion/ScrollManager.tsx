// MOTION.md §5 — scroll choreography. Mounted once inside <BrowserRouter>.
//   • Forward nav  → reset scroll to top INSTANTLY during the outgoing exit
//     (hidden behind PageTransition's exit fade), never visibly after enter.
//   • Back nav     → restore the previous position for that history entry.
// We cache window scrollY keyed by `location.key` (stable per history entry) so
// a back navigation lands exactly where the user left.
//
// Renders nothing. Additive module — no existing API touched.
import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavDirection } from '../../lib/motion';

export default function ScrollManager() {
  const location = useLocation();
  const direction = useNavDirection();
  const positions = useRef<Map<string, number>>(new Map());
  // The key we are leaving — recorded so we can stamp its scroll position on exit.
  const lastKey = useRef<string>(location.key);

  // Disable the browser's own scroll restoration; we own it (MOTION §5).
  useLayoutEffect(() => {
    const history = window.history;
    const prev = history.scrollRestoration;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    return () => {
      if ('scrollRestoration' in history) history.scrollRestoration = prev;
    };
  }, []);

  useLayoutEffect(() => {
    // Stamp the scroll position of the entry we are leaving, then act on the new one.
    positions.current.set(lastKey.current, window.scrollY);

    if (direction === 'back') {
      // Restore the position saved for this history entry. The jump happens while
      // the outgoing page is still fading out (mode="wait"), so it is never seen;
      // the entering page then animates in already at the restored offset (MOTION §5).
      const saved = positions.current.get(location.key) ?? 0;
      window.scrollTo({ top: saved, left: 0, behavior: 'auto' });
    } else {
      // Forward: reset to top instantly. PageTransition's exit fade hides the jump.
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    lastKey.current = location.key;
  }, [location.key, direction]);

  return null;
}
