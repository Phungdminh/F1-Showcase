// 2026-regs car component catalog (11 components, SPEC §2.4) — T2.
// Export names `carComponents` / `getCarComponent` are stable contracts
// consumed by /teams/:teamId/car (CarExplorerScene hotspots + detail panel).
//
// Technical basis: published 2026 FIA technical regulations (verified as of
// knowledge cutoff 2026-01): ~50/50 ICE/electric power split, MGU-H dropped,
// MGU-K boosted to 350 kW, 100% sustainable fuel, active aero front AND rear
// (X-mode/Z-mode) replacing DRS, narrower/lighter cars, partially flat floor
// with reduced ground effect.
//
// Geometry convention (PLAN §4 CarExplorerScene): car ≈ 5 units long,
// +x = forward (nose ≈ +2.5, tail ≈ -2.5), +y = up (0–1), z = right side.
// `hotspot` anchors the arrow label on the generic silhouette; subPart
// `offset` is the exploded-view displacement from the component's origin.
import type { CarComponent } from '../types';

export const carComponents: CarComponent[] = [
  {
    id: 'power-unit',
    name: 'Bộ động lực (Power Unit)',
    hotspot: [-0.6, 0.66, 0],
    summary:
      'Trái tim của xe 2026: động cơ V6 turbo-hybrid với tỷ lệ điện/đốt trong gần 50/50, bỏ MGU-H và chạy nhiên liệu bền vững 100%.',
    subParts: [
      {
        id: 'ice',
        name: 'Động cơ đốt trong V6 1.6L turbo',
        description:
          'Khối V6 1.6L tăng áp chạy nhiên liệu bền vững 100%, đóng góp khoảng một nửa tổng công suất hệ thống.',
        offset: [0, 0.55, 0],
      },
      {
        id: 'mgu-k',
        name: 'MGU-K 350 kW',
        description:
          'Mô-tơ điện thu hồi động năng khi phanh, mạnh gần gấp ba thế hệ cũ — nguồn của khoảng 50% công suất xe 2026.',
        offset: [-0.5, 0.2, 0.6],
      },
      {
        id: 'energy-store',
        name: 'Khối pin lưu trữ năng lượng',
        description:
          'Bộ pin đặt trong sàn an toàn dưới bình nhiên liệu, cấp và nhận năng lượng cho MGU-K theo từng vòng đua.',
        offset: [0.5, -0.3, -0.5],
      },
    ],
  },
  {
    id: 'front-wing',
    name: 'Cánh gió trước (khí động chủ động)',
    hotspot: [2.3, 0.15, 0],
    summary:
      'Từ 2026 cánh trước có phần tử cử động được: mở phẳng ở chế độ Z-mode để giảm cản trên đoạn thẳng, khép lại ở X-mode để ôm cua.',
    subParts: [
      {
        id: 'main-plane',
        name: 'Tấm cánh chính',
        description: 'Phần tử cố định bám sát mũi xe, tạo nền tải khí động và dẫn dòng khí quanh bánh trước.',
        offset: [0.6, 0, 0],
      },
      {
        id: 'active-flaps',
        name: 'Cánh lật chủ động',
        description: 'Hai phần tử trên cùng đổi góc theo lệnh hệ thống active aero — thay thế vai trò DRS cũ.',
        offset: [0.3, 0.35, 0],
      },
      {
        id: 'endplates',
        name: 'Tấm chắn đầu cánh',
        description: 'Khép dòng khí ở hai mép cánh, kiểm soát xoáy quanh lốp trước.',
        offset: [0, 0.15, 0.8],
      },
    ],
  },
  {
    id: 'rear-wing',
    name: 'Cánh gió sau (không còn DRS)',
    hotspot: [-2.2, 0.85, 0],
    summary:
      'DRS biến mất từ 2026: toàn bộ cánh sau chuyển trạng thái chủ động cùng cánh trước, mở ra ở Z-mode cho tốc độ tối đa trên đoạn thẳng.',
    subParts: [
      {
        id: 'main-plane',
        name: 'Tấm cánh chính chủ động',
        description: 'Phần tử lớn đổi góc đồng bộ với cánh trước theo chế độ X/Z — không còn nắp DRS riêng lẻ.',
        offset: [-0.5, 0.4, 0],
      },
      {
        id: 'beam-wing',
        name: 'Cánh dầm dưới',
        description: 'Nối luồng khí từ bộ khuếch tán lên cánh chính, giữ dòng khí ổn định khi cánh đổi trạng thái.',
        offset: [-0.3, -0.25, 0],
      },
      {
        id: 'endplates',
        name: 'Tấm chắn hông cánh',
        description: 'Định hình xoáy đầu cánh và là điểm gắn kết cấu cho cơ cấu chấp hành active aero.',
        offset: [0, 0.2, 0.7],
      },
    ],
  },
  {
    id: 'floor-diffuser',
    name: 'Sàn xe & bộ khuếch tán',
    hotspot: [-0.4, 0.08, 0.55],
    summary:
      'Sàn 2026 phẳng hơn đáng kể: hiệu ứng mặt đất bị cắt giảm để xe bớt phụ thuộc downforce từ sàn và đua sát nhau dễ hơn.',
    subParts: [
      {
        id: 'floor-body',
        name: 'Thân sàn phẳng',
        description: 'Tấm composite chạy suốt gầm xe; quy định 2026 thu hẹp các kênh venturi của thế hệ trước.',
        offset: [0, -0.35, 0],
      },
      {
        id: 'floor-edges',
        name: 'Mép sàn & vây dẫn dòng',
        description: 'Kiểm soát luồng khí tràn vào gầm, yếu tố then chốt giữ ổn định khi xe chạy thấp.',
        offset: [0, -0.15, 0.7],
      },
      {
        id: 'diffuser',
        name: 'Bộ khuếch tán sau',
        description: 'Đoạn mở rộng ở đuôi sàn, "hút" xe xuống đường — nguồn downforce sạch nhất của xe.',
        offset: [-0.7, -0.1, 0],
      },
    ],
  },
  {
    id: 'sidepods',
    name: 'Hông xe (Sidepods)',
    hotspot: [0.1, 0.4, 0.65],
    summary:
      'Vừa là ống dẫn khí làm mát, vừa là công cụ điều hướng dòng khí về đuôi xe; xe 2026 hẹp hơn 10 cm nên hông xe càng phải gọn.',
    subParts: [
      {
        id: 'radiators',
        name: 'Két làm mát',
        description: 'Giải nhiệt cho ICE, hệ thống hybrid và hộp số; bài toán cân bằng giữa làm mát và lực cản.',
        offset: [0, 0.3, 0.5],
      },
      {
        id: 'inlets',
        name: 'Hốc gió',
        description: 'Miệng hút khí được tạo hình để né dòng khí rối từ bánh trước.',
        offset: [0.5, 0.15, 0.3],
      },
      {
        id: 'bodywork',
        name: 'Vỏ khí động',
        description: 'Bề mặt "undercut" dốc về đuôi, tăng tốc dòng khí qua thân sau của xe.',
        offset: [-0.3, 0, 0.7],
      },
    ],
  },
  {
    id: 'halo',
    name: 'Vòng bảo vệ Halo',
    hotspot: [0.6, 0.82, 0],
    summary:
      'Vòng titan chịu được tải trọng tương đương một chiếc xe buýt hai tầng, bảo vệ vùng đầu tay đua — bắt buộc từ 2018 và đã cứu nhiều mạng sống.',
    subParts: [
      {
        id: 'titanium-ring',
        name: 'Vòng titan chính',
        description: 'Ống titan hàn liền khối nặng ~7 kg, chịu tải tĩnh trên 12 tấn.',
        offset: [0, 0.5, 0],
      },
      {
        id: 'center-strut',
        name: 'Trụ giữa & chân gắn',
        description: 'Ba điểm liên kết truyền lực va chạm xuống khung monocoque.',
        offset: [0.4, 0.15, 0],
      },
    ],
  },
  {
    id: 'suspension',
    name: 'Hệ thống treo',
    hotspot: [1.7, 0.35, 0.4],
    summary:
      'Giữ lốp tiếp xúc mặt đường và giữ thăng bằng khí động cho sàn xe; các tay đòn cũng được tạo hình như cánh gió nhỏ.',
    subParts: [
      {
        id: 'wishbones',
        name: 'Tay đòn chữ A',
        description: 'Cặp càng carbon định vị bánh xe, biên dạng khí động để dẫn dòng khí sạch về thân sau.',
        offset: [0.3, 0.1, 0.6],
      },
      {
        id: 'pushrod',
        name: 'Thanh đẩy (pushrod)',
        description: 'Truyền chuyển động của bánh vào cụm lò xo-giảm chấn đặt trong thân xe.',
        offset: [0.1, 0.45, 0.3],
      },
      {
        id: 'dampers',
        name: 'Cụm giảm chấn trong thân',
        description: 'Lò xo xoắn và giảm chấn thủy lực giấu trong mũi xe, tinh chỉnh theo từng đường đua.',
        offset: [-0.2, 0.3, -0.3],
      },
    ],
  },
  {
    id: 'brakes',
    name: 'Hệ thống phanh',
    hotspot: [1.7, 0.33, 0.58],
    summary:
      'Đĩa carbon-carbon làm việc ở ~1000°C, giảm tốc từ 320 km/h xuống 80 km/h trong chưa đầy 3 giây; trục sau dùng brake-by-wire phối hợp với MGU-K.',
    subParts: [
      {
        id: 'carbon-disc',
        name: 'Đĩa phanh carbon',
        description: 'Đĩa carbon-carbon khoan hàng nghìn lỗ thông gió, chỉ ăn phanh khi đạt nhiệt độ làm việc.',
        offset: [0, 0, 0.6],
      },
      {
        id: 'caliper',
        name: 'Cùm phanh',
        description: 'Cùm nhôm 6 piston — mỗi xe chỉ được dùng tối đa theo quy định kích thước FIA.',
        offset: [0.3, -0.2, 0.4],
      },
      {
        id: 'brake-by-wire',
        name: 'Brake-by-wire trục sau',
        description: 'Máy tính pha trộn lực phanh thủy lực với lực hãm tái tạo của MGU-K 350 kW.',
        offset: [-0.4, 0.2, -0.3],
      },
    ],
  },
  {
    id: 'wheels-tires',
    name: 'Bánh xe & lốp',
    hotspot: [-1.8, 0.35, 0.8],
    summary:
      'Lốp Pirelli 18 inch; thế hệ 2026 hẹp hơn (bớt 25 mm trước, 30 mm sau) để giảm khối lượng và lực cản mà gần như không mất độ bám.',
    subParts: [
      {
        id: 'rim',
        name: 'Mâm 18 inch',
        description: 'Mâm magiê rèn theo chuẩn chung, tích hợp nắp đậy khí động bắt buộc.',
        offset: [0, 0, 0.5],
      },
      {
        id: 'tire',
        name: 'Lốp Pirelli',
        description: 'Dải hợp chất từ C1 (cứng) đến C6 (mềm); quản lý nhiệt độ lốp là chìa khóa chiến thuật.',
        offset: [0, 0.2, 0.9],
      },
      {
        id: 'sensors',
        name: 'Cảm biến áp suất & nhiệt',
        description: 'Đo áp suất và nhiệt độ thời gian thực, truyền về pit qua telemetry.',
        offset: [0.3, -0.15, 0.4],
      },
    ],
  },
  {
    id: 'gearbox',
    name: 'Hộp số',
    hotspot: [-1.75, 0.42, 0],
    summary:
      'Hộp số 8 cấp sang số liền (seamless-shift) trong vỏ carbon/titan, đồng thời là kết cấu chịu lực gắn hệ treo sau.',
    subParts: [
      {
        id: 'cassette',
        name: 'Lõi bánh răng 8 cấp',
        description: 'Cụm bánh răng thay nhanh, chuyển số dưới 5 phần nghìn giây không ngắt lực kéo.',
        offset: [-0.4, 0.1, 0],
      },
      {
        id: 'casing',
        name: 'Vỏ hộp số chịu lực',
        description: 'Vỏ carbon-titan nối liền động cơ với hệ treo sau — một phần của khung xe.',
        offset: [0, 0.4, 0.4],
      },
      {
        id: 'hydraulics',
        name: 'Cụm thủy lực',
        description: 'Điều khiển sang số, ly hợp và cả cơ cấu active aero với áp suất ~200 bar.',
        offset: [0.3, -0.25, -0.4],
      },
    ],
  },
  {
    id: 'cockpit',
    name: 'Khoang lái',
    hotspot: [0.8, 0.6, 0],
    summary:
      'Buồng lái sinh tồn bằng carbon nơi tay đua chịu tới 5G; vô-lăng 2026 có thêm nút Manual Override — "nước cờ" công suất điện để tấn công.',
    subParts: [
      {
        id: 'survival-cell',
        name: 'Khoang sinh tồn monocoque',
        description: 'Vỏ carbon nguyên khối đạt chuẩn va chạm FIA, lõi chống xuyên thủng bằng Zylon.',
        offset: [0, -0.3, 0],
      },
      {
        id: 'steering-wheel',
        name: 'Vô-lăng đa chức năng',
        description: 'Hơn 20 nút/núm xoay; từ 2026 có nút Manual Override kích hoạt thêm năng lượng điện khi bám đuổi.',
        offset: [0.4, 0.35, 0],
      },
      {
        id: 'seat-pedals',
        name: 'Ghế đúc & cụm pedal',
        description: 'Ghế đúc theo thân từng tay đua, tháo rời cùng người khi cứu hộ; pedal chỉnh theo milimét.',
        offset: [-0.3, 0.15, 0.3],
      },
    ],
  },
];

export function getCarComponent(id: string): CarComponent | undefined {
  return carComponents.find((c) => c.id === id);
}
