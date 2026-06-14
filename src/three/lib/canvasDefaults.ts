// Shared R3F canvas defaults for every scene (hero/car/track) — PLAN §4:
// transparent-capable canvas, DPR clamp [1, 1.75], no realtime shadow maps.
import type { WebGLRendererParameters } from 'three';

/** Device-pixel-ratio clamp shared by every scene canvas (PLAN §4). */
export const CANVAS_DPR: [min: number, max: number] = [1, 1.75];

/**
 * Transparent, antialiased renderer settings shared by every scene canvas.
 * `alpha: true` + no scene background → the canvas composites over the page.
 */
export const GL_DEFAULTS: Partial<WebGLRendererParameters> = {
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
  stencil: false,
};
