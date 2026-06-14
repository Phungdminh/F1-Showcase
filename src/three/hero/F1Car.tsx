// Stylized procedural low-poly F1 car (2026 vibe: clean nose, big front wing,
// halo, rear wing) built purely from primitives — no external model.
// Budget share: ~35 meshes (= draw calls), < 2k tris.
// Colors arrive via props with neutral defaults (landing stays team-neutral;
// never hardcode team hexes — DESIGN §0).
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { disposeAll } from '../lib/disposeHelpers';

export interface F1CarProps {
  /** Carbon-dark body color. */
  bodyColor?: string;
  /** Restrained neutral accent (stripes, rain light). */
  accentColor?: string;
}

interface PartProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

function Part({ geometry, material, position, scale, rotation }: PartProps) {
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}

interface WheelProps {
  x: number;
  z: number;
  radius: number;
  width: number;
  wheelGeometry: THREE.BufferGeometry;
  tire: THREE.Material;
  rim: THREE.Material;
}

function Wheel({ x, z, radius, width, wheelGeometry, tire, rim }: WheelProps) {
  return (
    <group position={[x, radius, z]}>
      <mesh
        geometry={wheelGeometry}
        material={tire}
        rotation-x={Math.PI / 2}
        scale={[radius, width, radius]}
      />
      {/* Rim disc: marginally wider than the tire so its caps read as faces. */}
      <mesh
        geometry={wheelGeometry}
        material={rim}
        rotation-x={Math.PI / 2}
        scale={[radius * 0.56, width * 1.04, radius * 0.56]}
      />
    </group>
  );
}

