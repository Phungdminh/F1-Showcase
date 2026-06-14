// Per-team competitive history since 2000 (factual records — championships,
// notable wins, lineage). Consumed by TeamDetailPage in place of the engine
// block. Facts only, summarised in our own words.
export interface TeamHistory {
  /** Headline stat line (e.g. titles since 2000). */
  headline: string;
  /** Key achievement bullets (year-stamped). */
  bullets: string[];
  /** One-line narrative. */
  note: string;
}

const HISTORY: Record<string, TeamHistory> = {
  mclaren: {
    headline: '1 cúp đội đua · 1 cúp tay đua (từ 2000)',
    bullets: [
      '2008: Lewis Hamilton vô địch tay đua',
      '2024: Vô địch đội đua — lần đầu kể từ 1998',
      'Hàng chục chặng thắng qua các thời Häkkinen, Hamilton, Norris/Piastri',
    ],
    note: 'Một trong những đội giàu truyền thống nhất F1, trở lại đỉnh cao với chức vô địch đội đua 2024.',
  },
  ferrari: {
    headline: '7 cúp đội đua · 6 cúp tay đua (từ 2000)',
    bullets: [
      '2000–2004: Michael Schumacher 5 lần liên tiếp vô địch tay đua',
      '2000–2004 & 2007–2008: 7 chức vô địch đội đua',
      '2007: Kimi Räikkönen vô địch tay đua',
    ],
    note: 'Kỷ nguyên Schumacher đưa Ferrari thống trị đầu thập niên 2000 — đội thành công nhất giai đoạn này.',
  },
  'red-bull': {
    headline: '6 cúp đội đua · 8 cúp tay đua (từ 2000)',
    bullets: [
      '2010–2013: Sebastian Vettel 4 lần liên tiếp vô địch tay đua',
      '2021–2024: Max Verstappen 4 lần vô địch tay đua',
      'Vô địch đội đua 2010–2013 và 2022–2023',
    ],
    note: 'Tiếp quản đội Jaguar năm 2005 rồi vươn lên thành thế lực với hai kỷ nguyên Vettel và Verstappen.',
  },
  mercedes: {
    headline: '8 cúp đội đua · 7 cúp tay đua (từ 2000)',
    bullets: [
      '2014–2021: 8 chức vô địch đội đua liên tiếp',
      'Lewis Hamilton 6 lần vô địch (2014, 15, 17, 18, 19, 20)',
      '2016: Nico Rosberg vô địch tay đua',
    ],
    note: 'Đội nhà máy Mercedes (từ 2010) thống trị kỷ nguyên động cơ hybrid với 8 mùa vô địch liên tiếp.',
  },
  'aston-martin': {
    headline: 'Chưa có chức vô địch (từ 2000)',
    bullets: [
      '2003: Giancarlo Fisichella thắng GP Brazil (thời Jordan)',
      'Nhiều lần lên podium thời Force India và Aston Martin',
      'Dòng đội: Jordan → Force India → Racing Point → Aston Martin',
    ],
    note: 'Dòng đội giàu màu sắc, chưa vô địch nhưng nhiều lần gây bất ngờ; mang tên Aston Martin từ 2021.',
  },
  alpine: {
    headline: '2 cúp đội đua · 2 cúp tay đua (từ 2000)',
    bullets: [
      '2005–2006: Fernando Alonso vô địch tay đua 2 năm liên tiếp (Renault)',
      '2005–2006: Vô địch đội đua cùng Renault',
      '2021: Esteban Ocon thắng GP Hungary',
    ],
    note: 'Tiền thân Renault hai lần vô địch giữa thập niên 2000; khoác áo Alpine từ 2021.',
  },
  williams: {
    headline: 'Chưa vô địch kể từ năm 2000',
    bullets: [
      'Đầu 2000s: nhiều chặng thắng cùng Montoya và Ralf Schumacher',
      '2012: Pastor Maldonado thắng GP Tây Ban Nha',
      '9 chức vô địch đội đua trong lịch sử (đều trước năm 2000)',
    ],
    note: 'Một trong những đội huyền thoại của F1; phần lớn chiến tích vô địch thuộc về thế kỷ trước.',
  },
  'racing-bulls': {
    headline: '2 chặng thắng bất ngờ (từ 2000)',
    bullets: [
      '2008: Sebastian Vettel thắng GP Ý tại Monza (Toro Rosso)',
      '2020: Pierre Gasly thắng GP Ý tại Monza (AlphaTauri)',
      'Dòng đội: Minardi → Toro Rosso → AlphaTauri → Racing Bulls',
    ],
    note: 'Đội em của Red Bull, bệ phóng cho nhiều tài năng; hai lần gây địa chấn ngay tại Monza.',
  },
  audi: {
    headline: '1 chặng thắng (từ 2000)',
    bullets: [
      '2008: Robert Kubica thắng GP Canada (thời BMW Sauber)',
      'Nhiều lần lên podium thời Sauber / BMW Sauber',
      'Sauber trở thành đội nhà máy Audi từ 2026',
    ],
    note: 'Tiền thân Sauber bền bỉ ở nhóm giữa; Audi tiếp quản thành đội nhà máy từ 2026.',
  },
  haas: {
    headline: 'Chưa có chức vô địch (từ 2016)',
    bullets: [
      'Ra mắt F1 năm 2016 — đội Mỹ đầu tiên sau nhiều thập kỷ',
      'Thành tích tốt nhất: nhiều lần ghi điểm và vài vị trí xuất phát cao',
      'Hợp tác kỹ thuật sâu với Ferrari theo mô hình tinh gọn',
    ],
    note: 'Đội trẻ vận hành tinh gọn, tập trung tối ưu nguồn lực giữa nhóm cạnh tranh khốc liệt.',
  },
  cadillac: {
    headline: 'Đội mới — mùa đầu tiên 2026',
    bullets: [
      'Gia nhập F1 từ 2026 với tư cách đội thứ 11',
      'Bộ đôi giàu kinh nghiệm Sergio Pérez và Valtteri Bottas',
      'Chưa có lịch sử thi đấu — bắt đầu trang sử mới',
    ],
    note: 'Tân binh người Mỹ chính thức bước vào F1 từ mùa giải 2026.',
  },
};

const FALLBACK: TeamHistory = {
  headline: 'Đang cập nhật',
  bullets: ['Lịch sử chiến tích của đội đang được cập nhật.'],
  note: '',
};

export function getTeamHistory(teamId: string | undefined): TeamHistory {
  return (teamId && HISTORY[teamId]) || FALLBACK;
}
