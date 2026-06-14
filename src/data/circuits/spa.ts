// Circuit de Spa-Francorchamps — longest lap in F1: La Source hairpin,
// Eau Rouge/Raidillon kink, Kemmel straight, Pouhon, Blanchimont, Bus Stop.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [16, 34], [14, 24], [20, 14], [28, 18], [32, 28], [30, 36], [36, 42],
  [48, 48], [60, 54], [68, 58], [66, 64], [60, 68], [54, 64], [44, 68],
  [40, 76], [48, 82], [54, 80], [60, 86], [44, 88], [30, 84], [22, 76],
  [26, 72], [20, 66], [16, 50],
];

export const spa: Circuit = {
  id: 'spa',
  name: 'Circuit de Spa-Francorchamps',
  lengthKm: 7.004,
  laps: 44,
  facts: [
    'Vòng đua dài nhất lịch F1 hiện tại: 7,004 km xuyên rừng Ardennes.',
    'Eau Rouge – Raidillon: tổ hợp lên dốc nén bụng nổi tiếng nhất thế giới đua xe.',
    'Thời tiết thất thường — một nửa vòng đua mưa, nửa kia khô là chuyện thường.',
    'Tổ chức GP từ 1925; layout hiện đại rút gọn từ vòng 14 km nguyên bản.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.36, 0.72),
};
