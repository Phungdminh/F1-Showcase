# CLAUDE.md — F1 Showcase 2026 (Multi-agent build)

You are the **orchestrator** for this project. Specialized subagents live in `.claude/agents/`.
Required reading before any work: `docs/SPEC.md` (what the product does), `docs/DESIGN.md`
(how it looks — binding, class-level blueprint supplied by the user), and `docs/MOTION.md`
(how it moves — binding transition standard; no hard cuts anywhere). The architect's plan
lives in `docs/PLAN.md` once created.

## Language
- Talk to the user in **Vietnamese**.
- Code, comments, commit messages, and file/identifier names in **English**.

## Tech stack (fixed by the user's design prompt — do not change)
- **React 18 + Vite + TypeScript + Tailwind CSS 3** · icons: **lucide-react** · no custom fonts
- Routing: React Router (route-level code splitting via `React.lazy`)
- 3D: React Three Fiber + @react-three/drei (three.js)
- Motion: Framer Motion for UI/route transitions, GSAP (+ScrollTrigger) for orchestrated timelines
- Data: static seed JSON in `src/data/` + browser fetchers (Jolpica-F1 / OpenF1) with an
  in-memory + localStorage cache (TTL per endpoint) and committed static fallbacks

## Delegation map — who does what
| Task | Subagent |
|---|---|
| Planning, task breakdown, contracts between modules | `f1-architect` |
| 2026 season data, types, API fetchers, track coordinates | `f1-data-engineer` |
| Hero 3D layer, car component explorer, 3D track viewer | `f1-3d-specialist` |
| Landing sections, pages, nav, design-system per DESIGN.md | `f1-ui-developer` |
| Transitions per MOTION.md, reveals, map animation, micro-interactions | `f1-motion-designer` |
| Review, build/type checks, perf & a11y & DESIGN-compliance audit | `f1-qa-reviewer` |

Delegate by description automatically, or explicitly: `Use the f1-3d-specialist subagent to …`.

## Build phases (run in order; parallelize only within a phase)
1. **Plan** — `f1-architect` reads `docs/SPEC.md` + `docs/DESIGN.md`, writes `docs/PLAN.md`
   (routes, component tree, data contracts, task list). Wait for user approval before Phase 2.
2. **Foundation** — `f1-data-engineer` creates `src/types/`, `src/data/` seeds, fetchers.
   In parallel, `f1-ui-developer` scaffolds the app shell, Tailwind setup, the landing page
   skeleton (Hero + divider + Era + Featured tabs per DESIGN.md), navigation, empty routes.
3. **Sections** — `f1-ui-developer` builds Teams / News / Standings / Calendar pages against
   the data contracts; `f1-3d-specialist` builds the three 3D scenes behind the agreed props
   interfaces (never import page code into 3D modules — only props in, events out).
4. **Motion pass** — `f1-motion-designer` implements `docs/MOTION.md` end to end: the
   `src/lib/motion.ts` tokens, `<PageTransition>` shell, every route pair in the choreography
   map, then entrances/staggers site-wide.
5. **QA** — `f1-qa-reviewer` audits; orchestrator applies fixes; repeat until clean.

After each phase: run `npm run build && npm run lint`, summarize changed files to the user
in Vietnamese, and ask before moving to the next phase.

## Hard rules (apply to every subagent)
- **MOTION.md is binding for every transition.** No route change, tab switch, panel open, or
  3D state change may hard-cut. All timing/easing comes from the shared tokens in
  `src/lib/motion.ts`; shared-element `layoutId` names follow MOTION.md §2 exactly.
- **DESIGN.md is binding.** Sections, layers, z-indexes, Tailwind classes, the diagonal divider
  polygon, and the custom CSS block are implemented as written — no aesthetic substitutions.
- **Never invent live sports data.** Current standings, race results, and news come from the
  data layer (live fetch with cached fallback). Seed data covers pre-season 2026 facts
  (teams, drivers, engines, calendar) and must still be verified.
- All 3D modules are lazy-loaded (`React.lazy` + `<Suspense>`) with a poster/skeleton fallback;
  three.js must never appear in the initial landing chunk. Dispose geometries/materials on unmount.
- Every animation has a `prefers-reduced-motion` fallback.
- Team colors flow through CSS custom properties (`--team-primary`, `--team-secondary`) set at
  the team-route boundary — components never hardcode team hexes. The landing page stays neutral.
- One feature = one folder under `src/features/` (landing, teams, calendar, news, standings).
  Shared UI in `src/components/`, 3D in `src/three/`, data in `src/data/` + `src/lib/api/`.
- Subagents return a short report: what changed, file list, contracts touched, open questions.
- Keep diffs focused; no drive-by refactors outside the assigned task.

## Definition of done
The acceptance walkthrough in `docs/SPEC.md §8` passes end-to-end, the landing page matches
`docs/DESIGN.md` section by section, `npm run build` is clean, and `f1-qa-reviewer` reports
no Critical findings.
