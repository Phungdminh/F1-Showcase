// LapPulse — a small glowing marker that laps the circuit once every ~12s, a
// quiet "the track is live" accent (T16). Self-contained: props in, nothing out.
//
// Visibility: HIDDEN until the ribbon is fully drawn (drawProgress >= 1) so it
// never appears ahead of the wipe. Reduced motion: rendered static at the
// start/finish (no travel, no pulsing). Color comes from accentColor (never a
// hardcoded team hex); defaults to white.
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export interface LapPulseProps {
  curve: THREE.CatmullRomCurve3;
  /** Accent color (team-neutral default). */
  accentColor?: string;
  /** Ribbon reveal fraction — pulse shows only at full draw. */
  drawProgress?: number;
  /** Freeze travel + pulsing for prefers-reduced-motion. */
  reducedMotion?: boolean;
}

const LAP_SECONDS = 12;
const CORE_RADIUS = 0.085;
const HALO_RADIUS = 0.28;
const TRAVEL_LIFT = 0.06; // ride a touch above the asphalt

export default function LapPulse({
  curve,
  accentColor = '#ffffff',
  drawProgress = 1,
  reducedMotion = false,
}: LapPulseProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const color = useMemo(() => new THREE.Color(accentColor), [accentColor]);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  // Static placement at start/finish for reduced motion (and the mount frame).
  const startPos = useMemo(
    () => curve.getPointAt(0, new THREE.Vector3()).setY(TRAVEL_LIFT),
    [curve],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || reducedMotion) return;
    const t = (clock.elapsedTime / LAP_SECONDS) % 1;
    curve.getPointAt(t, scratch);
    group.position.set(scratch.x, TRAVEL_LIFT, scratch.z);
    // Gentle breathing glow.
    if (coreMatRef.current) {
      coreMatRef.current.opacity =
        0.85 + Math.sin(clock.elapsedTime * 3) * 0.15;
    }
  });

  // Only visible once the loop has fully drawn in.
  if (drawProgress < 1) return null;

  return (
    <group ref={groupRef} position={reducedMotion ? startPos : undefined}>
      {/* Glowing core. */}
      <mesh>
        <sphereGeometry args={[CORE_RADIUS, 16, 12]} />
        <meshBasicMaterial
          ref={coreMatRef}
          color={color}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </mesh>
      {/* Additive halo — a camera-facing sprite-like disc. */}
      <sprite scale={[HALO_RADIUS, HALO_RADIUS, HALO_RADIUS]}>
        <spriteMaterial
          color={color}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}
