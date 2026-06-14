// Procedural 2026-spec F1 car for the component explorer — one named <group>
// per CarComponent.id (11 groups), each built from its PartSpec list in
// explorerCarSpec.ts (CAR_PARTS). The scene drives interaction state in via
// props; this component renders + reacts (ghost / highlight / explode) only.
//
// CRITICAL material handling: every group owns a FRESH CLONE of its parts'
// materials (never shared across groups), so opacity (ghost) and emissive
// (highlight) can be set per component without bleeding into neighbours.
//
// Budget: 65 catalog meshes + ≤3 sub-part proxies (selected component only)
// = well under the ≤120 draw-call / ≤150k-tri envelope (PLAN §4).
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { disposeAll, disposeMaterial } from '../lib/disposeHelpers';
import {
  ACCENT_ROLE_DEF,
  CAR_PARTS,
  ROLE_DEFS,
  createExplorerGeometries,
  type ExplorerGeometryKind,
  type MaterialRole,
  type PartSpec,
} from './explorerCarSpec';
import type { Livery } from './liveries';

export interface ExplorerCarProps {
  /** Per-team livery — paints body/wing/accent/trim roles; accent also feeds highlight. */
  livery: Livery;
  /** Currently focused component id (page-owned), or null = nothing selected. */
  selectedId: string | null;
  /** Hover-highlighted component id (scene-owned), or null. */
  hoveredId: string | null;
  onPointerOverPart: (id: string) => void;
  onPointerOutPart: (id: string) => void;
  onClickPart: (id: string) => void;
}

const GHOST_OPACITY = 0.12;
const HIGHLIGHT_EMISSIVE = 0.4;

/**
 * Build a base material for a role, painted by the team livery:
 *   carbon → body · matte → wing · accent → accent · rim → trim.
 * 'dark' (ducts/inlets) and 'tire' keep their fixed near-black ROLE_DEFS so the
 * livery reads as paint on bodywork, not a flat repaint of every surface.
 */
function makeRoleMaterial(
  role: MaterialRole,
  livery: Livery,
): THREE.MeshStandardMaterial {
  switch (role) {
    case 'accent':
      return new THREE.MeshStandardMaterial({ color: livery.accent, ...ACCENT_ROLE_DEF });
    case 'carbon':
      // Low metalness so the team colour reads as a vivid paint, not dark metal.
      return new THREE.MeshStandardMaterial({
        ...ROLE_DEFS.carbon,
        color: livery.body,
        metalness: 0.1,
        roughness: 0.5,
      });
    case 'matte':
      return new THREE.MeshStandardMaterial({
        ...ROLE_DEFS.matte,
        color: livery.wing,
        metalness: 0.08,
        roughness: 0.6,
      });
    case 'rim':
      return new THREE.MeshStandardMaterial({ ...ROLE_DEFS.rim, color: livery.trim });
    default:
      return new THREE.MeshStandardMaterial(ROLE_DEFS[role]);
  }
}

interface GroupMeshDef {
  spec: PartSpec;
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
}

interface GroupRenderState {
  ghosted: boolean;
  highlighted: boolean;
}

/**
 * Apply ghost (dim non-selected) + highlight (accent emissive on hovered)
 * to one group's cloned materials. Mutates in place — cheap, runs in render.
 */
function applyGroupState(
  materials: THREE.MeshStandardMaterial[],
  { ghosted, highlighted }: GroupRenderState,
  accent: THREE.Color,
): void {
  for (const mat of materials) {
    if (ghosted) {
      mat.transparent = true;
      mat.opacity = GHOST_OPACITY;
      mat.depthWrite = false;
      mat.emissive.setRGB(0, 0, 0);
      mat.emissiveIntensity = 0;
    } else {
      mat.transparent = false;
      mat.opacity = 1;
      mat.depthWrite = true;
      if (highlighted) {
        mat.emissive.copy(accent);
        mat.emissiveIntensity = HIGHLIGHT_EMISSIVE;
      } else {
        mat.emissive.setRGB(0, 0, 0);
        mat.emissiveIntensity = 0;
      }
    }
    mat.needsUpdate = true;
  }
}

