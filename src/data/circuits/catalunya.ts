// Circuit de Barcelona-Catalunya — long main straight, fast T3 sweep on the
// right, twisty middle, stadium-ish final section. Approximated.
import type { Circuit } from '../../types';
import { buildPath, sectorIndices } from './buildPath';

const controls: [number, number][] = [
  [22, 72], [40, 72], [56, 70], [66, 66], [70, 58], [64, 50], [68, 42],
  [60, 34], [50, 38], [42, 32], [32, 28], [24, 34], [28, 42], [20, 48],
  [16, 56], [22, 62], [18, 68],
];

export const catalunya: Circuit = {
  id: 'catalunya',
  name: 'Circuit de Barcelona-Catalunya',
  lengthKm: 4.657,
  laps: 66,
  facts: [
    'Sân test quen thuộc nhất của F1 — các đội thuộc lòng từng mét đường.',
    'Khúc T3 dài ôm phải là thước đo tải khí động kinh điển.',
    'Năm 2026 vẫn giữ một chặng riêng song song với vòng đua mới ở Madrid.',
    'Tổ chức GP Tây Ban Nha liên tục từ 1991.',
  ],
  pathPoints: buildPath(controls),
  startFinishIndex: 0,
  sectorBreaks: sectorIndices(0.32, 0.65),
};
