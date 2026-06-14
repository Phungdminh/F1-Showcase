// Circuit de Monaco — signature features kept: climb to Casino, Fairmont
// hairpin notch, tunnel arc along the sea, harbour chicane, Piscine wiggle,
// Rascasse. Approximated from public maps.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [22, 56], [34, 53], [44, 50], [50, 42], [56, 33], [63, 27], [70, 30],
  [70, 37], [66, 40], [60, 46], [54, 48], [58, 54], [66, 58], [76, 60],
  [84, 64], [78, 72], [74, 70], [64, 74], [56, 72], [50, 76], [44, 72],
  [38, 76], [28, 78], [24, 72], [26, 64],
];

export const monaco: Circuit = {
  id: 'monaco',
  name: 'Circuit de Monaco',
  lengthKm: 3.337,
  laps: 78,
  facts: [
    'Vòng đua ngắn nhất, chậm nhất và hẹp nhất của F1 — tổ chức từ 1929.',
    'Đoạn leo dốc lên Casino rồi đổ xuống hairpin Fairmont — cua chậm nhất F1 (~48 km/h).',
    'Đường hầm ven biển là đoạn có mái che duy nhất mà F1 chạy hết tốc lực.',
    'Một phần của "Triple Crown" danh giá cùng Indy 500 và Le Mans 24h.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.32, 0.62),
};
