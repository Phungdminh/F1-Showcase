// 3D track viewer scene (PLAN §4, T16). Self-contained R3F scene: props in,
// events out. Renders its own transparent Canvas over the page's #0F0F0F stage,
// builds a road ribbon from circuit.pathPoints (CatmullRom, closed), a start/
// finish gantry, sector hints, and a lapping accent pulse. The ribbon "draws
// itself in" from the `drawProgress` prop (MOTION §3) — the page passes 1 today;
// the Phase-4 motion agent animates 0→1 after the route settles.
//
// Camera glides, never teleports: OrbitControls is azimuth-focused (elevation
// near-locked) so the user "rotates left/right + zooms" (SPEC §3.4). Budget:
// ~7 draw calls, well under PLAN §4's ≤40 calls / ≤80k tris.
//
// Contract (frozen — byte-compatible with the stub):
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Html, OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';
import type { Circuit } from '../../types';
import { CANVAS_DPR, GL_DEFAULTS } from '../lib/canvasDefaults';
import { FirstFrameNotifier } from '../lib/firstFrameNotifier';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { buildCurve, buildPathTransform } from './worldTransform';
import { TRACK_WIDTH } from './ribbonGeometry';
import TrackRibbon from './TrackRibbon';
import StartFinishGantry from './StartFinishGantry';
import LapPulse from './LapPulse';

export interface TrackSceneProps {
  circuit: Circuit;
  /** 0–1; the motion designer sequences the ribbon draw-in after route settle. */
  drawProgress?: number;
  accentColor?: string;
  onFirstFrame?: () => void;
}

const GROUND_RADIUS = 12;
const GROUND_COLOR = '#141414';
const TICK_LEN = TRACK_WIDTH + 0.16; // sector tick crosses the road
const TICK_WIDTH = 0.03;
const SECTOR_COLOR = '#9aa0a6';

/** Eyebrow label style for sector hints (DESIGN §4 typographic convention). */
const EYEBROW_STYLE: CSSProperties = {
  fontSize: '10px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#e5e5e5',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  userSelect: 'none',
  pointerEvents: 'none',
  transform: 'translate(-50%, -120%)',
};

interface SectorTick {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  label: string;
}

/** Everything that lives *inside* the Canvas, so it can read the curve memo. */
function TrackContents({
  circuit,
  drawProgress,
  accentColor,
  reducedMotion,
}: {
  circuit: Circuit;
  drawProgress: number;
  accentColor?: string;
  reducedMotion: boolean;
}) {
  // World frame + curve are rebuilt only when the circuit changes.
  const { curve, pathPointCount } = useMemo(() => {
    const transform = buildPathTransform(circuit);
    return {
      curve: buildCurve(transform.worldPoints),
      pathPointCount: circuit.pathPoints.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuit.id]);

  // Sector hint ticks at the two sectorBreaks indices (guarded in range).
  const sectorTicks = useMemo<SectorTick[]>(() => {
    const n = pathPointCount;
    if (n === 0) return [];
    return circuit.sectorBreaks
      .map((idx, i): SectorTick | null => {
        if (!Number.isInteger(idx) || idx < 0 || idx >= n) return null;
        const u = idx / n;
        const point = curve.getPointAt(u, new THREE.Vector3());
        const tangent = curve.getTangentAt(u, new THREE.Vector3()).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          tangent,
        );
        return {
          // i=0 → entry of sector 2, i=1 → entry of sector 3.
          position: point.setY(0.014),
          quaternion: quat,
          label: i === 0 ? 'S2' : 'S3',
        };
      })
      .filter((t): t is SectorTick => t !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuit.id, curve, pathPointCount]);

  return (
    <>
      {/* Soft neutral lighting — kerbs/pulse are unlit; this shapes the road. */}
      <hemisphereLight args={['#cfd3d8', '#0a0a0a', 1.0]} />
      <directionalLight position={[6, 10, 4]} intensity={0.7} />
      {/* Accent rim light — this round's colour rakes the scene from behind,
          tinting the road's far edge so each circuit reads with its own hue. */}
      <directionalLight
        position={[-7, 4, -5]}
        intensity={0.55}
        color={accentColor ?? '#cfd3d8'}
      />

      {/* Ground disc, just below the lifted ribbon. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[GROUND_RADIUS, 64]} />
        <meshStandardMaterial color={GROUND_COLOR} roughness={1} metalness={0} />
      </mesh>

      <TrackRibbon
        curve={curve}
        pathPointCount={pathPointCount}
        circuitId={circuit.id}
        drawProgress={drawProgress}
      />

      <StartFinishGantry
        curve={curve}
        startFinishIndex={circuit.startFinishIndex}
        pathPointCount={pathPointCount}
      />

      {/* Sector ticks + eyebrow labels. */}
      {sectorTicks.map((tick) => (
        <group
          key={tick.label}
          position={tick.position}
          quaternion={tick.quaternion}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[TICK_LEN, TICK_WIDTH]} />
            <meshBasicMaterial color={accentColor ?? SECTOR_COLOR} />
          </mesh>
          <Html position={[0, 0.25, 0]} center distanceFactor={10}>
            <div style={EYEBROW_STYLE}>{tick.label}</div>
          </Html>
        </group>
      ))}

      <LapPulse
        curve={curve}
        accentColor={accentColor}
        drawProgress={drawProgress}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

export default function TrackScene({
  circuit,
  drawProgress = 1,
  accentColor,
  onFirstFrame,
}: TrackSceneProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      gl={GL_DEFAULTS}
      dpr={CANVAS_DPR}
      camera={{ fov: 45, position: [0, 9, 13], near: 0.1, far: 200 }}
      frameloop="always"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* onFirstFrame lives at the Canvas root so it fires regardless of the
          ribbon's draw state (poster→canvas crossfade, MOTION §4). */}
      <FirstFrameNotifier onFirstFrame={onFirstFrame} />
      <AdaptiveDpr />

      <TrackContents
        circuit={circuit}
        drawProgress={drawProgress}
        accentColor={accentColor}
        reducedMotion={reducedMotion}
      />

      {/* Azimuth-focused orbit: elevation near-locked so the gesture reads as
          "rotate left/right + zoom" (SPEC §3.4). Damped → camera glides. */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.9}
        maxPolarAngle={1.15}
        minDistance={8}
        maxDistance={30}
        target={[0, 0, 0]}
        // No auto-spin (user-driven azimuth only) — also satisfies reduced motion.
        autoRotate={false}
      />
    </Canvas>
  );
}
