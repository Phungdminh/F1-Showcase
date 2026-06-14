# PLAN.md — Build plan (f1-architect, Phase 1)

> Derived strictly from docs/SPEC.md (product), docs/DESIGN.md (visuals, binding),
> docs/MOTION.md (transitions, binding), CLAUDE.md (phases/folders). Contracts in §3 are
> frozen after this phase. Ambiguities resolved in §7 Assumptions.

## 1. Route map (React Router 6, all routes `React.lazy`)

```
<App>                       — bg-black root, <PageTransition> wraps the outlet (MOTION §2)
├─ /                        landing: Hero(3D) + EraSection + FeaturedTabs
├─ /teams                   11-card grid
├─ /teams/:teamId           <TeamThemeBoundary> layout route → sets --team-primary/secondary
│   ├─ (index)              team detail: engine, car, 2 drivers
│   ├─ drivers/:driverId    driver 2026 round-by-round results
│   └─ car                  3D car component explorer (component detail = in-page panel)
├─ /calendar                animated world map, 24 round markers
├─ /calendar/:roundId       3D track viewer + circuit facts
├─ /news                    editorial list, importance-sorted
└─ /standings               constructors table (+ drivers tab)
```

Data strategy per route (data layer in `src/lib/api/`, seeds in `src/data/`):

| Route | Strategy |
|---|---|
| `/` | Seed (teams count, calendar → upcoming `Rxx`) + news via data layer (curated dataset, async interface). |
| `/teams`, `/teams/:teamId` | Seed-only (`teams.json`, verified in Phase 2). |
| `/teams/:teamId/drivers/:driverId` | Live Jolpica results · TTL 15 min · committed static fallback snapshot. |
| `/teams/:teamId/car` | Seed-only (`carComponents.json`). |
| `/calendar` | Seed `calendar.json`; past/upcoming computed at runtime vs `Date.now()`; live schedule verify TTL 24 h (non-blocking). |
| `/calendar/:roundId` | Seed-only (`circuits.json` incl. `pathPoints`). |
| `/news` | Curated committed dataset served through the same async fetch-shaped interface (live-swappable later). |
| `/standings` | Live Jolpica constructors + drivers · TTL 10 min · committed static fallback. |

Cache: in-memory map + localStorage, key = endpoint, TTL per table above; on any fetch/parse
error return fallback and flag `stale: true` for a subtle "dữ liệu lưu tạm" note.

## 2. Component tree per feature

Owners: **[UI]** f1-ui-developer · **[3D]** f1-3d-specialist · **[M]** f1-motion-designer.

**Shared — `src/components/`**
- `Navbar` [UI] — DESIGN §1 exactly (logo, 4 links, search, mobile Menu dropdown)
- `SectionDivider` [UI] — the exact polygon `0,0 0,120 1440,120 1440,80 920,80 680,0`
- `Eyebrow`, `Pill`, `PrimaryButton`, `DataTable` [UI] — DESIGN §4 typographic patterns
- `Skeleton` [M] — 150 ms appearance delay + 0.2 s pre-exit fade (MOTION §4)
- `motion/PageTransition`, `motion/Stagger`, `motion/RevealOnScroll` [M] — MOTION §2 primitives
- `ErrorFallback`, `StaleDataBadge` [UI]

**Landing — `src/features/landing/`** (mirrors DESIGN.md §1–§3 exactly)
- `LandingPage` [UI]
  - hero wrapper `.app-hero-wrapper`: z-0 fill → z-1 `HeroPoster` (video) [UI] +
    `Hero3DLayer` (lazy) [3D] → z-2 `Navbar` + `HeroSection` [UI] → z-3 `SectionDivider` [UI]
  - `HeroSection` [UI]: label, round number `R{nn}`, heading NEW RACING / UNIVERSE, CTAs,
    `HeroStat` (11 / Đội đua), avatar row + `22`, `HeroDescription` group
  - `EraSection` [UI] — DESIGN §2 (video left, THE NEW ERA right, 3 pills)
  - `FeaturedTabs` [UI] — DESIGN §3, fed by top-3 importance-5 news; tab crossfade [M]
  - Hero load set piece (poster→canvas crossfade on first frame, content rise/stagger) [M]

**Teams — `src/features/teams/`**
- `TeamsPage` [UI] → `TeamCard` ×11 [UI]; color-swept entrance stagger [M];
  card accent edge carries `layoutId="team-accent-{teamId}"`
- `TeamThemeBoundary` [UI] — layout route, writes CSS vars from seed hexes
- `TeamDetailPage` [UI]: `TeamHeader` (accent band, shared element), `EngineBlock`,
  `CarBlock` (`layoutId="car-thumb-{teamId}"`, links to `car`),
  `DriverCard` ×2 (`layoutId="driver-portrait-{driverId}"`)
