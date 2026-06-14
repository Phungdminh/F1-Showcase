// Circuit Zandvoort — flowing dune rollercoaster with banked corners.
// Approximated.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [26, 70], [42, 70], [54, 68], [62, 62], [56, 54], [48, 50], [42, 44],
  [48, 38], [56, 34], [64, 28], [58, 22], [46, 20], [36, 24], [28, 20],
  [18, 26], [14, 36], [20, 44], [14, 52], [18, 62],
];

export const zandvoort: Circuit = {
  id: 'zandvoort',
  name: 'Circuit Zandvoort',
  lengthKm: 4.259,
  laps: 72,
  facts: [
    'Uốn lượn giữa các đồi cát ven Biển Bắc — cao độ thay đổi liên tục.',
    'Cua cuối Arie Luyendyk nghiêng tới 18° — lớn hơn nhiều oval của NASCAR.',
    'Trở lại lịch F1 năm 2021 sau 36 năm vắng bóng nhờ "cơn sốt Verstappen".',
    'Hairpin Tarzan ở cuối đoạn thẳng chính là điểm vượt chủ lực.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
