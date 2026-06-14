// Madring (Madrid) — NEW for 2026, semi-street circuit around the IFEMA
// fairgrounds. LAYOUT UNVERIFIED: stylized from pre-season official renders
// (22 corners, ~24° banked "La Monumental" carousel near the lap's end);
// could not be re-checked live in this build environment.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [24, 66], [40, 66], [54, 64], [63, 58], [59, 50], [65, 44], [57, 38],
  [47, 42], [39, 34], [29, 30], [21, 36], [15, 44], [11, 54], [17, 62],
];

export const madring: Circuit = {
  id: 'madring',
  name: 'Madring',
  lengthKm: 5.474, // announced figure — UNVERIFIED final homologation
  laps: 57, // UNVERIFIED — derived from announced length vs ~305 km race distance
  facts: [
    'Đường đua MỚI của mùa 2026, chạy quanh khu hội chợ IFEMA ở Madrid.',
    'Khúc cua nghiêng "La Monumental" với độ nghiêng ~24° — lớn nhất F1 hiện đại.',
    'Kết hợp đường phố và đoạn xây mới; dài 5,474 km với 22 khúc cua (số liệu công bố).',
    'Lần đầu Madrid tổ chức F1 kể từ Jarama 1981.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