- `DriverDetailPage` [UI]: `DriverHeader` (portrait morph target),
  `SeasonResultsTable` (typographic, DESIGN §4) — rows cascade +120 ms after header [M]
- `CarExplorerPage` [UI]: `#0F0F0F` stage, `CarExplorerScene` (lazy) [3D],
  `HotspotLabel` overlays (drei Html, eyebrow type) [3D render / UI style],
  `ComponentDetailPanel` [UI] — name, summary, exploded sub-parts list; open/close [M]

**Calendar — `src/features/calendar/`**
- `CalendarPage` [UI]: `WorldMap` (static simplified SVG, equirectangular) [UI],
  `RoundMarker` ×24 (pulse future / dim past) [M], `RoundPreviewCard`
  (`layoutId="round-card-{round}"`, SPRING) [UI+M], map draw-in animation [M]
- `RoundDetailPage` [UI]: `RoundHeader` (morph target), `TrackScene` (lazy) [3D],
  `CircuitFactPanel` [UI]; ribbon draw-in sequenced after route settle [M]

**News — `src/features/news/`**
- `NewsPage` [UI]: `PinnedStoryCard` (importance 5, large), `NewsList` descending
  importance; `RevealOnScroll` per card [M]

**Standings — `src/features/standings/`**
- `StandingsPage` [UI]: `StandingsTabs` (Constructors / Drivers) [UI, crossfade M],
  `ConstructorsTable`, `DriversTable` [UI]

**3D — `src/three/`** (props in, events out — never import page code)
`hero/HeroScene.tsx`, `car/CarExplorerScene.tsx`, `track/TrackScene.tsx`, shared
`src/three/lib/` (canvas defaults, dispose helpers, first-frame notifier).

## 3. Data contracts — `src/types/index.ts` (frozen)

```ts
export interface Team {
  id: string;                        // slug: "mclaren" — also Jolpica constructorId map key
  name: string; fullName: string; base: string; teamPrincipal: string;
  primaryColor: string; secondaryColor: string;   // hex, only consumed via CSS vars
  engineSupplier: string;            // 2026 PU
  carModel: string;
  driverIds: [string, string];
}
export interface Driver {
  id: string;                        // slug: "lando-norris" — maps to Jolpica driverId
  teamId: string; name: string; number: number;
  country: string;                   // display name (Vietnamese copy ok)
  headshotUrl: string | null;        // null → placeholder avatar
}
export interface DriverSeasonResult {
  round: number; raceName: string;
  position: number | null;           // null = DNF/DNS/NC
  points: number; podium: boolean; dnf: boolean;
  status: string;                    // raw API status text
}
export interface Race {
  round: number; name: string; country: string; city: string;
  circuitId: string; date: string;   // ISO 8601 race date
  lat: number; lng: number;          // marker position
}
export interface Circuit {
  id: string; name: string; lengthKm: number; laps: number;
  facts: string[];                   // fact-panel lines
  pathPoints: [number, number][];    // normalized [x,y] centerline, ≥ 64 pts, closed loop
  startFinishIndex: number;          // index into pathPoints
  sectorBreaks: [number, number];    // pathPoints indices for sector hints
}
export interface CarSubPart {
  id: string; name: string; description: string;
  offset: [number, number, number];  // exploded-view displacement
}
export interface CarComponent {
  id: string;                        // "front-wing", "power-unit", … (11 ids, SPEC §2.4)
  name: string;                      // Vietnamese label
  hotspot: [number, number, number]; // scene-space anchor
  summary: string;
  subParts: CarSubPart[];            // ≥ 2 per component
}
export interface NewsItem {
  id: string; title: string; summary: string; date: string;
  importance: 1 | 2 | 3 | 4 | 5;
  sourceUrl: string; imageUrl?: string; category?: string;  // tab kicker
}
export interface ConstructorStanding {
  position: number; teamId: string; teamName: string; points: number; wins: number;
}
export interface DriverStanding {
  position: number; driverId: string; driverName: string; teamId: string;
  points: number; wins: number;
}
```

API surface (`src/lib/api/`): `client.ts` → `fetchWithCache<T>(key, url, ttlMs, fallback: T,
parse): Promise<{data: T; stale: boolean}>`; `jolpica.ts` → `getDriverSeasonResults(driverId)`,
`getConstructorStandings()`, `getDriverStandings()`, `getSchedule()`. `openf1.ts` reserved (v2).

