// Circuit Gilles Villeneuve (Montréal) — long, thin island loop: hairpin at
// the east end, Senna S at the west, chicane kinks along the lanes.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [12, 46], [8, 52], [14, 58], [28, 60], [44, 62], [58, 60], [72, 62],
  [84, 58], [88, 50], [84, 44], [70, 46], [56, 42], [44, 46], [30, 42],
  [18, 44],
];

export const gillesVilleneuve: Circuit = {
  id: 'gilles-villeneuve',
  name: 'Circuit Gilles Villeneuve',
  lengthKm: 4.361,
  laps: 70,
  facts: [
    'Nằm trên đảo nhân tạo Notre-Dame giữa sông Saint Lawrence.',
    '"Wall of Champions" ở chicane cuối từng hạ gục nhiều nhà vô địch thế giới.',
    'Đặc trưng: chuỗi chicane + hairpin — cực kỳ khắc nghiệt với phanh.',
    'Mang tên huyền thoại Gilles Villeneuve, người thắng chặng đầu tiên tại đây (1978).',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
