# DESIGN.md — Visual blueprint (binding)

> Extracted from the user's landing-page prompt and mapped onto the F1 showcase.
> `SPEC.md` says **what** the product does; this file says **how it looks**, down to the class
> level. When the two seem to conflict on visuals, DESIGN.md wins. Do not "improve" the
> aesthetic — implement it.

## 0. Stack & global rules (from the prompt — fixed)
- React 18 + **Vite** + TypeScript + **Tailwind CSS 3** + **lucide-react** for all icons.
- **No custom fonts** — Tailwind default system sans-serif stack.
- Root page background: `bg-black`. Hero is light `#FBFDFD`; content sections are dark `#0F0F0F`.
- Text colors from Tailwind neutrals: on light — `text-neutral-900/600/500/400`;
  on dark — `text-white`, `text-neutral-300/400/500`.
- F1 addition: team colors enter **only** through CSS vars `--team-primary` / `--team-secondary`
  on team-scoped pages; the landing page stays strictly neutral.

> ⚠️ **SUPERSEDED (2026-06-13, user direction).** The landing page `/` has been
> redesigned as a **dark parallax one-pager** that showcases all four categories
> (Teams · Calendar · News · Standings) with scroll-driven motion and cinematic
> parallax route transitions — style ref: findrealestate.com. The light hero, the
> 3D `HeroScene` layer, and the cloudfront videos described in §1–§3 below are
> **removed from the landing**. Implementation: `src/features/landing/` (LandingPage
> + `sections/*` + `useParallax`). The diagonal divider polygon (§1) and the
> typographic system (eyebrows `tracking-[0.3em]`, `font-light` display, team-color
> CSS vars) remain in force across the inner pages. §1–§3 are kept below for history.

## 1. HERO (Section 1 — full viewport, light) — superseded, see note above

Wrapper: relative container, class `app-hero-wrapper`, `overflow-hidden`.
Mobile `min-height: 100vh`; from `md:` → `height: 100vh; min-height: auto` (see §6 CSS).

