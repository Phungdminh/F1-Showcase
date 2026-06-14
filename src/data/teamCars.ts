// Short per-team 2026 car blurbs (consumed by TeamDetailPage car block).
// Grounded in the 2026 technical regs (active aero X/Z-mode, ~50/50 hybrid,
// sustainable fuel) + each team's real engine/context — no invented results.
const CAR_DESC: Record<string, string> = {
  mclaren:
    'Mẫu xe 2026 của McLaren kế thừa nền tảng khí động hàng đầu, kết hợp cánh gió chủ động X/Z-mode và bộ động lực hybrid Mercedes với tỷ lệ điện gần 50%.',
  ferrari:
    'SF-26 là chiến mã đầu tiên của Ferrari theo luật 2026 — khí động chủ động và động cơ Ferrari hybrid mới, hướng tới đưa Scuderia trở lại nhóm dẫn đầu.',
  'red-bull':
    'RB22 mở ra kỷ nguyên Red Bull tự chủ động cơ cùng Ford Powertrains, gói khí động chủ động được tinh chỉnh quanh hệ truyền động hoàn toàn mới.',
  mercedes:
    'W17 là nỗ lực của Mercedes nhằm tái lập thế mạnh trong kỷ nguyên động cơ 2026 do chính họ phát triển, tối ưu quanh khí động chủ động và hiệu suất hybrid.',
  'aston-martin':
    'AMR26 là dự án tham vọng của Aston Martin với động cơ Honda nhà máy và hầm gió mới, kỳ vọng tạo bước nhảy theo bộ luật 2026.',
  alpine:
    'A526 chuyển sang dùng động cơ khách hàng Mercedes, đặt cược vào gói khí động chủ động để cải thiện vị thế ở nhóm giữa.',
  williams:
    'FW48 tiếp nối quá trình hồi sinh của Williams dưới thời James Vowles, khai thác luật 2026 để rút ngắn khoảng cách với nhóm đầu.',
  'racing-bulls':
    'VCARB 03 dùng chung nhiều cụm với Red Bull và động cơ Red Bull Ford, là sân thử nghiệm cho tài năng trẻ trong khung gầm 2026.',
  audi:
    'R26 là chiếc xe nhà máy đầu tiên của Audi, tích hợp động cơ hybrid tự phát triển tại Đức cho kỷ nguyên 2026.',
  haas:
    'VF-26 theo mô hình tinh gọn quen thuộc của Haas: tận dụng nhiều cụm từ Ferrari và tập trung tối ưu gói khí động chủ động 2026.',
  cadillac:
    'C26 là chiếc xe ra mắt của Cadillac, dùng động cơ khách hàng Ferrari trong mùa giải đầu tiên trước khi General Motors phát triển động cơ riêng.',
};

const FALLBACK = 'Mẫu xe 2026 theo bộ luật kỹ thuật mới: khí động chủ động và hệ động lực hybrid với tỷ lệ điện gần một nửa.';

export function getTeamCar(teamId: string | undefined): string {
  return (teamId && CAR_DESC[teamId]) || FALLBACK;
}
