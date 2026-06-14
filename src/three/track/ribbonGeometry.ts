// Ribbon geometry for the track viewer (T16). Builds the road surface and the
// two kerb strips as indexed triangle-strip BufferGeometries whose vertices and
// indices are ordered SEQUENTIALLY along the curve, so `drawProgress` (0..1)
// maps directly to a `setDrawRange(0, count)` reveal (see TrackRibbon).
//
// Self-contained: imports only `three`. Geometry is built once per circuit and
// disposed on unmount by the caller.
import * as THREE from 'three';

/** Total road width in world units (brief: ~0.5). */
export const TRACK_WIDTH = 0.5;
/** Width of each kerb strip, sitting just outside a road edge. */
const KERB_WIDTH = 0.07;
/** How many world units one kerb red/neutral block spans along the curve. */
const KERB_BLOCK_LEN = 0.45;
/** Asphalt + kerb colors (restrained — the page owns the dark stage). */
export const ASPHALT_COLOR = '#1c1d20';
const KERB_RED = new THREE.Color('#d23b3b');
const KERB_NEUTRAL = new THREE.Color('#e8e8e8');

/**
 * A strip generated along the curve. Vertices are laid out as consecutive
 * (left, right) PAIRS per sample i = 0..segments (segments+1 pairs total), and
 * the index buffer lists triangles segment-by-segment in curve order:
 *   segment s → [L_s, R_s, L_{s+1}] , [R_s, R_{s+1}, L_{s+1}]
 * So index k corresponds to a position fraction ≈ floor(k/6)/segments along the
 * curve, and `setDrawRange(0, n)` reveals the first n/6 segments — a clean
 * "draws itself in" wipe from start/finish forward. Closed loop: the last pair
 * (i = segments) coincides with the first, so the full range closes the ring.
 */
export interface RibbonGeometry {
  geometry: THREE.BufferGeometry;
  /** Total indices (6 per segment); the draw-range denominator. */
  indexCount: number;
}

interface StripSpec {
  /** Signed offsets (world units) of the strip's two edges from the curve. */
  innerOffset: number;
  outerOffset: number;
  /** Per-vertex coloring; omit for a plain (uncolored) strip. */
  color?: (sampleIndex: number, posAlong: number) => THREE.Color;
}

/**
 * Sample `curve` at `segments` segments and emit a flat ribbon between
 * `innerOffset` and `outerOffset` (signed, along the horizontal normal). The
 * curve is closed, so we sample i/segments for i in [0, segments] and the final
 * sample wraps to the start — giving a seamless ring.
 */
function buildStrip(
  curve: THREE.CatmullRomCurve3,
  segments: number,
  spec: StripSpec,
): RibbonGeometry {
  const pairCount = segments + 1;
  const positions = new Float32Array(pairCount * 2 * 3);
  const colors = spec.color ? new Float32Array(pairCount * 2 * 3) : null;

  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const totalLen = curve.getLength();

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    curve.getPointAt(u, point);
    curve.getTangentAt(u, tangent);
    // Horizontal normal: perpendicular to the tangent in the XZ plane.
    normal.crossVectors(tangent, up).normalize();

    const inner = i * 2;
    const outer = inner + 1;
    // Inner edge.
    positions[inner * 3] = point.x + normal.x * spec.innerOffset;
    positions[inner * 3 + 1] = point.y;
    positions[inner * 3 + 2] = point.z + normal.z * spec.innerOffset;
    // Outer edge.
    positions[outer * 3] = point.x + normal.x * spec.outerOffset;
    positions[outer * 3 + 1] = point.y;
    positions[outer * 3 + 2] = point.z + normal.z * spec.outerOffset;

    if (colors && spec.color) {
      const c = spec.color(i, u * totalLen);
      colors[inner * 3] = c.r;
      colors[inner * 3 + 1] = c.g;
      colors[inner * 3 + 2] = c.b;
      colors[outer * 3] = c.r;
      colors[outer * 3 + 1] = c.g;
      colors[outer * 3 + 2] = c.b;
    }
  }

  // Two triangles per segment, in curve order (sequential index buffer).
  const indices = new Uint16Array(segments * 6);
  for (let s = 0; s < segments; s++) {
    const li = s * 2;
    const ri = li + 1;
    const ln = li + 2;
    const rn = li + 3;
    const o = s * 6;
    // Winding: top face visible from above (+y).
    indices[o] = li;
    indices[o + 1] = ln;
    indices[o + 2] = ri;
    indices[o + 3] = ri;
    indices[o + 4] = ln;
    indices[o + 5] = rn;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  if (colors) {
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  // Flat ground ribbon → bounding sphere is cheap and stable; precompute so the
  // partial draw-range never triggers a recompute mid-animation.
  geometry.computeBoundingSphere();

  return { geometry, indexCount: indices.length };
}

export interface TrackRibbonGeometries {
  road: RibbonGeometry;
  kerbLeft: RibbonGeometry;
  kerbRight: RibbonGeometry;
  /** Segment count shared by road + kerbs (identical ordering → same range). */
  segments: number;
  dispose(): void;
}

/**
 * Build the road and both kerb ribbons for a circuit curve. ALL THREE share the
 * same `segments` count and the same sequential vertex/index ordering, so a
 * single `drawProgress` fraction maps to the same `setDrawRange` count on each
 * (TrackRibbon applies it uniformly).
 *
 * Sampling: N ≈ min(512, pathLength*8) segments — dense enough for tight
 * corners (Monaco), capped for the budget.
 */
export function buildTrackRibbon(
  curve: THREE.CatmullRomCurve3,
  pathPointCount: number,
): TrackRibbonGeometries {
  const segments = Math.min(512, Math.max(64, pathPointCount * 8));
  const half = TRACK_WIDTH / 2;

  const road = buildStrip(curve, segments, {
    innerOffset: -half,
    outerOffset: half,
  });

  // Alternating red/neutral blocks along the curve, by world distance so block
  // size is consistent regardless of corner radius.
  const kerbColor = (_i: number, posAlong: number): THREE.Color =>
    Math.floor(posAlong / KERB_BLOCK_LEN) % 2 === 0 ? KERB_RED : KERB_NEUTRAL;

  const kerbLeft = buildStrip(curve, segments, {
    innerOffset: -half - KERB_WIDTH,
    outerOffset: -half,
    color: kerbColor,
  });
  const kerbRight = buildStrip(curve, segments, {
    innerOffset: half,
    outerOffset: half + KERB_WIDTH,
    color: kerbColor,
  });

  return {
    road,
    kerbLeft,
    kerbRight,
    segments,
    dispose() {
      road.geometry.dispose();
      kerbLeft.geometry.dispose();
      kerbRight.geometry.dispose();
    },
  };
}
