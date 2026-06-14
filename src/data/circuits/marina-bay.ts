// Marina Bay Street Circuit (Singapore) — boxy night-race street loop with
// 90° corners around the bay. Approximated.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [22, 42], [38, 40], [52, 38], [62, 34], [70, 40], [64, 48], [56, 46],
  [60, 54], [68, 58], [74, 66], [64, 70], [52, 68], [44, 74], [32, 76],
  [20, 72], [16, 62], [22, 56], [14, 50],
];

export const marinaBay: Circuit = {
  id: 'marina-bay',
  name: 'Marina Bay Street Circuit',
  lengthKm: 4.94,
  laps: 62,
  facts: [
    'Chặng đua đêm đầu tiên trong lịch sử F1 (2008).',
    'Nóng ẩm khắc nghiệt: tay đua mất 3–4 kg nước sau gần 2 giờ đua.',
    'Chạy quanh vịnh Marina giữa các tòa nhà biểu tượng của Singapore.',
    'Tỷ lệ xuất hiện safety car thuộc hàng cao nhất mùa giải.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
