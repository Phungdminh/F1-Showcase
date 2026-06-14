// Miami International Autodrome — campus loop around Hard Rock Stadium with
// the tight T11–T16 squiggle and a long back straight. Approximated.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [22, 36], [38, 32], [54, 30], [66, 34], [72, 42], [66, 50], [56, 52],
  [48, 58], [52, 64], [60, 66], [68, 72], [62, 80], [48, 82], [34, 80],
  [26, 84], [18, 78], [22, 70], [14, 64], [12, 52], [14, 42],
];

export const miami: Circuit = {
  id: 'miami',
  name: 'Miami International Autodrome',
  lengthKm: 5.412,
  laps: 57,
  facts: [
    'Vòng đua tạm thời quanh sân vận động Hard Rock của đội Miami Dolphins.',
    'Ra mắt F1 năm 2022 — một trong ba chặng trên đất Mỹ từ 2023.',
    'Tổ hợp T11–T16 chậm và hẹp dưới các nhánh cao tốc tương phản với đoạn thẳng dài.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
