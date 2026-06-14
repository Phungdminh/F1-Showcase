// Car component explorer scene (T14, f1-3d-specialist). Self-contained R3F
// scene: props in, events out. Renders the procedural ExplorerCar, drei Html
// hotspot labels per component, an idle turntable (idle only), a select-driven
// camera glide, and a sub-part explode — all GLIDING (no teleports), all
// damped against the shared motion tokens (DUR.set / EASE.move character).
//
// Contract (PLAN §4, FROZEN): default export with the exact props below. The
// page owns `selectedId`; this scene owns hover state and fires the events.
//
// Imports allowed: src/types, src/lib/motion.ts (read-only tokens), src/three/**.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CarComponent } from '../../types';
import { DUR } from '../../lib/motion';
import { CANVAS_DPR, GL_DEFAULTS } from '../lib/canvasDefaults';
import { FirstFrameNotifier } from '../lib/firstFrameNotifier';
import { FakeContactShadow } from '../lib/FakeContactShadow';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { ExplorerCar } from './ExplorerCar';
import { getLivery, type Livery } from './liveries';

// FROZEN core — byte-compatible with the prior stub. `livery` is additive/optional:
// when omitted the car falls back to a carbon body tinted by `accentColor`.
export interface CarExplorerSceneProps {
  components: CarComponent[];
  selectedId: string | null;
  accentColor: string;
  /** Per-team paint scheme. Omit → neutral carbon body tinted by accentColor. */
  livery?: Livery;
  /** Select a component by id, or pass null to deselect (return to full car). */
  onComponentSelect: (id: string | null) => void;
  onFocusSettled?: (id: string) => void;
  onFirstFrame?: () => void;
}

// Default framing (PLAN §4): fov 40 at [3.5,1.6,4.5], target [0,0.4,0].
const DEFAULT_POS = new THREE.Vector3(3.5, 1.6, 4.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.4, 0);
// Pleasant 3/4 angle back-off applied to a focused component's hotspot.
const FOCUS_OFFSET = new THREE.Vector3(1.6, 0.9, 1.9).normalize().multiplyScalar(2.2);
const SETTLE_EPS = 0.015;
// Exponential damp reaches ~99% in ≈ 4.6 / lambda seconds. Derive the camera
// lambda from the shared DUR.set token so the glide genuinely lasts ~0.9s
// (EASE.move character — ease-in-out via the asymptotic approach), never a
// magic number.
const CAMERA_LAMBDA = 4.6 / DUR.set;
const TURNTABLE_SPEED = 0.12; // rad/s, idle only

// Which side each hotspot label flags toward, so labels spread to BOTH sides
// (and don't pile up) when the car is viewed head-on. The marker dot still sits
// on the part; only the label + leader line extends to this side.
const LABEL_SIDE: Record<string, 'left' | 'right'> = {
  'front-wing': 'right',
  'rear-wing': 'left',
  'power-unit': 'right',
  halo: 'left',
  cockpit: 'right',
  sidepods: 'left',
  'floor-diffuser': 'right',
  gearbox: 'left',
  suspension: 'right',
  brakes: 'left',
  'wheels-tires': 'right',
};

/**
 * Camera rig: glides position + orbit target from current to the framing of
 * the selected component (or back to default when none). Disables OrbitControls
 * during the glide, re-enables + fires onFocusSettled once within epsilon.
 * Reduced motion → snap instantly, still fire onFocusSettled.
 */
