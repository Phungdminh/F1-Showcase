// TrackRibbon — renders the road surface + two kerb strips and applies the
// `drawProgress` reveal (T16). Self-contained: props in (curve + progress),
// nothing out. Geometry is memoized on `circuitId` and disposed on unmount.
//
// drawProgress mapping (see ribbonGeometry for the vertex/index contract):
// indices run sequentially from the start/finish forward, 6 per segment, so
// setDrawRange(0, floor(indexCount * clamp(drawProgress))) reveals the ribbon
// as a clean wipe along the curve. We snap the count to a multiple of 6 so a
// partial segment never shows a half-triangle. Applied IDENTICALLY to road and
// both kerbs (shared ordering) → they reveal in lockstep. We react every render
// to the live prop, so the Phase-4 motion agent can animate 0→1 from outside.
import { useEffect, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ASPHALT_COLOR, buildTrackRibbon } from './ribbonGeometry';

export interface TrackRibbonProps {
  curve: THREE.CatmullRomCurve3;
  /** pathPoints.length — drives ribbon sample density. */
  pathPointCount: number;
  /** Stable key for geometry memoization (circuit.id). */
  circuitId: string;
  /** 0..1 reveal fraction along the curve. Default 1 (full loop). */
  drawProgress?: number;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export default function TrackRibbon({
  curve,
  pathPointCount,
  circuitId,
  drawProgress = 1,
}: TrackRibbonProps) {
  // Built once per circuit; the curve identity tracks circuitId (both derive
  // from the same memo in TrackScene), so this is stable across draw frames.
  const ribbon = useMemo(
    () => buildTrackRibbon(curve, pathPointCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [circuitId],
  );

  useEffect(() => () => ribbon.dispose(), [ribbon]);

  // Apply the reveal synchronously before paint so the first presented frame
  // already honors drawProgress (no one-frame flash at full length on mount).
  useLayoutEffect(() => {
    const p = clamp01(drawProgress);
    for (const part of [ribbon.road, ribbon.kerbLeft, ribbon.kerbRight]) {
      // Snap to whole triangles (3 indices) — actually whole segments isn't
      // required; a triangle boundary is enough to avoid a torn face.
      const raw = Math.floor(part.indexCount * p);
      const count = raw - (raw % 3);
      part.geometry.setDrawRange(0, count);
    }
  }, [ribbon, drawProgress]);

  return (
    <group>
      {/* Road surface — matte asphalt, double-sided so the underside of a
          banked sample never drops out at grazing angles. */}
      <mesh geometry={ribbon.road.geometry}>
        <meshStandardMaterial
          color={ASPHALT_COLOR}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Kerbs — vertex-colored alternating blocks, unlit so the red stays
          crisp against the dark stage. */}
      <mesh geometry={ribbon.kerbLeft.geometry}>
        <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={ribbon.kerbRight.geometry}>
        <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
