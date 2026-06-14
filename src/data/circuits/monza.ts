// Autodromo Nazionale Monza — temple of speed: long straights, Rettifilo &
// Roggia chicanes, Lesmo rights, Ascari, the Parabolica sweep onto the line.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [70, 78], [52, 80], [38, 78], [30, 74], [33, 70], [28, 67], [22, 58],
  [20, 48], [22, 40], [18, 36], [22, 28], [30, 23], [42, 32], [50, 40],
  [53, 46], [57, 43], [60, 48], [67, 56], [73, 62], [81, 66], [85, 72],
  [80, 77],
];

export const monza: Circuit = {
  id: 'monza',
  name: 'Autodromo Nazionale Monza',
  lengthKm: 5.793,
  laps: 53,
  facts: [
    '"Ngôi đền tốc độ" — tốc độ trung bình vòng đua cao nhất mùa giải (~264 km/h).',
    'Hoạt động từ 1922, là đường đua lâu đời nhất còn trên lịch F1 cùng Spa.',
    'Parabolica: cua phải dài nổi tiếng dẫn thẳng về vạch đích.',
    'Các đội chạy gói cánh gió mỏng nhất năm tại đây; tifosi nhuộm đỏ khán đài.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.35, 0.7),
};
