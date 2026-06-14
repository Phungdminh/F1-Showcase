// Lusail International Circuit (Qatar) — flowing floodlit lap of fast,
// medium-speed sweepers originally built for MotoGP.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [26, 72], [42, 74], [56, 70], [64, 62], [58, 54], [64, 46], [56, 40],
  [60, 32], [50, 26], [40, 30], [34, 24], [24, 28], [18, 36], [24, 42],
  [16, 48], [12, 58], [18, 66],
];

export const lusail: Circuit = {
  id: 'lusail',
  name: 'Lusail International Circuit',
  lengthKm: 5.419,
  laps: 57,
  facts: [
    'Xây năm 2004 cho MotoGP; F1 đua tại đây từ 2021 dưới dàn đèn công suất lớn.',
    'Chuỗi cua trung-cao tốc liền mạch khiến cổ và lốp chịu tải liên tục.',
    'Gần như không có đoạn nghỉ — một trong những vòng đua thể lực nhất.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
