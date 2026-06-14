// Baku City Circuit — rectangle-ish street loop: 2.2 km flat-out seafront
// run, 90° corners, and the narrow uphill old-town squiggle.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [78, 74], [58, 76], [38, 76], [24, 74], [18, 68], [18, 58], [24, 54],
  [28, 48], [22, 42], [26, 36], [20, 32], [24, 26], [34, 22], [50, 20],
  [66, 22], [78, 20], [84, 28], [86, 42], [84, 58], [80, 68],
];

export const baku: Circuit = {
  id: 'baku',
  name: 'Baku City Circuit',
  lengthKm: 6.003,
  laps: 51,
  facts: [
    'Đoạn full-throttle dọc đại lộ ven biển Caspi dài tới ~2,2 km.',
    'Khúc qua thành cổ Icherisheher chỉ rộng 7–8 m — hẹp nhất calendar.',
    'Tổ chức từ 2016; nổi tiếng với những vòng safety car và kết cục khó đoán.',
    'Kết hợp hiếm có: tốc độ kiểu Monza với tường chắn kiểu Monaco.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
