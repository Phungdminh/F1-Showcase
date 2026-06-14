// Explorer car part catalog — T14 (f1-3d-specialist). Higher-detail procedural
// 2026-spec F1 car than the hero's, organised as ONE ENTRY PER CarComponent.id
// (11 ids, SPEC §2.4) so the scene can ghost/highlight/explode per component.
//
// Geometry convention (matches src/data/carComponents.ts):
//   car ≈ 5 units long · +x = forward (nose tip ≈ +2.5, tail ≈ −2.5)
//   +y = up, ground at y = 0, tallest point ≈ 1.05 · z = right side
//   front axle x = +1.7, rear axle x = −1.7, track ±0.78.
//
// Budget share: 65 meshes (= 65 draw calls), < 6k tris total.
import * as THREE from 'three';

export type ExplorerGeometryKind = 'box' | 'cyl' | 'nose' | 'halo' | 'wheel';

export type MaterialRole =
  | 'carbon' // flat-shaded body shells
  | 'matte' // wings / mechanical dark
  | 'dark' // inlets, floor edges, ducts (near-black)
  | 'accent' // team accent (prop-driven, never hardcoded)
  | 'tire'
  | 'rim';

export interface PartSpec {
  geo: ExplorerGeometryKind;
  role: MaterialRole;
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

const HALF_PI = Math.PI / 2;

/** Unit geometries shared by every part (scaled per instance). Caller disposes. */
export function createExplorerGeometries(): Record<
  ExplorerGeometryKind,
  THREE.BufferGeometry
> {
  return {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
    // Tapered cone (nose / engine spine / tail), small end at local +y.
    nose: new THREE.CylinderGeometry(0.05, 0.16, 1, 10),
    halo: new THREE.TorusGeometry(0.3, 0.032, 8, 18, Math.PI),
    wheel: new THREE.CylinderGeometry(1, 1, 1, 28),
  };
}

/** Base PBR params per role; `accent` color is injected from props at runtime. */
export const ROLE_DEFS: Record<
  Exclude<MaterialRole, 'accent'>,
  THREE.MeshStandardMaterialParameters
> = {
  carbon: { color: '#23262c', roughness: 0.45, metalness: 0.3, flatShading: true },
  matte: { color: '#15181d', roughness: 0.62, metalness: 0.18 },
  dark: { color: '#0e1013', roughness: 0.72, metalness: 0.1 },
  tire: { color: '#121315', roughness: 0.95, metalness: 0 },
  rim: { color: '#4a5057', roughness: 0.28, metalness: 0.75 },
};

export const ACCENT_ROLE_DEF: Omit<THREE.MeshStandardMaterialParameters, 'color'> =
  { roughness: 0.35, metalness: 0.4 };

// Wheel layout shared by wheels-tires + brakes + suspension.
const FRONT_X = 1.7;
const REAR_X = -1.7;
const TRACK_Z = 0.78;
const FRONT_R = 0.33;
const FRONT_W = 0.26;
const REAR_R = 0.35;
const REAR_W = 0.3;

function wheelPair(
  x: number,
  z: number,
  r: number,
  w: number,
): PartSpec[] {
  return [
    {
      geo: 'wheel', role: 'tire',
      position: [x, r, z], rotation: [HALF_PI, 0, 0], scale: [r, w, r],
    },
    {
      geo: 'wheel', role: 'rim',
      position: [x, r, z], rotation: [HALF_PI, 0, 0],
      scale: [r * 0.55, w * 1.06, r * 0.55],
    },
  ];
}

/** Static part layout per CarComponent.id — group names ARE component ids. */
export const CAR_PARTS: Record<string, PartSpec[]> = {
  cockpit: [
    { geo: 'box', role: 'carbon', position: [0.55, 0.42, 0], scale: [1.5, 0.34, 0.62] },
    { geo: 'box', role: 'carbon', position: [0.5, 0.64, 0.27], scale: [1.0, 0.12, 0.1] },
    { geo: 'box', role: 'carbon', position: [0.5, 0.64, -0.27], scale: [1.0, 0.12, 0.1] },
    // Nose cone — tip lands at x ≈ +2.5.
    { geo: 'nose', role: 'carbon', position: [1.85, 0.46, 0], rotation: [0, 0, -HALF_PI], scale: [2.0, 1.3, 1.6] },
    { geo: 'box', role: 'carbon', position: [1.32, 0.54, 0], scale: [0.5, 0.12, 0.32] },
    { geo: 'box', role: 'dark', position: [1.02, 0.66, 0], scale: [0.16, 0.12, 0.38] },
    { geo: 'box', role: 'carbon', position: [0.16, 0.66, 0], scale: [0.4, 0.14, 0.46] },
  ],
  halo: [
    { geo: 'halo', role: 'carbon', position: [0.62, 0.74, 0], rotation: [0, HALF_PI, 0], scale: [0.95, 0.95, 0.95] },
    { geo: 'cyl', role: 'carbon', position: [0.92, 0.6, 0], rotation: [0, 0, 0.5], scale: [0.03, 0.42, 0.03] },
    { geo: 'box', role: 'carbon', position: [0.3, 0.72, 0.22], scale: [0.14, 0.08, 0.06] },
    { geo: 'box', role: 'carbon', position: [0.3, 0.72, -0.22], scale: [0.14, 0.08, 0.06] },
  ],
  'power-unit': [
    { geo: 'box', role: 'carbon', position: [-0.18, 0.84, 0], scale: [0.4, 0.24, 0.28] },
    { geo: 'box', role: 'dark', position: [0.04, 0.84, 0], scale: [0.1, 0.16, 0.2] },
    // Engine-cover spine tapering to the tail.
    { geo: 'nose', role: 'carbon', position: [-1.0, 0.6, 0], rotation: [0, 0, HALF_PI], scale: [2.4, 1.7, 1.5] },
    { geo: 'box', role: 'matte', position: [-0.7, 0.4, 0], scale: [0.85, 0.3, 0.5] },
    { geo: 'cyl', role: 'rim', position: [-1.98, 0.52, 0], rotation: [0, 0, HALF_PI], scale: [0.05, 0.22, 0.05] },
  ],
  sidepods: [
    { geo: 'box', role: 'carbon', position: [-0.2, 0.38, 0.56], rotation: [0, -0.05, 0], scale: [1.7, 0.32, 0.4] },
    { geo: 'box', role: 'carbon', position: [-0.2, 0.38, -0.56], rotation: [0, 0.05, 0], scale: [1.7, 0.32, 0.4] },
    { geo: 'box', role: 'dark', position: [0.66, 0.42, 0.56], scale: [0.12, 0.24, 0.34] },
    { geo: 'box', role: 'dark', position: [0.66, 0.42, -0.56], scale: [0.12, 0.24, 0.34] },
    { geo: 'box', role: 'accent', position: [-0.2, 0.555, 0.6], scale: [1.55, 0.018, 0.07] },
    { geo: 'box', role: 'accent', position: [-0.2, 0.555, -0.6], scale: [1.55, 0.018, 0.07] },
  ],
  'front-wing': [
    { geo: 'box', role: 'matte', position: [2.3, 0.1, 0], scale: [0.6, 0.045, 1.7] },
    { geo: 'box', role: 'matte', position: [2.18, 0.18, 0], rotation: [0, 0, 0.16], scale: [0.42, 0.03, 1.55] },
    // 2026 active flap — accent so X/Z-mode element reads.
    { geo: 'box', role: 'accent', position: [2.07, 0.25, 0], rotation: [0, 0, 0.24], scale: [0.3, 0.025, 1.4] },
    { geo: 'box', role: 'carbon', position: [2.3, 0.17, 0.86], scale: [0.6, 0.22, 0.04] },
    { geo: 'box', role: 'carbon', position: [2.3, 0.17, -0.86], scale: [0.6, 0.22, 0.04] },
    { geo: 'box', role: 'matte', position: [2.3, 0.26, 0], scale: [0.12, 0.22, 0.18] },
  ],
  'rear-wing': [
    { geo: 'box', role: 'matte', position: [-2.12, 0.86, 0], rotation: [0, 0, -0.12], scale: [0.46, 0.05, 1.3] },
    // 2026 active upper flap (no DRS pod).
    { geo: 'box', role: 'accent', position: [-2.24, 0.97, 0], rotation: [0, 0, -0.22], scale: [0.3, 0.03, 1.22] },
    { geo: 'box', role: 'matte', position: [-2.16, 0.56, 0], scale: [0.32, 0.04, 1.05] },
    { geo: 'box', role: 'carbon', position: [-2.12, 0.72, 0.67], scale: [0.68, 0.52, 0.04] },
    { geo: 'box', role: 'carbon', position: [-2.12, 0.72, -0.67], scale: [0.68, 0.52, 0.04] },
    { geo: 'box', role: 'matte', position: [-1.95, 0.7, 0], scale: [0.07, 0.4, 0.08] },
  ],
  'floor-diffuser': [
    { geo: 'box', role: 'matte', position: [-0.15, 0.08, 0], scale: [3.5, 0.06, 1.05] },
    { geo: 'box', role: 'dark', position: [-0.15, 0.11, 0.58], scale: [2.3, 0.025, 0.12] },
    { geo: 'box', role: 'dark', position: [-0.15, 0.11, -0.58], scale: [2.3, 0.025, 0.12] },
    { geo: 'box', role: 'matte', position: [-2.05, 0.18, 0], rotation: [0, 0, 0.2], scale: [0.6, 0.16, 0.85] },
    { geo: 'box', role: 'dark', position: [-2.08, 0.22, 0.2], rotation: [0, 0, 0.2], scale: [0.5, 0.14, 0.02] },
    { geo: 'box', role: 'dark', position: [-2.08, 0.22, -0.2], rotation: [0, 0, 0.2], scale: [0.5, 0.14, 0.02] },
  ],
  gearbox: [
    { geo: 'box', role: 'matte', position: [-1.5, 0.38, 0], scale: [0.55, 0.3, 0.34] },
    { geo: 'nose', role: 'matte', position: [-2.1, 0.4, 0], rotation: [0, 0, HALF_PI], scale: [1.4, 0.6, 1.1] },
    { geo: 'box', role: 'accent', position: [-2.3, 0.46, 0], scale: [0.04, 0.12, 0.07] },
  ],
  suspension: [
    { geo: 'box', role: 'matte', position: [1.66, 0.5, 0.42], rotation: [0, -0.12, 0], scale: [0.05, 0.025, 0.65] },
    { geo: 'box', role: 'matte', position: [1.66, 0.5, -0.42], rotation: [0, 0.12, 0], scale: [0.05, 0.025, 0.65] },
    { geo: 'box', role: 'matte', position: [1.72, 0.26, 0.42], rotation: [0, 0.1, 0], scale: [0.06, 0.03, 0.65] },
    { geo: 'box', role: 'matte', position: [1.72, 0.26, -0.42], rotation: [0, -0.1, 0], scale: [0.06, 0.03, 0.65] },
    { geo: 'cyl', role: 'matte', position: [1.68, 0.4, 0.4], rotation: [-0.95, 0, 0], scale: [0.02, 0.55, 0.02] },
    { geo: 'cyl', role: 'matte', position: [1.68, 0.4, -0.4], rotation: [0.95, 0, 0], scale: [0.02, 0.55, 0.02] },
    { geo: 'box', role: 'matte', position: [-1.62, 0.48, 0.42], scale: [0.05, 0.025, 0.6] },
    { geo: 'box', role: 'matte', position: [-1.62, 0.48, -0.42], scale: [0.05, 0.025, 0.6] },
    { geo: 'box', role: 'matte', position: [-1.72, 0.26, 0.42], scale: [0.06, 0.03, 0.6] },
    { geo: 'box', role: 'matte', position: [-1.72, 0.26, -0.42], scale: [0.06, 0.03, 0.6] },
  ],
  brakes: [
    { geo: 'box', role: 'dark', position: [FRONT_X, FRONT_R, 0.56], scale: [0.24, 0.2, 0.1] },
    { geo: 'box', role: 'dark', position: [FRONT_X, FRONT_R, -0.56], scale: [0.24, 0.2, 0.1] },
    { geo: 'box', role: 'dark', position: [REAR_X, REAR_R, 0.54], scale: [0.26, 0.22, 0.1] },
    { geo: 'box', role: 'dark', position: [REAR_X, REAR_R, -0.54], scale: [0.26, 0.22, 0.1] },
  ],
  'wheels-tires': [
    ...wheelPair(FRONT_X, TRACK_Z, FRONT_R, FRONT_W),
    ...wheelPair(FRONT_X, -TRACK_Z, FRONT_R, FRONT_W),
    ...wheelPair(REAR_X, TRACK_Z, REAR_R, REAR_W),
    ...wheelPair(REAR_X, -TRACK_Z, REAR_R, REAR_W),
  ],
};
