// StartFinishGantry — a simple gantry (two posts + top beam) straddling the
// track at the start/finish line, plus a checkered strip laid across the road
// (T16). Self-contained: positioned/oriented from the curve, no events.
//
// Placement: we use the curve point/tangent at the arc-length fraction that
// corresponds to startFinishIndex (buildPath guarantees index 0 = start/finish
// for the seed circuits, but we honor any index). The group is rotated so its
// local +x runs ACROSS the track (along the horizontal normal) and the
// checker quads tile along the road direction (local +z).
import { useMemo } from 'react';
import * as THREE from 'three';
import { TRACK_WIDTH } from './ribbonGeometry';

export interface StartFinishGantryProps {
  curve: THREE.CatmullRomCurve3;
  /** pathPoints index of the start/finish line. */
  startFinishIndex: number;
  /** Total pathPoints count → index→arc-fraction. */
  pathPointCount: number;
}

const POST_HEIGHT = 0.6;
const POST_THICK = 0.05;
const BEAM_THICK = 0.06;
const STRADDLE = TRACK_WIDTH + 0.18; // beam spans a bit wider than the road
const CHECK_ROWS = 2; // across the track
const CHECK_COLS = 6; // wider than tall reads as a start line
const CHECK_DEPTH = 0.22; // total strip length along the road

export default function StartFinishGantry({
  curve,
  startFinishIndex,
  pathPointCount,
}: StartFinishGantryProps) {
  const { position, quaternion, checkers } = useMemo(() => {
    const u =
      pathPointCount > 0
        ? (((startFinishIndex % pathPointCount) + pathPointCount) %
            pathPointCount) /
          pathPointCount
        : 0;
    const point = curve.getPointAt(u, new THREE.Vector3());
    const tangent = curve.getTangentAt(u, new THREE.Vector3()).normalize();
    // Orient local -z to the road tangent (so local +x = across via the basis).
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      tangent,
    );

    // Precompute a flat checkerboard in LOCAL space (group handles transform).
    const cells: { x: number; z: number; light: boolean }[] = [];
    const cellW = STRADDLE / CHECK_COLS;
    const cellD = CHECK_DEPTH / CHECK_ROWS;
    for (let r = 0; r < CHECK_ROWS; r++) {
      for (let c = 0; c < CHECK_COLS; c++) {
        cells.push({
          x: (c - (CHECK_COLS - 1) / 2) * cellW,
          z: (r - (CHECK_ROWS - 1) / 2) * cellD,
          light: (r + c) % 2 === 0,
        });
      }
    }

    return {
      position: point,
      quaternion: quat,
      checkers: { cells, cellW, cellD },
    };
  }, [curve, startFinishIndex, pathPointCount]);

  return (
    <group position={position} quaternion={quaternion}>
      {/* Posts — one each side of the track. */}
      <mesh position={[-STRADDLE / 2, POST_HEIGHT / 2, 0]}>
        <boxGeometry args={[POST_THICK, POST_HEIGHT, POST_THICK]} />
        <meshStandardMaterial color="#2b2c30" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[STRADDLE / 2, POST_HEIGHT / 2, 0]}>
        <boxGeometry args={[POST_THICK, POST_HEIGHT, POST_THICK]} />
        <meshStandardMaterial color="#2b2c30" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Top beam spanning the posts. */}
      <mesh position={[0, POST_HEIGHT, 0]}>
        <boxGeometry args={[STRADDLE + POST_THICK, BEAM_THICK, BEAM_THICK * 2]} />
        <meshStandardMaterial color="#35363b" roughness={0.6} metalness={0.25} />
      </mesh>
      {/* Checkered strip across the road, just above the asphalt. */}
      <group position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {checkers.cells.map((cell, i) => (
          <mesh key={i} position={[cell.x, -cell.z, 0]}>
            <planeGeometry args={[checkers.cellW, checkers.cellD]} />
            <meshBasicMaterial color={cell.light ? '#f2f2f2' : '#101012'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
