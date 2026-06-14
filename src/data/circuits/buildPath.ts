// Shared centerline builder for circuit seeds — f1-data-engineer (T2).
// Each circuit file declares 15–30 hand-placed control vertices (track-map
// convention: x → east, y → south/down, arbitrary units) capturing the
// recognizable simplified layout. `buildPath` runs a closed Catmull-Rom
// spline through them and resamples to SAMPLES points normalized into the
// unit box [0,1]² (aspect ratio preserved, 5% margin).
//
// Conventions guaranteed to consumers (TrackScene / 2D SVG fallback):
// - exactly SAMPLES points, loop is implicit (close with curve `closed: true`
//   or an SVG `Z`); the last point is NOT a duplicate of the first;
// - point index 0 is exactly the first control vertex → every circuit places
//   its start/finish line on control 0, so `startFinishIndex = 0`;
// - `sectorIndices(f1, f2)` converts lap fractions into pathPoints indices.

export const SAMPLES = 128;

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

export function buildPath(controls: [number, number][], samples: number = SAMPLES): [number, number][] {
  const n = controls.length;
  const raw: [number, number][] = [];
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * n;
    const seg = Math.floor(t) % n;
    const u = t - Math.floor(t);
    const p0 = controls[(seg - 1 + n) % n];
    const p1 = controls[seg];
    const p2 = controls[(seg + 1) % n];
    const p3 = controls[(seg + 2) % n];
    raw.push([
      catmullRom(p0[0], p1[0], p2[0], p3[0], u),
      catmullRom(p0[1], p1[1], p2[1], p3[1], u),
    ]);
  }

  // Normalize into [0,1]² with uniform scale (no distortion) and 5% margin.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of raw) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  const margin = 0.05;
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const scale = (1 - 2 * margin) / span;
  const offX = (1 - (maxX - minX) * scale) / 2;
  const offY = (1 - (maxY - minY) * scale) / 2;
  return raw.map(([x, y]): [number, number] => [
    Number((offX + (x - minX) * scale).toFixed(4)),
    Number((offY + (y - minY) * scale).toFixed(4)),
  ]);
}

/** Lap fractions → pathPoints indices for Circuit.sectorBreaks. */
export function sectorIndices(f1: number, f2: number, samples: number = SAMPLES): [number, number] {
  const clamp = (f: number) => Math.min(samples - 1, Math.max(0, Math.round(f * samples)));
  return [clamp(f1), clamp(f2)];
}
