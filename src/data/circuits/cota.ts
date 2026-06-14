// Circuit of the Americas (Austin) — uphill T1 hairpin, esses inspired by
// Maggotts/Becketts, back straight to a tight hairpin, stadium triple-apex.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [44, 80], [30, 80], [20, 76], [22, 68], [30, 62], [26, 54], [34, 48],
  [30, 42], [38, 36], [42, 30], [36, 22], [30, 28], [44, 34], [58, 38],
  [70, 44], [76, 52], [68, 58], [72, 64], [62, 68], [54, 66], [48, 74],
];

export const cota: Circuit = {
  id: 'cota',
  name: 'Circuit of the Americas',
  lengthKm: 5.513,
  laps: 56,
  facts: [
    'Khúc T1: leo dốc ~40 m rồi bẻ trái gắt — điểm phanh ngoạn mục nhất nước Mỹ.',
    'Thiết kế "best of": gom các tổ hợp cua kinh điển từ Silverstone, Hockenheim, Istanbul.',
    'Đường đua chuyên dụng đầu tiên của Mỹ xây riêng cho F1, mở cửa 2012.',
    'Tháp quan sát 77 m là biểu tượng của khu vực stadium section.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
