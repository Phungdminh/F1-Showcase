// CalendarPage — animated world map of the 2026 season (PLAN T10, DESIGN §4 dark page).
// 24 round markers projected from lat/lng; upcoming vs past is computed at runtime against
// `new Date()` (today). Hovering/focusing/clicking a marker selects a round and shows its
// RoundPreviewCard. A typographic ordered round list below the map guarantees keyboard
// access to every round (each item selects + links to the round detail).
//
// Motion handoff: markers carry data-motion="round-marker" (Phase-4 adds the upcoming
// pulse) and the preview card carries layoutId round-card-{round} + data-motion="round-card"
// for the map→track-header morph. We author no entrance/draw-in here — Phase-4 owns the
// map draw-in set piece (MOTION §3 /calendar → /calendar/:roundId).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';

// ── Zoom/pan helpers ──────────────────────────────────────────────────────────
const BASE_VIEW = { x: 0, y: 28, w: 1000, h: 392 } as const;
const MAX_ZOOM = 8;

type Vb = { x: number; y: number; w: number; h: number };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function clampVb(v: Vb): Vb {
  const w = clamp(v.w, BASE_VIEW.w / MAX_ZOOM, BASE_VIEW.w);
  const h = clamp(v.h, BASE_VIEW.h / MAX_ZOOM, BASE_VIEW.h);
  const x = clamp(v.x, BASE_VIEW.x, BASE_VIEW.x + BASE_VIEW.w - w);
  const y = clamp(v.y, BASE_VIEW.y, BASE_VIEW.y + BASE_VIEW.h - h);
  return { x, y, w, h };
}

function vbStr(v: Vb) {
  return `${v.x} ${v.y} ${v.w} ${v.h}`;
}
import Eyebrow from '../../components/Eyebrow';
import Navbar from '../../components/Navbar';
import { calendar } from '../../data/calendar';
import type { Race } from '../../types';
import WorldMap, { project } from './WorldMap';
import RoundMarker from './RoundMarker';
import RoundPreviewCard from './RoundPreviewCard';

/** A race is "upcoming" when its date is today (runtime) or later. */
function isUpcoming(race: Race, now: Date): boolean {
  return new Date(race.date).getTime() >= now.getTime();
}

/**
 * Tracks whether the viewport is phone-sized, re-evaluating on resize/rotate so
 * the map can size pins and controls for touch. Tailwind's `md` breakpoint (768px).
 */