Motion contracts (also frozen): `src/lib/motion.ts` exports MOTION §1 verbatim
(`DUR EASE SPRING RISE STAGGER`) + `useReducedMotionSafe()` + `useNavDirection()`;
layoutIds: `team-accent-{teamId}` · `driver-portrait-{driverId}` · `car-thumb-{teamId}` ·
`round-card-{round}`.

## 4. 3D scene briefs (all: transparent-capable canvas, DPR clamp [1, 1.75], no realtime
shadows, dispose on unmount, `onFirstFrame()` callback for poster crossfade — MOTION §4)

**HeroScene** — stylized procedural low-poly F1 car + speed streak particles on light field
matching `#FBFDFD`. Camera: persp fov 35 at ~[4, 1.2, 6], slow autonomous drift; optional
±2° pointer parallax; **no user controls**. Events: `onFirstFrame()`. Budget: ≤ 50 draw
calls, ≤ 60 k tris. Fallback: DESIGN §1 poster video; reduced motion → poster only (frozen).

**CarExplorerScene** — procedural car assembled as one named group per `CarComponent.id`
(11 groups); optional GLB drop-in `public/models/car.glb` using the same node names.
Camera: fov 40 at [3.5, 1.6, 4.5] target [0, 0.4, 0]; OrbitControls: polar 0.2–1.4 rad,
distance 2.5–7, no pan. Hotspots: drei `Html` arrow labels at `hotspot` positions. Select:
camera glide (`EASE.move`, `DUR.set`) to component, others fade to 15 % opacity; sub-parts
animate to `offset` (exploded view). Events: `onComponentSelect(id)`,
`onFocusSettled(id)`, `onFirstFrame()`. Props: `components: CarComponent[]`,
`selectedId: string | null`, `accentColor: string`. Budget: ≤ 120 draw calls, ≤ 150 k tris.
Fallback: car poster image; reduced motion → static view, hotspots remain clickable.

**TrackScene** — ribbon extruded along CatmullRom curve from `pathPoints` (closed), start/
finish gantry at `startFinishIndex`, sector tick marks, faint ground disc. Camera: fov 45,
3/4 high view; OrbitControls **azimuth-only feel**: polar locked 0.9–1.15 rad, zoom 8–30,
no pan (SPEC §3.4 "rotate left/right + zoom"). Props: `circuit: Circuit`,
`drawProgress: 0–1` (motion-designer sequences the draw-in after route settle, MOTION §3).
Events: `onFirstFrame()`. Budget: ≤ 40 draw calls, ≤ 80 k tris. Fallback: 2D SVG outline
poster; reduced motion → `drawProgress = 1` instantly.

## 5. Task list (ordered; phases per CLAUDE.md; parallel only within a phase)

