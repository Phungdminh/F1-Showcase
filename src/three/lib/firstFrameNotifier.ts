// Generic one-shot "first real frame rendered" notifier — PLAN §4 requires
// every scene to expose onFirstFrame() so pages can crossfade the poster to
// the canvas (MOTION §4: triggered by first frame, not by mount).
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

/**
 * Fires `onFirstFrame` exactly once, right after the first frame this hook
 * observes has been presented. `useFrame` runs *before* R3F renders the frame,
 * so we defer by one rAF to guarantee pixels are actually on screen.
 * Works with `frameloop="always"` and with the single mount render of
 * `frameloop="demand"` (reduced-motion static scenes still notify).
 */
export function useFirstFrame(onFirstFrame?: () => void): void {
  const firedRef = useRef(false);
  const rafRef = useRef(0);
  const callbackRef = useRef(onFirstFrame);
  callbackRef.current = onFirstFrame;

  useFrame(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    rafRef.current = requestAnimationFrame(() => callbackRef.current?.());
  });

  // Strict-mode safe: a pending notification never outlives the scene.
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
}

/** Drop-in component form — render anywhere inside a `<Canvas>`. */
export function FirstFrameNotifier({
  onFirstFrame,
}: {
  onFirstFrame?: () => void;
}) {
  useFirstFrame(onFirstFrame);
  return null;
}
