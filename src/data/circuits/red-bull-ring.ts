// Red Bull Ring (Spielberg) — compact alpine triangle: two uphill straights
// into tight rights, flowing downhill west side.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [20, 70], [36, 68], [52, 64], [62, 60], [72, 50], [80, 36], [76, 26],
  [66, 28], [52, 34], [38, 40], [30, 46], [22, 54], [16, 62],
];

export const redBullRing: Circuit = {
  id: 'red-bull-ring',
  name: 'Red Bull Ring',
  lengthKm: 4.318,
  laps: 71,
  facts: [
    'Một trong những vòng ngắn nhất calendar — lap đua quanh mốc 65 giây.',
    'Ba đoạn thẳng dài leo đồi Styria nối bằng các cua phải gắt: thiên về sức mạnh động cơ.',
    'Tiền thân là Österreichring huyền thoại; được Red Bull hồi sinh năm 2011.',
    'Cao độ chênh ~65 m mỗi vòng giữa khung cảnh núi Alps.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.36, 0.7),
};
