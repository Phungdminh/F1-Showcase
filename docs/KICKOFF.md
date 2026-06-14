# Prompt khởi động (dán nguyên đoạn dưới vào Claude Code)

```text
Đọc kỹ CLAUDE.md, docs/SPEC.md, docs/DESIGN.md và docs/MOTION.md (DESIGN.md là blueprint
giao diện bắt buộc, implement đúng từng class; MOTION.md là chuẩn transition bắt buộc —
không được hard cut ở bất kỳ chuyển cảnh nào).

Khởi tạo dự án tại thư mục hiện tại:
- npm create vite@latest . -- --template react-ts   (React 18 + TypeScript)
- Cài Tailwind CSS 3: npm install -D tailwindcss@3 postcss autoprefixer && npx tailwindcss init -p
- Cài thêm: react-router-dom lucide-react three @react-three/fiber @react-three/drei
  framer-motion gsap
- Tạo placeholder trong /public nếu chưa có: image.png (logo), Mask_group.jpg,
  Mask_group-1.jpg, Mask_group-2.jpg (ảnh tab tin nổi bật).

Sau đó thực hiện đúng quy trình các phase trong CLAUDE.md:

1. Dùng subagent f1-architect đọc docs/SPEC.md + docs/DESIGN.md và viết docs/PLAN.md.
   Trình bày tóm tắt PLAN cho tôi duyệt trước khi làm tiếp.
2. Sau khi tôi duyệt: chạy Phase 2 (f1-data-engineer dựng dữ liệu mùa 2026 + fetchers,
   song song f1-ui-developer dựng app shell + landing page khung theo DESIGN.md: hero 3 layer,
   divider chéo, section THE NEW ERA, section tab tin nổi bật).
3. Phase 3: f1-ui-developer dựng 4 mục (Đội đua, Lịch thi đấu, Tin tức, Bảng xếp hạng),
   f1-3d-specialist dựng 3 scene 3D (hero layer, car explorer, track viewer) theo contract
   trong PLAN.
4. Phase 4: f1-motion-designer implement trọn docs/MOTION.md: token system, PageTransition,
   từng cặp route trong bảng choreography (shared-element morph, back chạy ngược), rồi mới tới
   load sequence hero, reveal 11 đội theo màu, bản đồ thế giới, crossfade tab.
5. Phase 5: f1-qa-reviewer audit (bao gồm checklist tuân thủ DESIGN.md); sửa hết lỗi Critical
   rồi báo cáo kết quả theo acceptance walkthrough trong SPEC.md mục 8.

Sau mỗi phase: dừng lại, tóm tắt bằng tiếng Việt những gì đã làm và hỏi tôi trước khi sang
phase tiếp theo.
```

## Lệnh gọi agent thủ công (khi cần)

```text
Use the f1-architect subagent to update docs/PLAN.md for <thay đổi>.
Use the f1-ui-developer subagent to build the landing hero exactly per docs/DESIGN.md §1.
Use the f1-3d-specialist subagent to build the car component explorer.
Use the f1-qa-reviewer subagent to audit DESIGN.md compliance on the landing page.
Use the f1-motion-designer subagent to polish the team → driver shared-element transition.
Use the f1-qa-reviewer subagent to run the MOTION.md acceptance bar on all route pairs.
```

Hoặc gõ `/agents` trong Claude Code để xem và quản lý danh sách agent.