// Car axis: nose +X, tail −X, width along Z, ground at y = 0.
// Footprint ≈ 3.0 long × 1.0 wide; tallest point (halo apex) ≈ 0.74.
export function F1Car({
  bodyColor = '#21242a',
  accentColor = '#c9ced4',
}: F1CarProps) {
  const geoms = useMemo(
    () => ({
      box: new THREE.BoxGeometry(1, 1, 1),
      wheel: new THREE.CylinderGeometry(1, 1, 1, 24),
      // Tapered cone (nose / engine-cover spine), 6 segments = faceted look.
      taper: new THREE.CylinderGeometry(0.05, 0.16, 1, 6),
      pillar: new THREE.CylinderGeometry(1, 1, 1, 8),
      halo: new THREE.TorusGeometry(0.18, 0.024, 6, 14, Math.PI),
    }),
    [],
  );

  const mats = useMemo(
    () => ({
      carbon: new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.45,
        metalness: 0.25,
        flatShading: true,
      }),
      matte: new THREE.MeshStandardMaterial({
        color: '#15181d',
        roughness: 0.6,
        metalness: 0.2,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.35,
        metalness: 0.45,
      }),
      tire: new THREE.MeshStandardMaterial({ color: '#121315', roughness: 0.95 }),
      rim: new THREE.MeshStandardMaterial({
        color: '#4a5057',
        roughness: 0.3,
        metalness: 0.7,
      }),
    }),
    [bodyColor, accentColor],
  );

  useEffect(() => () => disposeAll(...Object.values(geoms)), [geoms]);
  useEffect(() => () => disposeAll(...Object.values(mats)), [mats]);

  const { box, wheel, taper, pillar, halo } = geoms;

  return (
    <group>
      {/* Floor plank */}
      <Part geometry={box} material={mats.matte} position={[-0.05, 0.065, 0]} scale={[2.45, 0.05, 0.62]} />
      {/* Monocoque tub + cockpit sides */}
      <Part geometry={box} material={mats.carbon} position={[0.3, 0.28, 0]} scale={[1.35, 0.2, 0.4]} />
      <Part geometry={box} material={mats.carbon} position={[0.05, 0.44, 0]} scale={[0.75, 0.16, 0.34]} />
      {/* Clean tapered nose (tip at +X) + accent stripe on top */}
      <Part geometry={taper} material={mats.carbon} position={[1.0, 0.32, 0]} scale={[0.8, 1.05, 1.1]} rotation={[0, 0, -Math.PI / 2]} />
      <Part geometry={box} material={mats.accent} position={[0.95, 0.425, 0]} scale={[0.85, 0.012, 0.09]} />
      {/* Big front wing: main plane, flap, endplates, nose pylon */}
      <Part geometry={box} material={mats.matte} position={[1.42, 0.09, 0]} scale={[0.42, 0.03, 1.0]} />
      <Part geometry={box} material={mats.matte} position={[1.32, 0.16, 0]} scale={[0.3, 0.025, 0.92]} rotation={[0, 0, 0.18]} />
      <Part geometry={box} material={mats.carbon} position={[1.42, 0.13, 0.5]} scale={[0.42, 0.14, 0.025]} />
      <Part geometry={box} material={mats.carbon} position={[1.42, 0.13, -0.5]} scale={[0.42, 0.14, 0.025]} />
      <Part geometry={box} material={mats.matte} position={[1.38, 0.2, 0]} scale={[0.06, 0.14, 0.1]} />
      {/* Halo arch over the cockpit + leaning front pillar */}
      <Part geometry={halo} material={mats.carbon} position={[0.28, 0.56, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Part geometry={pillar} material={mats.carbon} position={[0.42, 0.61, 0]} scale={[0.022, 0.3, 0.022]} rotation={[0, 0, 0.6]} />
      {/* Airbox + engine-cover spine tapering to the tail */}
      <Part geometry={box} material={mats.carbon} position={[-0.1, 0.6, 0]} scale={[0.28, 0.18, 0.2]} />
      <Part geometry={taper} material={mats.carbon} position={[-0.75, 0.5, 0]} scale={[1.4, 1.05, 0.9]} rotation={[0, 0, Math.PI / 2]} />
      {/* Sidepods + accent strakes */}
      <Part geometry={box} material={mats.carbon} position={[-0.4, 0.32, 0.34]} scale={[1.05, 0.24, 0.26]} rotation={[0, -0.06, 0]} />
      <Part geometry={box} material={mats.carbon} position={[-0.4, 0.32, -0.34]} scale={[1.05, 0.24, 0.26]} rotation={[0, 0.06, 0]} />
      <Part geometry={box} material={mats.accent} position={[-0.4, 0.445, 0.36]} scale={[1.0, 0.015, 0.05]} />
      <Part geometry={box} material={mats.accent} position={[-0.4, 0.445, -0.36]} scale={[1.0, 0.015, 0.05]} />
      {/* Rear wing: main plane (slight AoA), beam wing, endplates, swan-neck */}
      <Part geometry={box} material={mats.matte} position={[-1.3, 0.66, 0]} scale={[0.32, 0.035, 0.88]} rotation={[0, 0, -0.1]} />
      <Part geometry={box} material={mats.matte} position={[-1.34, 0.42, 0]} scale={[0.26, 0.03, 0.82]} />
      <Part geometry={box} material={mats.carbon} position={[-1.3, 0.52, 0.45]} scale={[0.46, 0.34, 0.025]} />
      <Part geometry={box} material={mats.carbon} position={[-1.3, 0.52, -0.45]} scale={[0.46, 0.34, 0.025]} />
      <Part geometry={box} material={mats.matte} position={[-1.22, 0.52, 0]} scale={[0.05, 0.28, 0.06]} />
      {/* Diffuser block + rain-light accent */}
      <Part geometry={box} material={mats.matte} position={[-1.28, 0.14, 0]} scale={[0.32, 0.1, 0.46]} />
      <Part geometry={box} material={mats.accent} position={[-1.43, 0.42, 0]} scale={[0.04, 0.06, 0.16]} />
      {/* Suspension arms */}
      <Part geometry={box} material={mats.matte} position={[0.95, 0.3, 0.23]} scale={[0.04, 0.025, 0.5]} rotation={[0, -0.15, 0]} />
      <Part geometry={box} material={mats.matte} position={[0.95, 0.3, -0.23]} scale={[0.04, 0.025, 0.5]} rotation={[0, 0.15, 0]} />
      <Part geometry={box} material={mats.matte} position={[-0.95, 0.3, 0.25]} scale={[0.04, 0.025, 0.45]} />
      <Part geometry={box} material={mats.matte} position={[-0.95, 0.3, -0.25]} scale={[0.04, 0.025, 0.45]} />
      {/* Wheels: front axle x = 0.95, rear axle x = −0.95, track ±0.46 */}
      <Wheel x={0.95} z={0.46} radius={0.2} width={0.15} wheelGeometry={wheel} tire={mats.tire} rim={mats.rim} />
      <Wheel x={0.95} z={-0.46} radius={0.2} width={0.15} wheelGeometry={wheel} tire={mats.tire} rim={mats.rim} />
      <Wheel x={-0.95} z={0.46} radius={0.22} width={0.19} wheelGeometry={wheel} tire={mats.tire} rim={mats.rim} />
      <Wheel x={-0.95} z={-0.46} radius={0.22} width={0.19} wheelGeometry={wheel} tire={mats.tire} rim={mats.rim} />
    </group>
  );
}
