// HeroScene — landing hero 3D layer (PLAN §4, T13). Self-contained: renders
// its own transparent Canvas, composites over the light #FBFDFD hero like
// `object-cover object-top` (car composed high in frame), and fires
// onFirstFrame() exactly once so the page can crossfade poster → canvas.
//
// Motion: cinematic slow drift (car float/yaw + camera orbital dolly) and a
// damped ±2° pointer parallax — no user controls. Easing character follows
// src/lib/motion.ts (EASE.out-style settle over DUR.set; damped glides match
// EASE.move's slow symmetric feel). Reduced motion → one static frame,
// onFirstFrame still fires.
//
// Budget: ~38 draw calls (car ~35, shadow 1, speed lines 1), < 3k tris —
// well inside PLAN §4's ≤ 50 calls / ≤ 60k tris.
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import { DUR } from '../../lib/motion';
import { CANVAS_DPR, GL_DEFAULTS } from '../lib/canvasDefaults';
import { FirstFrameNotifier } from '../lib/firstFrameNotifier';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { FakeContactShadow } from '../lib/FakeContactShadow';
import { F1Car } from './F1Car';
import { SpeedLines } from './SpeedLines';

export interface HeroSceneProps {
  /** Fires once, after the first real frame has been presented (MOTION §4). */
  onFirstFrame?: () => void;
}

const CAMERA_POS = new THREE.Vector3(4, 1.2, 6);
// Looking *below* the car pushes it high in frame (hero reads object-top).
const LOOK_TARGET = new THREE.Vector3(0, -0.55, 0);
const PARALLAX_RAD = THREE.MathUtils.degToRad(2); // ±2° pointer parallax
// Nose angled toward the camera → front-3/4 view (nose, front wing, halo).
const BASE_YAW = -0.3;

/** Expo-out — same character as EASE.out [0.16, 1, 0.3, 1]. */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Autonomous camera: slow orbital drift + dolly, plus damped pointer parallax.
 * Damping lambda is tuned so direction changes glide (EASE.move character) —
 * the camera never teleports.
 */
function CameraRig({ frozen }: { frozen: boolean }) {
  const camera = useThree((state) => state.camera);
  const pointer = useRef({ x: 0, y: 0 });
  const offset = useRef({ yaw: 0, pitch: 0 });

  const baseSpherical = useMemo(
    () =>
      new THREE.Spherical().setFromVector3(
        new THREE.Vector3().subVectors(CAMERA_POS, LOOK_TARGET),
      ),
    [],
  );
  const scratch = useMemo(() => new THREE.Spherical(), []);

  // Valid composition from frame zero (and the only one when frozen).
  useEffect(() => {
    camera.position.copy(CAMERA_POS);
    camera.lookAt(LOOK_TARGET);
  }, [camera]);

  useEffect(() => {
    if (frozen) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [frozen]);

  useFrame(({ clock }, delta) => {
    if (frozen) return;
    const t = clock.elapsedTime;
    const dt = Math.min(delta, 0.1);
    // Drift amplitude settles in over DUR.set — no pop on mount.
    const settle = easeOutExpo(Math.min(t / DUR.set, 1));

    offset.current.yaw = THREE.MathUtils.damp(
      offset.current.yaw,
      pointer.current.x * PARALLAX_RAD,
      2.2,
      dt,
    );
    offset.current.pitch = THREE.MathUtils.damp(
      offset.current.pitch,
      pointer.current.y * PARALLAX_RAD * 0.6,
      2.2,
      dt,
    );

    scratch.copy(baseSpherical);
    scratch.theta += offset.current.yaw + Math.sin(t * 0.08) * 0.035 * settle;
    scratch.phi = THREE.MathUtils.clamp(
      scratch.phi + offset.current.pitch,
      0.6,
      1.5,
    );
    scratch.radius += Math.sin(t * 0.11) * 0.28 * settle; // slow dolly

    camera.position.setFromSpherical(scratch).add(LOOK_TARGET);
    camera.lookAt(LOOK_TARGET);
  });

  return null;
}

/** Gentle float + yaw breathing for the car. Static at BASE_YAW when frozen. */
function DriftGroup({
  frozen,
  children,
}: {
  frozen: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const group = ref.current;
    if (frozen || !group) return;
    const t = clock.elapsedTime;
    const settle = easeOutExpo(Math.min(t / DUR.set, 1));
    group.position.y = Math.sin(t * 0.9) * 0.022 * settle;
    group.rotation.y = BASE_YAW + Math.sin(t * 0.32) * 0.045 * settle;
    group.rotation.z = Math.sin(t * 0.5 + 1.2) * 0.01 * settle;
  });

  return (
    <group ref={ref} rotation={[0, BASE_YAW, 0]}>
      {children}
    </group>
  );
}

export default function HeroScene({ onFirstFrame }: HeroSceneProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      gl={GL_DEFAULTS}
      dpr={CANVAS_DPR}
      camera={{ fov: 35, position: [4, 1.2, 6], near: 0.1, far: 60 }}
      // Reduced motion: render the single mount frame, then stay idle.
      frameloop={reducedMotion ? 'demand' : 'always'}
      // Decorative layer — fills its container, never intercepts the page.
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <FirstFrameNotifier onFirstFrame={onFirstFrame} />
      <AdaptiveDpr />
      <CameraRig frozen={reducedMotion} />

      {/* Bright studio feel: soft sky/ground ambience + key + cool rim. */}
      <hemisphereLight args={['#ffffff', '#b7bdc3', 0.9]} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} />
      <directionalLight position={[-5, 4, -4]} intensity={0.5} />

      <DriftGroup frozen={reducedMotion}>
        <F1Car />
      </DriftGroup>

      {/* Invisible floor: soft contact shadow aligned with the car's yaw. */}
      <group rotation-y={BASE_YAW}>
        <FakeContactShadow
          position={[0, 0.002, 0]}
          radius={1}
          scale={[2.1, 1.05]}
          opacity={0.32}
        />
      </group>

      {/* Streaks fly along the car's travel axis. */}
      <group rotation-y={BASE_YAW}>
        <SpeedLines frozen={reducedMotion} />
      </group>
    </Canvas>
  );
}
