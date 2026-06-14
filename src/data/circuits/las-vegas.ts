// Las Vegas Strip Circuit — night street race: long Strip blast down the
// east side, Sphere curl at the north, low-grip 90° corners.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [36, 82], [22, 82], [15, 76], [17, 66], [15, 54], [18, 44], [26, 38],
  [38, 34], [50, 32], [60, 28], [66, 34], [61, 40], [64, 48], [68, 58],
  [69, 70], [62, 78],
];

export const lasVegas: Circuit = {
  id: 'las-vegas',
  name: 'Las Vegas Strip Circuit',
  lengthKm: 6.201,
  laps: 50,
  facts: [
    'Phóng hết tốc lực ~1,9 km dọc đại lộ Las Vegas Strip dưới ánh đèn neon.',
    'Đua tối thứ Bảy theo giờ địa phương — khác biệt với cả calendar.',
    'Khúc cua ôm quanh nhà cầu Sphere phát sáng là hình ảnh biểu tượng từ 2023.',
    'Nhiệt độ đêm sa mạc thấp khiến việc giữ nhiệt lốp cực khó.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
