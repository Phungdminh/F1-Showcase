// Yas Marina Circuit (Abu Dhabi) — twin long straights with hairpin/chicane
// ends, twisty marina-hotel section. Season finale venue.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [28, 70], [44, 70], [58, 68], [66, 62], [62, 54], [66, 46], [58, 40],
  [44, 38], [28, 36], [18, 40], [16, 46], [28, 48], [42, 50], [52, 54],
  [58, 60], [50, 64], [40, 62], [30, 58], [20, 62],
];

export const yasMarina: Circuit = {
  id: 'yas-marina',
  name: 'Yas Marina Circuit',
  lengthKm: 5.281,
  laps: 58,
  facts: [
    'Chặng chung kết truyền thống — đua lúc hoàng hôn chuyển dần sang đêm.',
    'Pit exit từng chui qua đường đua bằng đường hầm độc nhất.',
    'Khách sạn W Abu Dhabi đổi màu rực rỡ vắt ngang đường đua ở khu marina.',
    'Được chỉnh sửa năm 2021 để tăng cơ hội bám đuổi và vượt mặt.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.33, 0.66),
};
