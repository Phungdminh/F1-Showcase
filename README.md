# 🏎️ F1 Showcase 2026 — Bộ Agent Setup cho Claude Code

Bộ cấu hình multi-agent để Claude Code tự xây website showcase F1 theo ý tưởng của bạn,
**áp đúng design prompt landing page bạn cung cấp**: hero nền sáng `#FBFDFD` với layer 3D
chiếm 55% bên phải, divider SVG chéo, các section tối `#0F0F0F`, typography `font-light` +
label `tracking-[0.3em]`, icon lucide-react, không custom font.

## Cấu trúc

```
f1-showcase-agents/
├── CLAUDE.md                      ← Luật chơi + quy trình điều phối (orchestrator đọc file này)
├── .claude/
│   └── agents/
│       ├── f1-architect.md        ← Kiến trúc sư: lập PLAN, chia task, định contract
│       ├── f1-data-engineer.md    ← Dữ liệu mùa 2026: 11 đội, lịch 24 chặng, API live
│       ├── f1-3d-specialist.md    ← 3D: hero layer, car explorer (mũi tên + nổ chi tiết), track 3D
│       ├── f1-ui-developer.md     ← UI: landing theo DESIGN.md + 4 mục chính, theme màu đội
│       ├── f1-motion-designer.md  ← Animation: load sequence hero, reveal 11 đội, bản đồ, tab
│       └── f1-qa-reviewer.md      ← Kiểm thử: build, hiệu năng, a11y, tuân thủ DESIGN.md
└── docs/
    ├── SPEC.md                    ← Đặc tả tính năng (web làm được gì)
    ├── DESIGN.md                  ← Blueprint giao diện từ prompt của bạn (trông như thế nào)
    ├── MOTION.md                  ← Chuẩn transition bắt buộc (chuyển động như thế nào)
    └── KICKOFF.md                 ← Prompt khởi động để dán vào Claude Code
```

## Tech stack (khớp prompt của bạn)

React 18 + **Vite** + TypeScript + **Tailwind CSS 3** + **lucide-react** · React Router ·
React Three Fiber + drei (3D) · Framer Motion + GSAP (animation) · dữ liệu live từ
Jolpica-F1 / OpenF1 có cache + fallback tĩnh.

## Cách dùng (3 bước)

1. **Copy toàn bộ nội dung thư mục này** vào thư mục gốc dự án (thư mục trống cũng được —
   Claude Code sẽ tự khởi tạo Vite).
2. Mở terminal tại thư mục đó và chạy `claude` (cài Claude Code trước:
   `npm install -g @anthropic-ai/claude-code`, yêu cầu Node.js 18+).
3. Mở `docs/KICKOFF.md`, **copy khối prompt** trong đó và dán vào Claude Code. Claude sẽ tự
   điều phối 6 agent theo 5 phase, dừng lại hỏi bạn sau mỗi phase.

## Prompt của bạn được map vào dự án như thế nào

- **Video nền hero (bên phải, w-55%)** → layer **animation 3D chính** (canvas trong suốt,
  cùng vị trí/kích thước); video gốc giữ làm poster fallback khi 3D đang tải.
- **Nav links Home/About/Services/Contact** → 4 mục của bạn: **Đội đua · Lịch thi đấu ·
  Tin tức · Bảng xếp hạng** (giữ nguyên style + search + hamburger mobile).
- **Heading "NEW DIGITAL UNIVERSE" + số "05"** → "NEW RACING / UNIVERSE" + số chặng sắp tới
  (vd `R09`) lấy từ data layer.
- **Stat "47.2% / Reality"** → "11 / Đội đua"; **avatar "Trusted by Clients"** → 4 tay đua + "22".
- **Section About (tối, video trái)** → "THE NEW ERA": giới thiệu mùa 2026, pills
  `Hybrid 50/50 · Active Aero · 11 đội`.
- **Section Insights (tab)** → 3 tin tức quan trọng nhất (importance 5), link vào trang /news.
- **Divider chéo (polygon `0,0 0,120 1440,120 1440,80 920,80 680,0`)** → giữ nguyên 100%,
  là chữ ký chuyển cảnh của site.
- Các trang trong (Đội đua, Lịch, Tin tức, BXH) dùng nền `#0F0F0F` + đúng hệ pattern đó;
  màu đội chỉ vào qua CSS vars `--team-primary`.

Chi tiết từng class nằm trong `docs/DESIGN.md` — agent bị ràng buộc làm đúng theo đó.

## Chuẩn transition (docs/MOTION.md)

Mọi chuyển trang / chuyển tab / mở panel / đổi trạng thái 3D đều **bắt buộc có transition** —
không được cắt cứng (hard cut) ở bất kỳ đâu. MOTION.md định nghĩa: bộ token thời lượng & easing
dùng chung, bảng choreography cho từng cặp route (vd: bấm card đội → dải màu đội morph thành
header trang đội; bấm marker lịch đua → preview card morph thành header trang đường đua),
quy tắc back phải chạy ngược lại, skeleton không được nháy, canvas 3D không bao giờ hiện
khung đen trống, và 8 tiêu chí nghiệm thu transition mà f1-qa-reviewer sẽ kiểm từng cái.

## Tùy chỉnh nhanh

- **Đổi model cho agent:** sửa `model:` trong frontmatter (`opus` / `sonnet` / `haiku` /
  `inherit`). Mặc định: architect `opus`, reviewer `sonnet`, còn lại `inherit`. Nếu gói của
  bạn không có Opus, đổi `f1-architect` sang `inherit`.
- **Đổi nội dung chữ trên hero / section:** sửa trực tiếp trong `docs/DESIGN.md`.
- **Có model xe 3D thật (.glb)?** Thả vào `public/models/car.glb` — car explorer tự dùng.
- **Logo & ảnh:** thay `/public/image.png` và `/public/Mask_group*.jpg` bằng ảnh thật của bạn.

## Lưu ý quan trọng

- Dữ liệu **bảng xếp hạng, kết quả từng chặng, tin tức** luôn fetch trực tiếp
  (Jolpica-F1 / OpenF1) — agent bị cấm bịa số liệu mùa giải đang diễn ra.
- Mọi animation có nhánh `prefers-reduced-motion`; 3D lazy-load nên trang vẫn nhẹ.
- Tài liệu chính thức về subagents: https://code.claude.com/docs/en/sub-agents
