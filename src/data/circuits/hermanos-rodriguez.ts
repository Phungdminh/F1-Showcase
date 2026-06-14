// Autódromo Hermanos Rodríguez (Mexico City) — long main straight, esses,
// the Foro Sol stadium wiggle and the half-Peraltada onto the line.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [20, 70], [40, 72], [60, 70], [72, 66], [68, 58], [60, 54], [64, 48],
  [56, 44], [60, 38], [50, 34], [36, 32], [24, 32], [16, 38], [22, 44],
  [16, 50], [22, 54], [14, 58], [12, 66],
];

export const hermanosRodriguez: Circuit = {
  id: 'hermanos-rodriguez',
  name: 'Autódromo Hermanos Rodríguez',
  lengthKm: 4.304,
  laps: 71,
  facts: [
    'Nằm ở độ cao 2.285 m — không khí loãng làm giảm tải khí động và mã lực.',
    'Đoạn xuyên sân vận động Foro Sol tạo bầu không khí lễ hội độc nhất.',
    'Cua nghiêng Peraltada huyền thoại nay chỉ còn được chạy một nửa.',
    'Mang tên anh em tay đua Ricardo và Pedro Rodríguez.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
