// Shared normalized-path → world-space mapping for the track viewer (T16).
// Every track module (ribbon geometry, gantry, lap pulse) must place itself in
// the SAME coordinate frame, so the mapping lives here once. Self-contained:
// imports only `three` + the frozen Circuit type.
//
// Circuit.pathPoints are normalized into [0,1]² (buildPath: aspect preserved,
// 5% margin, point 0 = start/finish, last point NOT a duplicate of the first).
// We map them onto the ground plane (XZ) centered at the layout's centroid:
//   - subtract the bounding-box centre so the layout sits around the origin;
//   - uniform scale so the LARGER axis spans ~LAYOUT_SPAN world units;
//   - x → world +x; normalized y (south/down in track-map convention) → world
//     +z, so the camera looking down −z keeps "north up" (we negate nothing on
//     y here because +y-down maps naturally to +z-into-screen for a top view);
//   - lift to y = GROUND_LIFT so the ribbon floats just above the ground disc.
import * as THREE from 'three';
import type { Circuit } from '../../types';

/** Larger layout axis spans this many world units (brief: ~14). */
export const LAYOUT_SPAN = 14;
/** Ribbon sits this far above y=0 so it never z-fights the ground disc. */
export const GROUND_LIFT = 0.02;

export interface PathTransform {
  /** Normalized [0,1]² point → world Vector3 on the lifted ground plane. */
  toWorld(nx: number, ny: number, target?: THREE.Vector3): THREE.Vector3;
  /** World-space points for every entry of `pathPoints` (loop, no dup end). */
  worldPoints: THREE.Vector3[];
  /** Uniform world-units-per-normalized-unit scale (handy for line widths). */
  scale: number;
}

/**
 * Build the normalized→world transform for a circuit. Pure + deterministic:
 * same circuit always yields the same frame, so callers can `useMemo` on
 * `circuit.id`.
 */
export function buildPathTransform(circuit: Circuit): PathTransform {
  const pts = circuit.pathPoints;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  // Centre on the bounding-box midpoint (≈ centroid for a balanced loop).
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const scale = LAYOUT_SPAN / span;

  const toWorld = (
    nx: number,
    ny: number,
    target: THREE.Vector3 = new THREE.Vector3(),
  ): THREE.Vector3 =>
    target.set((nx - cx) * scale, GROUND_LIFT, (ny - cy) * scale);

  const worldPoints = pts.map(([x, y]) => toWorld(x, y));

  return { toWorld, worldPoints, scale };
}

/**
 * CatmullRom curve through the world-space loop (closed). Centripetal type
 * (three's default) avoids the cusps/overshoot a uniform spline can produce on
 * tight corners like Monaco's hairpin. The page passes ≥64 (here 128) points,
 * already smooth, so tension is irrelevant for centripetal.
 */
export function buildCurve(worldPoints: THREE.Vector3[]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(worldPoints, true, 'centripetal');
}
