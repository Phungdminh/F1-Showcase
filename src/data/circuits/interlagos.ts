// Autódromo José Carlos Pace (Interlagos, São Paulo) — anticlockwise:
// Senna S downhill, Curva do Sol, lake section, infield twists, the long
// climbing arc back to the line.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [58, 24], [44, 22], [34, 26], [30, 34], [36, 38], [28, 44], [24, 54],
  [30, 62], [38, 66], [44, 60], [52, 64], [58, 58], [52, 52], [60, 48],
  [68, 54], [74, 60], [80, 52], [78, 40], [70, 30],
];

export const interlagos: Circuit = {
  id: 'interlagos',
  name: 'Autódromo José Carlos Pace (Interlagos)',
  lengthKm: 4.309,
  laps: 71,
  facts: [
    'Chạy ngược chiều kim đồng hồ — hiếm hoi trên lịch F1.',
    'Tổ hợp Senna S đổ dốc ngay sau vạch xuất phát là điểm vượt kinh điển.',
    'Sân nhà của huyền thoại Ayrton Senna; khán giả Brazil cuồng nhiệt bậc nhất.',
    'Nhiều mùa giải F1 đã được định đoạt trong mưa tại đây.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.3, 0.62),
};
