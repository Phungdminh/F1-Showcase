// Hungaroring (Budapest) — compact, twisty amphitheatre loop. Approximated.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [22, 64], [36, 66], [50, 64], [60, 58], [64, 48], [56, 42], [48, 46],
  [40, 40], [30, 36], [22, 40], [16, 46], [22, 52], [16, 58],
];

export const hungaroring: Circuit = {
  id: 'hungaroring',
  name: 'Hungaroring',
  lengthKm: 4.381,
  laps: 70,
  facts: [
    'Vòng đua kiểu "lòng chảo": khán giả nhìn được phần lớn đường đua từ đồi.',
    'Hẹp, liên tục cua — được ví là "Monaco không có tường chắn", rất khó vượt.',
    'Chặng F1 đầu tiên sau Bức màn sắt, tổ chức liên tục từ 1986.',
    'Thời tiết tháng 7 nóng bức khiến quản lý lốp và thể lực cực kỳ khắc nghiệt.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.34, 0.67),
};
