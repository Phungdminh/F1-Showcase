// Silverstone Circuit — simplified arrowhead: Copse into the Maggotts/
// Becketts esses (signature), Hangar straight to Stowe, Vale/Club return.
// Inner Village/Wellington loop intentionally simplified out.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [28, 70], [24, 58], [22, 46], [28, 36], [38, 30], [44, 32], [48, 26],
  [54, 30], [60, 24], [68, 34], [74, 46], [76, 56], [68, 66], [62, 72],
  [50, 78], [38, 76],
];

export const silverstone: Circuit = {
  id: 'silverstone',
  name: 'Silverstone Circuit',
  lengthKm: 5.891,
  laps: 52,
  facts: [
    'Nơi tổ chức Grand Prix F1 đầu tiên trong lịch sử — năm 1950.',
    'Xây trên sân bay quân sự RAF cũ thời Thế chiến II.',
    'Chuỗi Maggotts–Becketts–Chapel là tổ hợp cua tốc độ cao kinh điển nhất F1.',
    'Tải trọng ngang lên tới ~5G qua các cua nhanh.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