function CameraRig({
  selectedId,
  components,
  controlsRef,
  reduced,
  onFocusSettled,
}: {
  selectedId: string | null;
  components: CarComponent[];
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  reduced: boolean;
  onFocusSettled?: (id: string) => void;
}) {
  const camera = useThree((s) => s.camera);
  const desiredPos = useRef(DEFAULT_POS.clone());
  const desiredTarget = useRef(DEFAULT_TARGET.clone());
  const gliding = useRef(false);
  const settledFor = useRef<string | null>(null);

  // Recompute the goal whenever the selection changes.
  useEffect(() => {
    const comp = selectedId
      ? components.find((c) => c.id === selectedId)
      : undefined;
    if (comp) {
      const hotspot = new THREE.Vector3(...comp.hotspot);
      desiredTarget.current.copy(hotspot);
      desiredPos.current.copy(hotspot).add(FOCUS_OFFSET);
    } else {
      desiredPos.current.copy(DEFAULT_POS);
      desiredTarget.current.copy(DEFAULT_TARGET);
    }
    gliding.current = true;
    settledFor.current = null;
    const controls = controlsRef.current;

    if (reduced) {
      // Snap instantly under reduced motion, but still settle + notify.
      camera.position.copy(desiredPos.current);
      if (controls) {
        controls.target.copy(desiredTarget.current);
        controls.update();
        controls.enabled = true;
      }
      gliding.current = false;
      settledFor.current = selectedId;
      onFocusSettled?.(selectedId ?? '');
    } else if (controls) {
      controls.enabled = false; // lock orbit while gliding
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, reduced]);

  useFrame((_, delta) => {
    if (reduced || !gliding.current) return;
    const controls = controlsRef.current;
    const target = controls ? controls.target : desiredTarget.current;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPos.current.x, CAMERA_LAMBDA, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPos.current.y, CAMERA_LAMBDA, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPos.current.z, CAMERA_LAMBDA, delta);
    target.x = THREE.MathUtils.damp(target.x, desiredTarget.current.x, CAMERA_LAMBDA, delta);
    target.y = THREE.MathUtils.damp(target.y, desiredTarget.current.y, CAMERA_LAMBDA, delta);
    target.z = THREE.MathUtils.damp(target.z, desiredTarget.current.z, CAMERA_LAMBDA, delta);

    if (controls) controls.update();

    const posErr = camera.position.distanceTo(desiredPos.current);
    const tgtErr = target.distanceTo(desiredTarget.current);
    if (posErr < SETTLE_EPS && tgtErr < SETTLE_EPS) {
      camera.position.copy(desiredPos.current);
      if (controls) {
        controls.target.copy(desiredTarget.current);
        controls.update();
        controls.enabled = true;
      }
      gliding.current = false;
      if (settledFor.current !== selectedId) {
        settledFor.current = selectedId;
        onFocusSettled?.(selectedId ?? '');
      }
    }
  });

  return null;
}

/** Idle turntable: gentle yaw, ONLY when nothing is selected and motion is on. */
function Turntable({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (enabled) ref.current.rotation.y += TURNTABLE_SPEED * delta;
  });
  return <group ref={ref}>{children}</group>;
}

