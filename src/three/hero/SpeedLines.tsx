// Faint speed-line particles streaking past the car (PLAN §4): one instanced
// mesh of thin light-gray boxes = 1 draw call, ~340 tris. Frozen (static
// scatter, no per-frame work) when `frozen` is true (reduced motion).
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { disposeAll } from '../lib/disposeHelpers';

const COUNT = 28;
const X_MIN = -4.6;
const X_MAX = 4.4;
const WRAP = X_MAX - X_MIN;

interface LineSeed {
  x: number;
  y: number;
  z: number;
  len: number;
  speed: number;
}

/** Deterministic PRNG so the static (reduced-motion) scatter is stable. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS: readonly LineSeed[] = (() => {
  const rand = mulberry32(2026);
  return Array.from({ length: COUNT }, () => {
    const z = -2.3 + rand() * 3.8;
    // Keep low lines clear of the car footprint; lines near center go high.
    const y = Math.abs(z) < 0.7 ? 1.05 + rand() * 0.7 : 0.12 + rand() * 1.5;
    return {
      x: X_MIN + rand() * WRAP,
      y,
      z,
      len: 0.5 + rand() * 1.1,
      speed: 2.8 + rand() * 3.4,
    };
  });
})();

export interface SpeedLinesProps {
  /** Reduced motion: render the initial scatter and never update. */
  frozen: boolean;
}

export function SpeedLines({ frozen }: SpeedLinesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // Per-instance mutable x, kept off the module-level seeds (strict-mode safe).
  const xsRef = useRef<number[]>(SEEDS.map((seed) => seed.x));

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 0.016, 0.016), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ccd3d8',
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => () => disposeAll(geometry, material), [geometry, material]);

  const writeMatrices = useCallback(
    (mesh: THREE.InstancedMesh) => {
      SEEDS.forEach((seed, i) => {
        dummy.position.set(xsRef.current[i], seed.y, seed.z);
        dummy.scale.set(seed.len, 1, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
    [dummy],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    writeMatrices(mesh);
  }, [writeMatrices]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (frozen || !mesh) return;
    const dt = Math.min(delta, 0.1);
    SEEDS.forEach((seed, i) => {
      let x = xsRef.current[i] - seed.speed * dt;
      if (x < X_MIN) x += WRAP;
      xsRef.current[i] = x;
    });
    writeMatrices(mesh);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, COUNT]}
      frustumCulled={false}
    />
  );
}