| # | Owner | Ph | Task | Inputs → Outputs | Done when |
|---|---|---|---|---|---|
| T1 | data-engineer | 2 | Types | §3 → `src/types/index.ts` | Compiles strict; exports match §3 verbatim. |
| T2 | data-engineer | 2 | Seeds | SPEC §6, live verify → `src/data/{teams,calendar,circuits,carComponents,news}.json` | 11 teams / 24 rounds / 11 components ×≥2 subParts typed-validate; facts verified vs Jolpica. |
| T3 | data-engineer | 2 | API layer | §3 surface → `src/lib/api/*`, `src/data/fallbacks/*` | Typed results online; offline returns fallback with `stale: true`. |
| T4 | motion-designer | 2 | Motion tokens + primitive stubs | MOTION §1–2 → `src/lib/motion.ts`, `src/components/motion/*` (pass-through stubs) | Tokens verbatim; hooks exist; app renders through stubs. |
| T5 | ui-developer | 2 | App shell + router | §1 → `App.tsx`, lazy routes, placeholders, `TeamThemeBoundary` | All 9 routes render; three.js absent from landing chunk. |
| T6 | ui-developer | 2 | Landing skeleton | DESIGN §1–3 → `src/features/landing/*` | Hero layers/classes, divider polygon, Era, FeaturedTabs match DESIGN class-for-class (poster video, no 3D yet). |
| T7 | ui-developer | 3 | Teams grid | T2 → `TeamsPage`, `TeamCard` | 11 cards, accent edge element present with layoutId. |
| T8 | ui-developer | 3 | Team detail | T2 → `TeamDetailPage` | Engine + car + 2 drivers from seed; accents via CSS vars only. |
| T9 | ui-developer | 3 | Driver detail | T3 → `DriverDetailPage` | Live 2026 rounds render; offline shows fallback + badge. |
| T10 | ui-developer | 3 | Calendar map | T2 → `CalendarPage`, `WorldMap`, markers, preview card | 24 markers from lat/lng; upcoming/past computed at runtime; preview shows GP/country/circuit/date/round. |
| T11 | ui-developer | 3 | News page | T2/T3 → `NewsPage` | Importance-5 pinned large on top, rest descending. |
| T12 | ui-developer | 3 | Standings | T3 → `StandingsPage` | Live constructors (+drivers tab) table, typographic per DESIGN §4, fallback works. |
| T13 | 3d-specialist | 3 | HeroScene | §4 → `src/three/hero/*` + landing wiring | Brief met; `onFirstFrame` fires; budget held; poster fallback intact. |
| T14 | 3d-specialist | 3 | CarExplorerScene | T2, §4 → `src/three/car/*` | 11 hotspots; select event + exploded sub-parts work; budget held. |
| T15 | ui-developer | 3 | Car explorer page | T14 → `CarExplorerPage`, `ComponentDetailPanel` | Click hotspot → panel with construction detail; acceptance §8.5 path works unstyled-motion. |
| T16 | 3d-specialist | 3 | TrackScene | T2, §4 → `src/three/track/*` + `RoundDetailPage` wiring | Ribbon from `pathPoints`; orbit limits enforced; `drawProgress` prop drives draw. |
| T17 | motion-designer | 4 | PageTransition for real | MOTION §2,4,5 → direction-aware transitions, scroll rules, lazy-hold | No blank frame on any route change; back reverses; scroll rules pass. |
| T18 | motion-designer | 4 | Route choreography | MOTION §3 → all 7 pairs incl. 4 shared-element morphs | Each §3 row plays forward + reverse; morphs land within ~1 px. |
| T19 | motion-designer | 4 | Set pieces | → hero load sequence, 11-card color-swept stagger, map draw-in + marker pulse, tab crossfades, results cascade | MOTION §3 landing/tab rows + SPEC §2.1/§3.1 entrances pass at 60 fps. |
| T20 | motion-designer | 4 | Skeleton + reduced motion pass | MOTION §4,6 → `Skeleton` timing, global RM collapse | 150 ms rule holds; RM = crossfades only, nothing breaks. |
| T21 | qa-reviewer | 5 | Static audit | → report | `npm run build` + lint clean; DESIGN class-level diff audit; no team hex outside CSS vars. |
| T22 | qa-reviewer | 5 | Acceptance run | SPEC §8 + MOTION §8 → report | All 8 + 8 checks pass; perf/a11y (focus, landmarks, 360 px) verified; no Critical findings. |

## 6. Risks (top 5)

1. **3D asset weight/quality** — no car model exists. → Procedural primitive builds first
   (briefs §4 sized for it); optional GLB drop-in at `public/models/car.glb` with fixed node
   names; budgets enforced at T13/T14/T16 review.
2. **Live API instability** (Jolpica rate limits/CORS/downtime mid-demo). → Every live call
   goes through `fetchWithCache` with committed fallback snapshots; UI renders fallback +
   stale badge, never blocks or invents data.
3. **2026 facts drift** (lineups, regs details in seeds). → T2 verifies seeds against live
   schedule/standings at build time; facts live only in `src/data/`, never in components.
4. **Shared-element morphs across lazy chunks** (jump/blank between `/teams` ↔ detail). →
   MOTION §4 exit-hold until chunk resolves (≤ 300 ms) implemented in T17 before T18;
   QA gate = MOTION §8.3.
5. **Canvas + route transition jank** (R3F rendering during Framer exits). → `frameloop`
   demand/paused during transitions, DPR clamp, transform/opacity-only animation, 3D mounted
   only on its routes; measured in T22 against 4× CPU throttle reasoning.

## 7. Assumptions (recorded per architect rules)

- Component construction detail (SPEC §2.4) is an **in-page panel** on `/teams/:teamId/car`,
  not a deeper route — simplest reading; deep-linking a component is out of scope v1.
- Clicking either the **car or the engine** on team detail routes to `/teams/:teamId/car`;
  the power unit is component `power-unit` inside the explorer.
- **News** has no sanctioned live API in SPEC §6, so v1 ships a curated, fact-checked
  dataset behind the same async data-layer interface (live-swappable without UI change).
- **World map** is a bundled simplified equirectangular SVG with lat/lng→x/y projection —
  no mapping library.
- Drivers' standings tab (SPEC §5 "optional") is **included** — same endpoint, near-zero cost.
- Hero round number `R{nn}` = first calendar round with `date ≥ today`, zero-padded.
- Seed slugs (`teamId`, `driverId`) are canonical; a lookup field maps them to Jolpica IDs.
