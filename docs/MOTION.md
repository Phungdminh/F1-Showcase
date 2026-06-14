# MOTION.md — Transition & Motion Standard (binding)

> How the site **moves**. SPEC.md = what it does, DESIGN.md = how it looks, MOTION.md = how it
> transitions. Owned by `f1-motion-designer`; consumed by every agent. The bar: **no hard cut
> anywhere** — every route change, tab switch, panel open, and 3D state change is choreographed.

## 1. Tokens — single source in `src/lib/motion.ts`
```ts
export const DUR  = { fast: 0.2, base: 0.32, slow: 0.5, set: 0.9 };        // seconds
export const EASE = {
  out:   [0.16, 1, 0.3, 1],     // entrances (expo-out feel)
  in:    [0.5, 0, 0.75, 0],     // exits — always quicker + sharper than entrances
  move:  [0.83, 0, 0.17, 1],    // shared elements & camera glides
};
export const SPRING = { stiffness: 260, damping: 24 };                      // preview cards
export const RISE   = { hero: 16, section: 24, max: 32 };                   // px
export const STAGGER = { cards: 0.06, hero: 0.08 };                         // seconds
```
No component invents its own duration/easing — import tokens. `useReducedMotionSafe()` and a
back/forward direction util (`useNavDirection()`, wraps history) also live in this file.

## 2. Primitives (built once, reused everywhere)
- `<PageTransition>` — wraps the routed outlet in `<AnimatePresence>`; reads `useNavDirection()`
  so **back feels like reverse** (forward: enter +16px rise / exit −16px fade; back: mirrored).
  Fallback for any unmapped route pair: 0.2s crossfade. Never a blank frame between pages.
- `<Stagger>` / `<RevealOnScroll>` — list and scroll choreography using the tokens.
- Shared-element conventions (Framer Motion `layoutId`, names are a contract):
  `team-accent-{teamId}` · `driver-portrait-{driverId}` · `car-thumb-{teamId}` ·
  `round-card-{round}`.

## 3. Route choreography map (the "đẹp" part — implement per pair)
| From → To | Transition |
|---|---|
| `/` → `/teams` | Landing content exits up 24px + fade (0.25s); the **11-card team stagger IS the page entrance** (60ms apart, each card color-swept via `--team-primary`). |
| `/teams` → `/teams/:id` | **Shared element:** the clicked card's color edge (`team-accent-{id}`) expands into the team header band; remaining content crossfades under it. |
| team → driver | `driver-portrait-{id}` morphs card → page header; results rows cascade +120ms after the header settles (header first, data second — always). |
| team → car | Page dims to the `#0F0F0F` stage (0.2s) → 3D poster visible immediately → canvas **crossfades in on its first rendered frame**. A blank/black canvas is a defect. |
| `/calendar` → `/calendar/:roundId` | The marker's preview card (`round-card-{round}`) morphs into the track page header; the track ribbon **draws itself in** only after the route transition settles (sequence, don't overlap). |
| Tab switches (featured tabs, standings tabs) | Image crossfade (0.32s) + text slide 12px; outgoing text exits first (0.15s) so lines never overlap mid-flight. |
| Any back navigation | Reverse of the forward choreography (direction util) — drilling out must *feel* like drilling out. |

## 4. Loading & Suspense coordination (no flash, no pop)
- Skeletons appear only after a **150ms delay** (avoid flash on fast loads) and fade out 0.2s
  *before* real content enters — content never pops on top of a visible skeleton.
- 3D scenes: DESIGN.md poster/video → canvas crossfade, triggered by first frame, not mount.
- Route-level `React.lazy`: the previous page holds (exit paused) until the next chunk resolves
  or 300ms passes — whichever first — then transition runs. No white/black gap ever.

## 5. Scroll rules
- Forward navigation: scroll resets to top **instantly during exit** (hidden by the outgoing
  animation), never visibly after enter.
- Back navigation: restore prior scroll position after exit completes, before enter starts.
- Anchor scrolling is smooth only when motion is allowed.

## 6. Reduced motion (`prefers-reduced-motion`)
Everything above collapses to a 0.15s opacity crossfade: no rises, no staggers, no shared-element
morphs (plain fade), instant scroll, frozen 3D turntables. Functionality identical.

## 7. Performance contract
- Animate `transform` and `opacity` only. `will-change` is added just before an animation and
  removed after — never left on permanently.
- Route transitions stay interactive: input is never blocked > 300ms; total forward transition
  ≤ 700ms (set pieces on landing may take up to 900ms once).
- 60fps on a mid-range laptop (reason against 4× CPU throttle); if a stagger janks, cut
  per-item work (shadows, filters) before cutting the idea.
- Cleanup: GSAP timelines/ScrollTriggers killed on unmount; AnimatePresence exit handlers
  never leak; strict-mode double-mount safe.

## 8. Acceptance bar — "transition chuẩn và đẹp" means all of these pass
1. Click through **every** route pair in §3: zero hard cuts, zero white/black flashes.
2. Back button on each pair plays a believable reverse.
3. Shared elements land within ~1px of their final layout (no end-of-morph jump).
4. Skeletons never flash (<150ms loads show none) and never overlap entering content.
5. 3D pages never show an empty canvas; poster→canvas swap is imperceptible.
6. Tab switching is readable mid-flight (no text collisions).
7. With reduced motion enabled, the whole site still transitions (crossfades) and nothing breaks.
8. Keyboard navigation triggers the same transitions as pointer.