function useIsMobile(): boolean {
  const query = '(max-width: 767px)';
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export default function CalendarPage() {
  // Runtime "today" — single instance per render keeps upcoming/past + countdown consistent.
  const now = useMemo(() => new Date(), []);
  const rounds = useMemo(
    () => [...calendar].sort((a, b) => a.round - b.round),
    [],
  );

  const isMobile = useIsMobile();

  // ── Zoom / pan state ───────────────────────────────────────────────────────
  const [vb, setVb] = useState<Vb>(BASE_VIEW);
  const vbRef = useRef<Vb>(BASE_VIEW);
  useEffect(() => { vbRef.current = vb; }, [vb]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const dragPointerId = useRef<number | null>(null);
  const dragStart = useRef({ clientX: 0, clientY: 0, vb: BASE_VIEW as Vb });
  const lastTouchDist = useRef<number | null>(null);
  const lastTouchMid = useRef<{ x: number; y: number } | null>(null);

  const currentScale = BASE_VIEW.w / vb.w;

  // Wheel zoom — must be non-passive to allow preventDefault.
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = el!.getBoundingClientRect();
      const cv = vbRef.current;
      const svgX = cv.x + ((e.clientX - rect.left) / rect.width) * cv.w;
      const svgY = cv.y + ((e.clientY - rect.top) / rect.height) * cv.h;
      const factor = e.deltaY < 0 ? 0.75 : 1.333;
      const newW = clamp(cv.w * factor, BASE_VIEW.w / MAX_ZOOM, BASE_VIEW.w);
      const newH = clamp(cv.h * factor, BASE_VIEW.h / MAX_ZOOM, BASE_VIEW.h);
      const rx = (e.clientX - rect.left) / rect.width;
      const ry = (e.clientY - rect.top) / rect.height;
      setVb(clampVb({ x: svgX - rx * newW, y: svgY - ry * newH, w: newW, h: newH }));
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Pinch-to-zoom (touch) — also non-passive.
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length < 2) return;
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;
      const rect = el!.getBoundingClientRect();
      const cv = vbRef.current;
      if (lastTouchDist.current !== null && lastTouchMid.current !== null) {
        const factor = lastTouchDist.current / dist;
        const svgX = cv.x + ((midX - rect.left) / rect.width) * cv.w;
        const svgY = cv.y + ((midY - rect.top) / rect.height) * cv.h;
        const newW = clamp(cv.w * factor, BASE_VIEW.w / MAX_ZOOM, BASE_VIEW.w);
        const newH = clamp(cv.h * factor, BASE_VIEW.h / MAX_ZOOM, BASE_VIEW.h);
        const rx = (midX - rect.left) / rect.width;
        const ry = (midY - rect.top) / rect.height;
        setVb(clampVb({ x: svgX - rx * newW, y: svgY - ry * newH, w: newW, h: newH }));
      }
      lastTouchDist.current = dist;
      lastTouchMid.current = { x: midX, y: midY };
    }
    function onTouchEnd() {
      lastTouchDist.current = null;
      lastTouchMid.current = null;
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true;
    dragMoved.current = false;
    dragPointerId.current = e.pointerId;
    dragStart.current = { clientX: e.clientX, clientY: e.clientY, vb: vbRef.current };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || e.pointerId !== dragPointerId.current) return;
    const dx = e.clientX - dragStart.current.clientX;
    const dy = e.clientY - dragStart.current.clientY;
    if (Math.hypot(dx, dy) < 4) return;
    // Capture only when a real drag starts — avoids blocking click events on markers.
    if (!dragMoved.current) {
      dragMoved.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const sv = dragStart.current.vb;
    setVb(clampVb({ ...sv, x: sv.x - (dx / rect.width) * sv.w, y: sv.y - (dy / rect.height) * sv.h }));
  }

  function handlePointerUp() {
    isDragging.current = false;
    dragPointerId.current = null;
  }

  const zoomIn = useCallback(() => {
    setVb((cv) => {
      const cx = cv.x + cv.w / 2;
      const cy = cv.y + cv.h / 2;
      const newW = clamp(cv.w * 0.667, BASE_VIEW.w / MAX_ZOOM, BASE_VIEW.w);
      const newH = clamp(cv.h * 0.667, BASE_VIEW.h / MAX_ZOOM, BASE_VIEW.h);
      return clampVb({ x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH });
    });
  }, []);

  const zoomOut = useCallback(() => {
    setVb((cv) => {
      const cx = cv.x + cv.w / 2;
      const cy = cv.y + cv.h / 2;
      const newW = clamp(cv.w * 1.5, BASE_VIEW.w / MAX_ZOOM, BASE_VIEW.w);
      const newH = clamp(cv.h * 1.5, BASE_VIEW.h / MAX_ZOOM, BASE_VIEW.h);
      return clampVb({ x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH });
    });
  }, []);

  const resetZoom = useCallback(() => setVb(BASE_VIEW), []);

  // ── Hover preview ──────────────────────────────────────────────────────────
  // Hover-only preview: NO card by default — a round's card appears only while
  // its marker / list row (or the card itself) is hovered or focused, and clears
  // on leave. A short debounce lets the pointer cross the gap from a marker to its
  // card (to reach the link) without the card flickering away in between.
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const cancelHide = () => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  const showRound = (round: number) => {
    cancelHide();
    setSelectedRound(round);
  };
  const scheduleHide = () => {
    cancelHide();
    hideTimer.current = window.setTimeout(() => {
      setSelectedRound(null);
      hideTimer.current = null;
    }, 140);
  };
  // Clear any pending timer on unmount.
  useEffect(
    () => () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    },
    [],
  );

  const selectedRace = useMemo(
    () => rounds.find((r) => r.round === selectedRound) ?? null,
    [rounds, selectedRound],
  );

  // Ordered projected coords for the season "racing line" drawn through the map.
  const routePoints = useMemo(
    () => rounds.map((r) => project(r.lat, r.lng)),
    [rounds],
  );

  const empty = rounds.length === 0;

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar variant="light" />
      <main className="px-5 pb-16 pt-8 sm:px-6 md:px-16 md:pb-24 md:pt-16 lg:px-20 xl:px-28">
      <header className="max-w-3xl">
        <Eyebrow className="mb-4 md:mb-6">Lịch thi đấu</Eyebrow>
        <h1 className="text-3xl font-light leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl md:text-6xl">
          24 chặng đua 2026
        </h1>
      </header>

      {empty ? (
        <p className="mt-16 text-sm text-neutral-500">Chưa có dữ liệu lịch thi đấu.</p>
      ) : (
        <div className="mt-8 md:mt-12 lg:mt-16">
          {/* Map + anchored preview (desktop). On mobile the preview drops below the map. */}
          <div className="relative">
            {/* Zoom/pan container — full-bleed on phones (cancels the page gutter) so
                the wide world map gets every available pixel; gutter + rounding return at md. */}
            <div
              ref={mapContainerRef}
              className="relative -mx-5 select-none overflow-hidden rounded-none sm:-mx-6 md:mx-0 md:rounded"
              style={{ cursor: currentScale > 1.01 ? 'grab' : 'default', touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <WorldMap routePoints={routePoints} viewBox={vbStr(vb)} scale={currentScale}>
                {rounds.map((race) => (
                  <RoundMarker
                    key={race.round}
                    race={race}
                    upcoming={isUpcoming(race, now)}
                    active={race.round === selectedRound}
                    onSelect={showRound}
                    onHoverEnd={scheduleHide}
                    scale={currentScale}
                    baseSize={isMobile ? 44 : 24}
                  />
                ))}
              </WorldMap>

              {/* Desktop: card anchored near the selected marker (clamped inside the map). */}
              {selectedRace && (
                <div
                  className="pointer-events-none absolute hidden lg:block"
                  style={anchorStyle(selectedRace, vb)}
                  aria-hidden="true"
                >
                  <div
                    className="pointer-events-auto"
                    onMouseEnter={cancelHide}
                    onMouseLeave={scheduleHide}
                  >
                    <RoundPreviewCard
                      race={selectedRace}
                      upcoming={isUpcoming(selectedRace, now)}
                      now={now}
                    />
                  </div>
                </div>
              )}

              {/* Zoom controls */}
              <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 md:bottom-3 md:right-3">
                {currentScale > 1.05 && (
                  <span className="mr-1 font-mono text-xs tabular-nums text-white/50">
                    {currentScale.toFixed(1)}×
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Phóng to"
                  onClick={zoomIn}
                  disabled={currentScale >= MAX_ZOOM}
                  className="flex h-9 w-9 items-center justify-center rounded bg-black/40 text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white md:h-7 md:w-7 disabled:opacity-30"
                >
                  <Plus className="h-4 w-4 md:h-3.5 md:w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Thu nhỏ"
                  onClick={zoomOut}
                  disabled={currentScale <= 1.01}
                  className="flex h-9 w-9 items-center justify-center rounded bg-black/40 text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white md:h-7 md:w-7 disabled:opacity-30"
                >
                  <Minus className="h-4 w-4 md:h-3.5 md:w-3.5" />
                </button>
                {currentScale > 1.05 && (
                  <button
                    type="button"
                    aria-label="Đặt lại zoom"
                    onClick={resetZoom}
                    className="flex h-9 w-9 items-center justify-center rounded bg-black/40 text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white md:h-7 md:w-7"
                  >
                    <RotateCcw className="h-4 w-4 md:h-3.5 md:w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Touch hint — phones only: the dense world map needs a zoom before pins
              are individually tappable. */}
          <p className="mt-3 px-1 text-center text-xs leading-relaxed text-neutral-500 md:hidden">
            Chụm 2 ngón để phóng to · chạm vào marker để xem đường đua
          </p>

          {/* Mobile / tablet: preview panel below the map (robust, no overlap). */}
          {selectedRace && (
            <div className="mt-8 flex justify-center lg:hidden">
              <RoundPreviewCard
                race={selectedRace}
                upcoming={isUpcoming(selectedRace, now)}
                now={now}
              />
            </div>
          )}
        </div>
      )}
      </main>
    </div>
  );
}

/** Position the preview card near the selected marker, accounting for current viewBox zoom/pan. */
function anchorStyle(race: Race, vb: Vb): CSSProperties {
  const { x: svgX, y: svgY } = project(race.lat, race.lng);
  // Convert SVG coords → percentage within the current viewBox.
  const leftPct = ((svgX - vb.x) / vb.w) * 100;
  const topPct = ((svgY - vb.y) / vb.h) * 100;
  // Hide card if marker is panned out of view.
  if (leftPct < 0 || leftPct > 100 || topPct < 0 || topPct > 100) {
    return { display: 'none' };
  }
  const placeLeft = leftPct > 60;
  const placeAbove = topPct > 55;
  return {
    left: `${Math.min(Math.max(leftPct, 4), 96)}%`,
    top: `${Math.min(Math.max(topPct, 4), 96)}%`,
    transform: `translate(${placeLeft ? '-100%' : '0'}, ${placeAbove ? '-100%' : '0'}) translate(${
      placeLeft ? '-12px' : '12px'
    }, ${placeAbove ? '-12px' : '12px'})`,
  };
}