/** The in-Canvas scene contents (so hooks can use the R3F store). */
function SceneContents({
  components,
  selectedId,
  accentColor,
  livery: liveryProp,
  onComponentSelect,
  onFocusSettled,
  onFirstFrame,
}: CarExplorerSceneProps) {
  const reduced = usePrefersReducedMotion();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Stable livery (memoized so ExplorerCar's per-group materials aren't rebuilt
  // on every hover re-render). Falls back to a carbon body + accentColor.
  const livery = useMemo<Livery>(
    () => liveryProp ?? getLivery(undefined, accentColor),
    [liveryProp, accentColor],
  );

  return (
    <>
      <FirstFrameNotifier onFirstFrame={onFirstFrame} />
      <AdaptiveDpr pixelated={false} />

      {/* Bright studio lighting — hemisphere fill + key + cool rim. No shadow maps. */}
      <hemisphereLight args={['#ffffff', '#3a3f48', 0.85]} />
      <directionalLight position={[4, 6, 4]} intensity={1.15} color="#ffffff" />
      <directionalLight position={[-5, 3, -4]} intensity={0.5} color="#9fb6d4" />

      <FakeContactShadow
        position={[0, 0.001, 0]}
        radius={2.6}
        scale={[1.9, 1.1]}
        opacity={0.4}
      />

      {/* Invisible backdrop sphere — a genuine click on empty space (R3F onClick
          ignores orbit drags) deselects the focused component, returning to the
          full car. Sits far behind so the car/parts are always clicked first. */}
      <mesh
        onClick={(e) => {
          if (selectedId !== null) {
            e.stopPropagation();
            onComponentSelect(null);
          }
        }}
      >
        <sphereGeometry args={[40, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      <CameraRig
        selectedId={selectedId}
        components={components}
        controlsRef={controlsRef}
        reduced={reduced}
        onFocusSettled={onFocusSettled}
      />

      {/* Auto-spin disabled: a spinning car desyncs the fixed-position hotspot
          markers from the parts. The car stays still; the user orbits it. */}
      <Turntable enabled={false}>
        <ExplorerCar
          livery={livery}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onPointerOverPart={setHoveredId}
          onPointerOutPart={(id) =>
            setHoveredId((cur) => (cur === id ? null : cur))
          }
          onClickPart={onComponentSelect}
        />
      </Turntable>

      {/* Hotspot labels: anchored at each component.hotspot; declutter while a
          DIFFERENT component is selected. Hover/click drive the same state. */}
      {components.map((c) => {
        const isSelected = selectedId === c.id;
        // Hide ALL hotspot labels while a component is selected — the on-stage
        // detail panel names + describes it, keeping the focused view clean.
        if (selectedId !== null) return null;
        const isHovered = hoveredId === c.id;
        const side = LABEL_SIDE[c.id] ?? (c.hotspot[2] < 0 ? 'left' : 'right');
        return (
          <Html
            key={c.id}
            position={c.hotspot}
            distanceFactor={7}
            wrapperClass="car-hotspot"
            zIndexRange={[30, 0]}
            pointerEvents="auto"
          >
            <button
              type="button"
              className="car-hotspot__label"
              data-selected={isSelected || undefined}
              data-hovered={isHovered || undefined}
              onPointerOver={() => setHoveredId(c.id)}
              onPointerOut={() =>
                setHoveredId((cur) => (cur === c.id ? null : cur))
              }
              onClick={(e) => {
                e.stopPropagation();
                onComponentSelect(c.id);
              }}
              style={{
                display: 'inline-flex',
                flexDirection: side === 'left' ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 0,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: isSelected || isHovered ? livery.accent : '#f5f5f5',
                transition: 'color 0.2s ease',
                // Keep the marker dot ON the part; the label + leader extends to
                // `side` so labels split left/right and don't overlap head-on.
                transform:
                  side === 'left'
                    ? 'translate(calc(-100% + 4px), -50%)'
                    : 'translate(-4px, -50%)',
              }}
            >
              {/* Marker dot — sits exactly on the part. */}
              <span
                aria-hidden
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '9999px',
                  background: 'currentColor',
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.5)',
                  flexShrink: 0,
                }}
              />
              {/* Leader line from the dot to the label. */}
              <span
                aria-hidden
                style={{
                  width: 26,
                  height: 1,
                  background: 'currentColor',
                  opacity: 0.7,
                  flexShrink: 0,
                }}
              />
              {/* Label. */}
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                }}
              >
                {c.name}
              </span>
            </button>
          </Html>
        );
      })}

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        minDistance={2.5}
        maxDistance={7}
        minPolarAngle={0.2}
        maxPolarAngle={1.4}
        target={DEFAULT_TARGET}
      />
    </>
  );
}

export default function CarExplorerScene(props: CarExplorerSceneProps) {
  // Stable camera config; the page owns the #0F0F0F stage so the canvas is
  // transparent (alpha via GL_DEFAULTS).
  const cameraConfig = useMemo(
    () => ({
      fov: 40,
      position: [3.5, 1.6, 4.5] as [number, number, number],
      near: 0.1,
      far: 60,
    }),
    [],
  );

  return (
    <Canvas
      gl={GL_DEFAULTS}
      dpr={CANVAS_DPR}
      camera={cameraConfig}
      frameloop="always"
    >
      <SceneContents {...props} />
    </Canvas>
  );
}
