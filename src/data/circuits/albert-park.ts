// Albert Park Circuit — simplified lake-park loop. Layout approximated from
// public track maps (knowledge cutoff 2026-01); facts evergreen.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [18, 62], [26, 70], [38, 74], [50, 72], [60, 74], [70, 70], [80, 62],
  [84, 52], [80, 44], [72, 40], [74, 32], [66, 26], [54, 24], [44, 28],
  [36, 24], [26, 26], [18, 32], [12, 42], [12, 52],
];

export const albertPark: Circuit = {
  id: 'albert-park',
  name: 'Albert Park Circuit',
  lengthKm: 5.278,
  laps: 58,
  facts: [
    'Đường đua bán đường phố chạy quanh hồ Albert Park ở Melbourne.',
    'Nơi mở màn mùa giải 2026 — Úc trở lại vị trí chặng khai mạc.',
    'Mặt đường công cộng: phần lớn vòng đua là đường giao thông hằng ngày.',
    'Được nâng cấp năm 2021–2022 để tăng tốc độ trung bình và cơ hội vượt.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.34, 0.67),
};
