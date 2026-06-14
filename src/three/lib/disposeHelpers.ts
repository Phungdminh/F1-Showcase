// Generic GPU-resource disposal helpers — R3F auto-disposes JSX-declared
// resources, but anything created manually (useMemo geometries/materials/
// textures) must be released on unmount. Shared by hero/car/track scenes.
import type { Material, Object3D, Texture } from 'three';

function isTexture(value: unknown): value is Texture {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Texture).isTexture === true
  );
}

/** Dispose a material plus every texture hanging off it (map, normalMap, …). */
export function disposeMaterial(material: Material): void {
  for (const value of Object.values(material)) {
    if (isTexture(value)) value.dispose();
  }
  material.dispose();
}

interface MeshLike extends Object3D {
  geometry?: { dispose(): void };
  material?: Material | Material[];
}

/** Recursively dispose every geometry/material/texture under `root`. */
export function disposeObject3D(root: Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as MeshLike;
    mesh.geometry?.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach(disposeMaterial);
    else if (mesh.material) disposeMaterial(mesh.material);
  });
}

/** Dispose a flat list of disposables — handy in useEffect cleanups. */
export function disposeAll(
  ...resources: Array<{ dispose(): void } | null | undefined>
): void {
  for (const resource of resources) resource?.dispose();
}
