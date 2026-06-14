// Soft fake contact shadow — a radial-gradient disc on an invisible floor.
// PLAN §4 forbids realtime shadow maps; this is the sanctioned cheap stand-in.
// Generic: hero uses it under the car, track can reuse it as the ground disc.
// Cost: 1 draw call, 64 tris, one 256px canvas texture (disposed on unmount).
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export interface FakeContactShadowProps {
  position?: [number, number, number];
  /** Disc radius in world units (before the x/z footprint scale). */
  radius?: number;
  /** Non-uniform footprint, e.g. [2.1, 1.05] for a car. */
  scale?: [number, number];
  opacity?: number;
  color?: string;
}

/** White-center → black-edge radial gradient, used as alphaMap. */
function makeRadialAlphaTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgb(255,255,255)');
    gradient.addColorStop(0.35, 'rgb(150,150,150)');
    gradient.addColorStop(0.7, 'rgb(45,45,45)');
    gradient.addColorStop(1, 'rgb(0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

export function FakeContactShadow({
  position = [0, 0, 0],
  radius = 1,
  scale = [1, 1],
  opacity = 0.35,
  color = '#10141a',
}: FakeContactShadowProps) {
  const alphaMap = useMemo(makeRadialAlphaTexture, []);
  useEffect(() => () => alphaMap.dispose(), [alphaMap]);

  return (
    <mesh
      position={position}
      rotation-x={-Math.PI / 2}
      scale={[scale[0], scale[1], 1]}
    >
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial
        color={color}
        alphaMap={alphaMap}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}
