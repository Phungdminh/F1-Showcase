// Suzuka International Racing Course — the only figure-8 on the calendar:
// the back section deliberately crosses the Degner run (bridge in reality).
// Approximated layout: esses on the west, hairpin north-east, Spoon west,
// 130R + chicane before the line.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [70, 80], [54, 82], [40, 78], [32, 70], [26, 62], [20, 54], [26, 48],
  [20, 40], [24, 32], [32, 26], [44, 24], [52, 28], [64, 24], [74, 18],
  [78, 10], [68, 6], [54, 6], [40, 10], [28, 14], [22, 22], [28, 28],
  [40, 30], [58, 25], [70, 30], [78, 38], [82, 50], [78, 62], [74, 66],
  [76, 72],
];

export const suzuka: Circuit = {
  id: 'suzuka',
  name: 'Suzuka International Racing Course',
  lengthKm: 5.807,
  laps: 53,
  facts: [
    'Đường đua hình số 8 duy nhất trong lịch F1 — có cầu vượt bắc qua chính nó.',
    'Chuỗi cua "S" (Esses) ở khu vực đầu vòng là bài kiểm tra khí động chuẩn mực.',
    '130R — khúc cua trái tốc độ cực cao, một trong những cua đáng sợ nhất F1.',
    'Thuộc sở hữu của Honda, tổ chức GP Nhật Bản từ 1987.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.68),
};