/** Renders the catalog meshes of a single component group + its render state. */
function ComponentGroup({
  componentId,
  meshes,
  materials,
  ghosted,
  highlighted,
  accent,
  onOver,
  onOut,
  onClick,
}: {
  componentId: string;
  meshes: GroupMeshDef[];
  materials: THREE.MeshStandardMaterial[];
  ghosted: boolean;
  highlighted: boolean;
  accent: THREE.Color;
  onOver: (id: string) => void;
  onOut: (id: string) => void;
  onClick: (id: string) => void;
}) {
  // Drive ghost/highlight on the cloned materials each render (state is small).
  applyGroupState(materials, { ghosted, highlighted }, accent);

  return (
    <group
      name={componentId}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        onOver(componentId);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        onOut(componentId);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(componentId);
      }}
    >
      {meshes.map((m, i) => (
        <mesh
          key={i}
          geometry={m.geometry}
          material={m.material}
          position={m.spec.position}
          scale={m.spec.scale ?? [1, 1, 1]}
          rotation={m.spec.rotation ?? [0, 0, 0]}
        />
      ))}
    </group>
  );
}

export function ExplorerCar({
  livery,
  selectedId,
  hoveredId,
  onPointerOverPart,
  onPointerOutPart,
  onClickPart,
}: ExplorerCarProps) {
  const accentColor = livery.accent;
  // Shared unit geometries (scaled per instance). Disposed on unmount.
  const geometries = useMemo(
    () => createExplorerGeometries(),
    [],
  );
  useEffect(
    () => () => disposeAll(...Object.values(geometries)),
    [geometries],
  );

  // Per-component FRESH material clones (one set per group) so ghost/highlight
  // never bleed between components. Rebuilt only when accentColor changes.
  const groups = useMemo(() => {
    const built = new Map<
      string,
      { meshes: GroupMeshDef[]; materials: THREE.MeshStandardMaterial[] }
    >();
    for (const id of Object.keys(CAR_PARTS)) {
      const specs = CAR_PARTS[id];
      // One material instance per *role* used inside this group (cloned fresh),
      // shared by that group's meshes of the same role — still isolated from
      // every other group.
      const roleMats = new Map<MaterialRole, THREE.MeshStandardMaterial>();
      const meshes: GroupMeshDef[] = specs.map((spec) => {
        let mat = roleMats.get(spec.role);
        if (!mat) {
          mat = makeRoleMaterial(spec.role, livery);
          roleMats.set(spec.role, mat);
        }
        return {
          spec,
          geometry: geometries[spec.geo as ExplorerGeometryKind],
          material: mat,
        };
      });
      built.set(id, { meshes, materials: Array.from(roleMats.values()) });
    }
    return built;
  }, [geometries, livery]);

  // Dispose all per-group material clones when the set is rebuilt / unmounted.
  useEffect(() => {
    const current = groups;
    return () => {
      for (const { materials } of current.values()) {
        for (const mat of materials) disposeMaterial(mat);
      }
    };
  }, [groups]);

  // Never leave a stuck pointer cursor if we unmount mid-hover.
  useEffect(() => () => {
    document.body.style.cursor = 'auto';
  }, []);

  const accentColorObj = useMemo(
    () => new THREE.Color(accentColor),
    [accentColor],
  );

  const hasSelection = selectedId !== null;

  return (
    <group>
      {Array.from(groups.entries()).map(([id, { meshes, materials }]) => {
        const ghosted = hasSelection && id !== selectedId;
        const highlighted = !ghosted && hoveredId === id;
        return (
          <ComponentGroup
            key={id}
            componentId={id}
            meshes={meshes}
            materials={materials}
            ghosted={ghosted}
            highlighted={highlighted}
            accent={accentColorObj}
            onOver={onPointerOverPart}
            onOut={onPointerOutPart}
            onClick={onClickPart}
          />
        );
      })}
    </group>
  );
}

export default ExplorerCar;
