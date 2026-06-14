// Bahrain International Circuit (Sakhir) — simplified desert layout:
// heavy-braking T1, twin infield lobes, long straights.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [28, 76], [46, 78], [58, 74], [54, 66], [60, 58], [70, 50], [74, 40],
  [66, 34], [54, 38], [44, 32], [32, 30], [24, 36], [30, 44], [34, 52],
  [26, 58], [16, 62], [14, 70], [20, 76],
];

export const bahrain: Circuit = {
  id: 'bahrain',
  name: 'Bahrain International Circuit',
  lengthKm: 5.412,
  laps: 57,
  facts: [
    'Nằm giữa sa mạc Sakhir, tổ chức GP đầu tiên của Trung Đông năm 2004.',
    'Đua đêm dưới dàn đèn từ 2014; chênh lệch nhiệt độ làm chiến thuật lốp khó lường.',
    'Bốn đoạn thẳng dài + nhiều điểm phanh nặng — thiên đường cho vượt mặt.',
    'Là địa điểm test pre-season quen thuộc của cả grid.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
