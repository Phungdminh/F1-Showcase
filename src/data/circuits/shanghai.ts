// Shanghai International Circuit — simplified: snail T1 complex upper-middle,
// hairpin left, long straight + hairpin on the right. Approximated layout.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [26, 78], [40, 78], [52, 70], [58, 60], [62, 48], [58, 38], [48, 34],
  [42, 42], [46, 50], [42, 58], [32, 56], [22, 58], [18, 66], [28, 70],
  [38, 66], [46, 70], [56, 66], [64, 70], [74, 64], [82, 52], [86, 38],
  [82, 26], [74, 26], [70, 36], [72, 48], [70, 60], [66, 76],
];

export const shanghai: Circuit = {
  id: 'shanghai',
  name: 'Shanghai International Circuit',
  lengthKm: 5.451,
  laps: 56,
  facts: [
    'Thiết kế mô phỏng chữ "thượng" (上) trong tên Thượng Hải.',
    'Tổ hợp T1–T3 dạng xoắn ốc siết dần nổi tiếng khó kiểm soát lốp.',
    'Đoạn thẳng sau dài ~1,2 km dẫn vào khúc hairpin — điểm vượt chính.',
    'Tổ chức F1 từ 2004, trở lại lịch đua từ 2024.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.36, 0.7),
};
