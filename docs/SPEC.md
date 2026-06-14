# F1 Showcase 2026 — Functional Specification

> Single source of truth for all agents. Do not implement features that contradict this document.
> Season context: the live 2026 Formula 1 season (11 teams, new technical regulations).

## 0. Product summary

An animation-first showcase website for Formula 1. The hero is a full-viewport scene whose
main 3D animation is the star. A top navigation exposes four sections: **Teams**,
**Race Calendar**, **News**, **Standings**. The site is a deep, clickable exploration:
section → team → driver / car → individual car component.
Visual implementation follows **`docs/DESIGN.md`** (user-supplied, binding): React 18 + Vite +
Tailwind CSS 3, light hero `#FBFDFD`, diagonal divider, dark `#0F0F0F` sections.

---

## 1. Global layout

- **Hero (landing):** full-viewport light hero (`#FBFDFD`) whose main 3D animation occupies
  the right side per DESIGN.md §1 (desktop `w-[55%]`, mobile full-width at reduced opacity),
  with a video poster fallback. Must load fast (lazy mount, ≤ 2.5s to first meaningful render
  on a mid-range laptop). A diagonal SVG divider transitions into the dark sections.
- **Top navigation (inside the hero, per DESIGN.md):** four items, in this order:
  1. Teams (Danh sách các đội)
  2. Race Calendar (Lịch thi đấu các chặng)
  3. News (Tin tức chính)
  4. Standings (Bảng xếp hạng)
- The landing page also carries the "THE NEW ERA" season intro and the featured-tabs section
  (DESIGN.md §2–§3) fed by top news items.
- Content pages sit on dark `#0F0F0F`; each team page re-themes accents with that team's
  colors via CSS custom properties.

---

## 2. Teams section — interaction workflow

1. **Entry animation:** clicking "Teams" triggers a staggered reveal of **11 team cards**
   (2026 grid includes Cadillac). Each card has its own entrance animation flavored by the
   team's primary color (color sweep / glow / accent line — distinct per team, same system).
2. **Team detail (click a team):** shows
   - Engine / power unit name the team uses in 2026,
   - The car (model name + visual),
   - The team's **2 race drivers**.
3. **Driver detail (click a driver):** the driver's **2026-season-only** race history:
   round-by-round results (position, points, podiums, DNFs) for the current year.
   Rendered as a timeline/table sourced from the live data layer — never invented.
4. **Car / engine 3D explorer (click the car or engine):**
   - A high-quality 3D animation introducing the car's components.
   - Each component has an **arrow / hotspot label** pointing at it ("this is the front wing", …).
   - Clicking a component opens a **detail view of that component's internal construction**
     (exploded sub-parts + short technical explanation).
   - Minimum component set (2026 regs): power unit (ICE + MGU-K + energy store), front wing
     (active aero), rear wing (active aero — DRS is gone in 2026), floor / diffuser, sidepods,
     halo, suspension, brakes, wheels/tires, gearbox, cockpit.

## 3. Race Calendar section — interaction workflow

1. Clicking "Race Calendar" opens an **animated world map**.
2. **Upcoming rounds** are marked on the map (pulsing markers; past rounds dimmed/checked).
3. Hover / tap a marker → **preview card**: Grand Prix name, host country, circuit name, race date,
   round number. ("today" = runtime date; upcoming vs past is computed, not hardcoded.)
4. Clicking a marker → **3D track view**: the circuit rendered in 3D (extruded ribbon from the
   track's path coordinates), user can **rotate left/right** (orbit limited to azimuth + zoom),
   with start/finish marker, sector hints, and a short circuit fact panel.

## 4. News section

- Simple, editorial layout. **Most important stories pinned at the top** (bigger card),
  less important ones below in descending priority.
- Stories come from the data layer (fetched/curated), each with: title, summary, date,
  importance score, source link, optional image.

## 5. Standings section

- Simple table: **current Constructors' standings for the 2026 season to date**
  (position, team, points, wins) — fetched live, with a static cached fallback.
- Optional secondary tab: Drivers' standings (same data source). Keep it simple.

---

## 6. Data requirements (2026 season)

- 11 teams with: name, full name, base, team principal, primary/secondary hex colors,
  engine supplier, car model name, 2 drivers (name, number, country, headshot slot).
- 24-round calendar with: round, GP name, country, city, circuit, lat/lng, race date,
  track path coordinates (array of `[x, y]` or lat/lng points sufficient to draw the layout).
- Live sources: Jolpica-F1 (Ergast-compatible) for results/standings/schedule, OpenF1 for
  session data. All seed data must be verified against live sources at build time;
  standings/results/news are always runtime data, never frozen in components.

## 7. Non-functional requirements

- Stack: React 18 + Vite + TypeScript + Tailwind CSS 3 + lucide-react, system sans only
  (per DESIGN.md §0).
- 60fps target for animations; 3D code-split and lazy-loaded per route.
- `prefers-reduced-motion` fully respected (static fallbacks for every animation).
- Responsive down to 360px; 3D explorer degrades to labeled 2D diagram on weak devices (optional v2).
- Keyboard navigable; visible focus states; semantic landmarks.
- Vietnamese UI copy by default (site audience), English code/comments.

## 8. Acceptance walkthrough (must all pass)

1. Land on hero → light hero per DESIGN.md, 3D layer plays on the right, nav visible,
   diagonal divider leads into the dark "THE NEW ERA" section.
2. Teams → 11 cards animate in, each in its team color.
3. Click McLaren → engine "Mercedes", car name, Norris + Piastri shown.
4. Click Norris → 2026 rounds list with his result per round (live data).
5. Back → click the car → 3D car with arrowed hotspots → click "Front wing" → exploded
   construction detail of the front wing.
6. Calendar → world map animates in, future rounds pulsing; click next round's marker →
   preview (country + date) → open → 3D track rotates left/right.
7. News → important stories on top, clear hierarchy.
8. Standings → live 2026 constructors table.