Layers by z-index:
- **z-0:** solid fill `#FBFDFD`, `absolute inset-0`.
- **z-1 — the 3D layer (replaces the prompt's video):** `absolute right-0 top-0 bottom-0`;
  mobile `w-full opacity-30`, desktop `md:w-[55%] opacity-100`. The R3F canvas is transparent
  (`gl={{ alpha: true }}`) and composes like `object-cover object-top`. Container + canvas carry
  class `video-plus-darker` (mix-blend-mode: normal !important).
  **Fallback/poster while 3D loads (and reduced-motion fallback):** the prompt's video —
  `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131232_feeda0b7-d00d-4bfa-a9d5-5d38648a4214.mp4`
  with `autoPlay loop muted playsInline`, same positioning.
- **z-2 — content:** `relative min-h-screen md:h-screen flex flex-col` → Navbar + HeroSection.

### Navbar (inside content layer)
- `relative z-10 flex justify-between px-5 py-4 md:px-12 md:py-6`.
- Left: logo `/image.png` (`h-7 md:h-8`), then desktop-only links with `gap-12` from the logo:
  **Đội đua · Lịch thi đấu · Tin tức · Bảng xếp hạng** (the 4 SPEC sections) —
  `text-sm text-neutral-500 hover:text-neutral-900`.
- Right (desktop): search input `rounded-full w-72 border border-neutral-300 text-neutral-600`,
  placeholder `"Tìm đội, tay đua..."`, lucide `Search` icon absolute-right inside.
- Mobile: lucide `Menu` in a 40px circle `border-neutral-300`; toggled dropdown = vertical links
  + full-width search.

### HeroSection (flex-1)
- `relative z-10 flex-1 flex flex-col justify-between px-5 pt-8 pb-20 md:px-12 md:pt-16 md:pb-36`
  (the big bottom padding keeps content clear of the diagonal divider).
- Top label: `Mùa giải 2026` — `text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase`.
- Heading row: small number left (`text-sm text-neutral-400 mt-2 md:mt-4`) = **upcoming round**,
  zero-padded from the data layer (e.g. `R09`); then the display heading
  `text-[2.75rem] md:text-[5.5rem] leading-[0.95] font-light tracking-tight text-neutral-900`:
  line 1 `NEW RACING`, line 2 `UNIVERSE`.
- Under heading: primary button `Khám phá đội đua`
  (`bg-neutral-900 text-white text-sm font-medium rounded px-6 py-3 md:px-8 md:py-3.5`)
  + text link `Xem lịch thi đấu`.
- Middle stat (class `hero-stat-group`, §6): value `11` with label `Đội đua` underneath —
  same scale treatment as the prompt's `47.2% / Reality`.
- Bottom bar: `flex flex-col md:flex-row md:justify-between`.
  - Left: label `Các tay đua 2026` + 4 overlapping driver avatars
    (`-space-x-2`, each `w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-neutral-100
    object-cover`; Pexels placeholders 415829 / 1222271 / 1239291 / 2379004 at `w=100` until
    real headshots land) + text `22`.
  - Right (class `hero-description-group`, §6): lucide `Link` icon in a
    `w-10 h-10 md:w-12 md:h-12` circle `border-neutral-300`, beside copy
    `"Bước vào vũ trụ F1 2026 — kỷ nguyên động cơ mới, 11 đội đua và 24 chặng khắp hành tinh."`
    (`text-xs md:text-sm text-neutral-500 max-w-[200px] md:max-w-sm`).

### Diagonal SectionDivider (inside the hero wrapper, not after it)
- `absolute bottom-0 left-0 w-full`, `z-index: 3`.
- SVG `viewBox="0 0 1440 120" preserveAspectRatio="none"`, height `h-[60px] md:h-[120px]`,
  single polygon `points="0,0 0,120 1440,120 1440,80 920,80 680,0"` fill `#0F0F0F`.
- This exact polygon is the site's signature transition. Reuse it (or its mirror) sparingly
  between major page sections elsewhere.

## 2. "THE NEW ERA" section (the prompt's About pattern → 2026 season intro)
- Full width, `backgroundColor: #0F0F0F`; `lg:flex-row` (stacked mobile), min-h `600px`
  (`lg:` 700px).
- Left: media filling the column — the prompt's video
  `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_132809_d6ea910f-d700-44f7-afea-27d517487177.mp4`
  (`object-cover mix-blend-lighten`, autoplay/loop/muted/playsInline; mobile `h-[400px]`).
  May later be swapped for season footage or an ambient 3D loop — same treatment.
- Right column: `px-8 py-16 md:px-16 lg:px-20 xl:px-28`, vertically centered, `max-w-lg`:
  - Label `Về mùa giải` — `text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase
    mb-8 md:mb-10`.
  - Heading `THE NEW ERA` — `text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light
    tracking-tight text-white leading-[1.05] mb-10 md:mb-12`.
  - Pills `Hybrid 50/50` · `Active Aero` · `11 đội` — `px-5 py-2 rounded-full border
    border-neutral-700 text-sm text-neutral-300 hover:border-neutral-500`.
  - Paragraph (own words, 1–2 câu về kỷ nguyên 2026) — `text-sm md:text-base text-neutral-400
    leading-relaxed max-w-md`.
  - Actions: button `Tìm hiểu thêm` (`bg-neutral-800 text-white text-sm font-medium rounded
    px-7 py-3.5 hover:bg-neutral-700`) + `Xem video` link with lucide `Play` in a `w-10 h-10`
    bordered circle.

## 3. Featured tabs section (the prompt's Insights pattern → tin nổi bật)
- Same `#0F0F0F`; `px-8 md:px-16 lg:px-20 xl:px-28 pt-24 pb-32`.
- Mega heading, italic: `LIMITLESS SPEED ON THE GRID` — `text-4xl sm:text-5xl md:text-6xl
  lg:text-7xl xl:text-[5rem] font-light italic tracking-tight text-white leading-[1.05]
  max-w-5xl mb-20 md:mb-28`.
- Flex `flex-col lg:flex-row`. Left: vertical tab buttons, `lg:w-[160px] xl:w-[200px]`;
  active `text-white font-medium`, inactive `text-neutral-500 hover:text-neutral-300`.
  Tabs = the **3 top news stories** (importance 5) from the data layer, labeled by category
  or short kicker.
- Right: image + text side by side on desktop. Image `lg:w-[420px] xl:w-[480px] aspect-[4/3]
  rounded-2xl overflow-hidden` (placeholders `/Mask_group.jpg`, `/Mask_group-1.jpg`,
  `/Mask_group-2.jpg` until story art exists). Text: title `text-2xl md:text-3xl font-light
  text-white leading-snug max-w-sm`; summary `text-sm md:text-base text-neutral-400
  leading-relaxed max-w-sm`; `Đọc thêm` underlined link `text-sm text-white font-medium
  underline underline-offset-4`; bottom row date + source separated by `border-t
  border-neutral-800`. Links route into `/news`.

## 4. Inner pages (Teams / Calendar / News / Standings) — applying the language
- All inner pages sit on `#0F0F0F` with the same label / heading / pill / tab patterns above;
  generous whitespace, `font-light` display type, `tracking-[0.3em]` uppercase eyebrows.
- Team pages: identical patterns, but accents (pill borders on hover, active states, stat
  numerals, hotspot highlights) read `var(--team-primary)`. Nothing else changes.
- Tables (standings, driver results) stay typographic: thin `border-neutral-800` rules,
  no card chrome.
- The 3D car explorer and track viewer render on `#0F0F0F` stages with the same eyebrow/label
  system for hotspot text.

## 5. Assets checklist (in `/public`)
- `/image.png` — logo (drop in a real one; agents may generate a simple wordmark placeholder).
- `/Mask_group.jpg`, `/Mask_group-1.jpg`, `/Mask_group-2.jpg` — featured-tab images.
- Driver/team imagery as it becomes available; Pexels avatar URLs are temporary.
- `public/models/car.glb` — optional real car model for the 3D explorer.

## 6. Custom CSS (verbatim — put in `src/index.css`)
```css
.video-plus-darker { mix-blend-mode: normal !important; }

.app-hero-wrapper { min-height: 100vh; overflow: hidden; }
@media (min-width: 768px) {
  .app-hero-wrapper { min-height: auto; height: 100vh; }
}

.hero-description-group { margin-right: 0; }
.hero-stat-group { margin-right: 0; }
@media (min-width: 768px) {
  .hero-description-group { margin-right: 50%; }
  .hero-stat-group { margin-right: 20%; }
}
```
(Hero stat group: desktop also `justify-center`, mobile `justify-start`, per the prompt.)
