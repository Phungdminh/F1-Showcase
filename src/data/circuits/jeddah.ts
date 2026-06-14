// Jeddah Corniche Circuit — ultra-fast street track: a long, slim loop along
// the Red Sea corniche with flowing kinks and tight ends. Approximated.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [22, 92], [18, 86], [22, 76], [28, 66], [34, 55], [42, 44], [50, 32],
  [60, 22], [70, 13], [78, 9], [83, 14], [76, 22], [68, 30], [60, 39],
  [52, 50], [44, 62], [38, 73], [32, 84], [28, 90],
];

export const jeddah: Circuit = {
  id: 'jeddah',
  name: 'Jeddah Corniche Circuit',
  lengthKm: 6.174,
  facts: [
    'Đường phố nhanh nhất lịch F1 — tốc độ trung bình vượt 250 km/h.',
    '27 khúc cua, nhiều nhất calendar, phần lớn là kink tốc độ cao sát tường.',
    'Chạy dọc bờ Biển Đỏ (corniche) của Jeddah, đua dưới ánh đèn đêm.',
    'Ra mắt F1 cuối mùa 2021.',
  ],
  laps: 50,
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.35, 0.68),
};
