// Curated 2026-season news dataset — T2. Served through the async data layer
// (PLAN §1 /news strategy); live-swappable later without UI change.
//
// EDITORIAL NOTE (2026-06-12): live news search was DENIED in this build
// environment, so this set covers the 2026 season's verified storylines
// (regulations, entries, calendar, lineups — all confirmed pre-season as of
// knowledge cutoff 2026-01) and deliberately contains NO mid-season race
// outcomes — those are never invented. Items relying on facts that may have
// drifted are marked UNVERIFIED. sourceUrl points at stable section hubs of
// real outlets; swap in deep links when network verification is available.
// Exactly 3 items carry importance 5 (landing FeaturedTabs contract).
import type { NewsItem } from '../types';

export const news: NewsItem[] = [
  {
    id: 'regs-2026-active-aero',
    title: 'Kỷ nguyên 2026: khí động chủ động và 50% công suất điện',
    summary:
      'Luật kỹ thuật 2026 thay đổi F1 sâu nhất nhiều thập kỷ: cánh trước lẫn cánh sau đều chủ động chuyển giữa X-mode và Z-mode, DRS bị khai tử. Bộ động lực mới bỏ MGU-H, nâng MGU-K lên 350 kW để điện chiếm gần một nửa tổng công suất.',
    date: '2026-01-15',
    importance: 5,
    sourceUrl: 'https://www.fia.com/news',
    imageUrl: '/Mask_group.jpg',
    category: 'Kỹ thuật',
  },
  {
    id: 'cadillac-11th-team',
    title: 'Cadillac gia nhập: 11 đội lần đầu tiên kể từ 2016',
    summary:
      'Đội đua Mỹ Cadillac chính thức tham chiến với bộ đôi giàu kinh nghiệm Sergio Pérez và Valtteri Bottas, dùng động cơ khách hàng Ferrari. Đây là đội thứ 11 trên grid — điều F1 chưa từng có trong gần một thập kỷ.',
    date: '2026-02-20',
    importance: 5,
    sourceUrl: 'https://www.formula1.com/en/latest.html',
    imageUrl: '/Mask_group-1.jpg',
    category: 'Đội đua',
  },
  {
    id: 'season-2026-opens-melbourne',
    title: 'Mùa giải 24 chặng khởi tranh tại Melbourne',
    summary:
      'F1 2026 mở màn ở Albert Park với 24 chặng, 11 đội và 22 tay đua — mùa đầu tiên của thế hệ xe hoàn toàn mới. Lịch đua chia tay Imola và chào đón Madrid vào tháng 9.',
    date: '2026-03-05',
    importance: 5,
    sourceUrl: 'https://www.formula1.com/en/racing/2026.html',
    imageUrl: '/Mask_group-2.jpg',
    category: 'Mùa giải',
  },
  {
    id: 'audi-works-entry',
    title: 'Audi ra mắt đội đua nhà máy đầu tiên',
    summary:
      'Sau khi thâu tóm Sauber, Audi bước vào F1 với tư cách đội nhà máy: động cơ tự phát triển tại Đức, bộ đôi Nico Hülkenberg và tân binh Gabriel Bortoleto. Thương hiệu bốn vòng tròn đánh cược vào luật động cơ 2026.',
    date: '2026-01-20',
    importance: 4,
    sourceUrl: 'https://www.motorsport.com/f1/news/',
    category: 'Đội đua',
  },
  {
    id: 'verstappen-hadjar-rbr',
    title: 'Verstappen có đồng đội mới: Hadjar lên Red Bull',
    summary:
      'Isack Hadjar được đôn từ Racing Bulls lên ngồi cạnh Max Verstappen — chiếc ghế khắc nghiệt nhất F1. Đây cũng là mùa đầu Red Bull chạy động cơ tự chế tạo cùng Ford.', // lineup UNVERIFIED vs mid-season
    date: '2026-01-10',
    importance: 4,
    sourceUrl: 'https://www.autosport.com/f1/news/',
    category: 'Chuyển nhượng',
  },
  {
    id: 'madring-debut',
    title: 'Madring: Madrid chờ màn ra mắt tháng 9',
    summary:
      'Vòng đua bán đường phố 5,474 km quanh khu hội chợ IFEMA sẽ tổ chức GP Tây Ban Nha phiên bản Madrid ở vòng 16. Điểm nhấn là khúc cua nghiêng "La Monumental" với độ nghiêng tới 24°.',
    date: '2026-04-10',
    importance: 4,
    sourceUrl: 'https://www.formula1.com/en/racing/2026.html',
    category: 'Đường đua',
  },
  {
    id: 'engine-map-2026',
    title: 'Bản đồ động cơ 2026: Honda về Aston, Ford cùng Red Bull',
    summary:
      'Honda trở thành đối tác nhà máy của Aston Martin, Red Bull tự chủ động cơ cùng Ford, còn Alpine chuyển sang dùng Mercedes. Ferrari cung cấp cho Haas lẫn tân binh Cadillac.',
    date: '2026-01-25',
    importance: 3,
    sourceUrl: 'https://www.skysports.com/f1/news',
    category: 'Kỹ thuật',
  },
  {
    id: 'hamilton-ferrari-year-two',
    title: 'Hamilton bước vào mùa thứ hai trong màu áo đỏ',
    summary:
      'Sau mùa 2025 nhiều thăng trầm, Lewis Hamilton cùng Charles Leclerc đặt cược vào bộ luật mới để đưa Ferrari trở lại đỉnh cao. Bộ đôi này được giữ nguyên cho 2026.',
    date: '2026-02-15',
    importance: 3,
    sourceUrl: 'https://www.bbc.com/sport/formula1',
    category: 'Đội đua',
  },
  {
    id: 'pirelli-2026-tires',
    title: 'Lốp 2026 hẹp hơn nhưng không kém bám',
    summary:
      'Pirelli thu hẹp lốp trước 25 mm và lốp sau 30 mm theo triết lý xe nhỏ - nhẹ của 2026. Mâm vẫn 18 inch, mục tiêu giảm khối lượng và lực cản với mức mất độ bám tối thiểu.',
    date: '2026-02-10',
    importance: 3,
    sourceUrl: 'https://www.motorsport.com/f1/news/',
    category: 'Kỹ thuật',
  },
  {
    id: 'override-mode',
    title: 'Manual Override: "nút vượt" thay thế DRS',
    summary:
      'Khi bám đuổi đủ gần, tay đua được kích hoạt Manual Override để nhận thêm năng lượng điện ở dải tốc cao trong lúc xe trước bị giới hạn. F1 kỳ vọng cơ chế này tạo ra những pha vượt chủ động hơn DRS cũ.',
    date: '2026-03-20',
    importance: 2,
    sourceUrl: 'https://www.formula1.com/en/latest.html',
    category: 'Kỹ thuật',
  },
  {
    id: 'lindblad-rookie',
    title: 'Lindblad — tân binh tuổi teen của Racing Bulls',
    summary:
      'Arvid Lindblad trở thành gương mặt mới nhất ra lò từ học viện Red Bull, lấp chỗ trống Hadjar để lại tại Faenza. Tay đua người Anh là một trong những rookie trẻ nhất grid 2026.', // lineup UNVERIFIED vs mid-season
    date: '2026-02-05',
    importance: 2,
    sourceUrl: 'https://www.autosport.com/f1/news/',
    category: 'Chuyển nhượng',
  },
  {
    id: 'sustainable-fuel-2026',
    title: 'Nhiên liệu bền vững 100% cho cả grid',
    summary:
      'Từ 2026 mọi động cơ F1 chạy nhiên liệu "drop-in" bền vững hoàn toàn, không thêm carbon hóa thạch vào khí quyển. Đây là trụ cột trong cam kết Net Zero 2030 của môn thể thao.',
    date: '2026-01-30',
    importance: 2,
    sourceUrl: 'https://www.theguardian.com/sport/formulaone',
    category: 'Mùa giải',
  },
];

/** Top stories for the landing featured tabs (importance 5, newest first). */
export function getFeaturedNews(count = 3): NewsItem[] {
  return [...news]
    .filter((n) => n.importance === 5)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count);
}
