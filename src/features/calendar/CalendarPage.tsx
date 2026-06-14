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
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Eyebrow from '../../components/Eyebrow';
import Navbar from '../../components/Navbar';
import { calendar } from '../../data/calendar';
import type { Race } from '../../types';
import WorldMap, { project } from './WorldMap';
import RoundMarker from './RoundMarker';
import RoundPreviewCard from './RoundPreviewCard';

const VI_DATE_SHORT = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
});

/** A race is "upcoming" when its date is today (runtime) or later. */
function isUpcoming(race: Race, now: Date): boolean {
  return new Date(race.date).getTime() >= now.getTime();
}

export default function CalendarPage() {
  // Runtime "today" — single instance per render keeps upcoming/past + countdown consistent.
  const now = useMemo(() => new Date(), []);
  const rounds = useMemo(
    () => [...calendar].sort((a, b) => a.round - b.round),
    [],
  );

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
      <main className="px-5 pb-20 pt-10 md:px-16 md:pb-24 md:pt-16 lg:px-20 xl:px-28">
      <header className="max-w-3xl">
        <Eyebrow className="mb-6">Lịch thi đấu</Eyebrow>
        <h1 className="text-4xl font-light leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
          24 chặng đua 2026
        </h1>
      </header>

      {empty ? (
        <p className="mt-16 text-sm text-neutral-500">Chưa có dữ liệu lịch thi đấu.</p>
      ) : (
        <div className="mt-12 lg:mt-16">
          {/* Map + anchored preview (desktop). On mobile the preview drops below the map. */}
          <div className="relative">
            <WorldMap routePoints={routePoints}>
              {rounds.map((race) => (
                <RoundMarker
                  key={race.round}
                  race={race}
                  upcoming={isUpcoming(race, now)}
                  active={race.round === selectedRound}
                  onSelect={showRound}
                  onHoverEnd={scheduleHide}
                />
              ))}
            </WorldMap>

            {/* Desktop: card anchored near the selected marker (clamped inside the map). */}
            {selectedRace && (
              <div
                className="pointer-events-none absolute hidden lg:block"
                style={anchorStyle(selectedRace)}
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
          </div>

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

          {/* Typographic round list — keyboard access to every round (DESIGN §4 table feel). */}
          <section aria-label="Danh sách 24 chặng" className="mt-16 lg:mt-24">
            <Eyebrow className="mb-6">Toàn bộ lịch</Eyebrow>
            <ol className="border-t border-neutral-200">
              {rounds.map((race) => {
                const upcoming = isUpcoming(race, now);
                const active = race.round === selectedRound;
                return (
                  <li key={race.round} className="border-b border-neutral-200">
                    <Link
                      to={`/calendar/${race.round}`}
                      onMouseEnter={() => showRound(race.round)}
                      onMouseLeave={scheduleHide}
                      onFocus={() => showRound(race.round)}
                      onBlur={scheduleHide}
                      aria-current={active ? 'true' : undefined}
                      className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-4 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 ${
                        active ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <span className="font-mono tabular-nums text-neutral-500">
                        {String(race.round).padStart(2, '0')}
                      </span>
                      <span className="flex items-center gap-2 truncate">
                        <span className="truncate font-light text-base">{race.name}</span>
                        {!upcoming && (
                          <Check
                            aria-label="Đã đua"
                            className="h-3.5 w-3.5 shrink-0 text-neutral-500"
                            strokeWidth={2.5}
                          />
                        )}
                      </span>
                      <span className="tabular-nums text-right text-neutral-500">
                        {VI_DATE_SHORT.format(new Date(race.date))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      )}
      </main>
    </div>
  );
}

/** Position the preview card near the selected marker, clamped within the map box. */
function anchorStyle(race: Race): CSSProperties {
  const { x, y } = project(race.lat, race.lng);
  const leftPct = (x / 1000) * 100;
  const topPct = (y / 500) * 100;
  // Flip the card to the opposite side near the map edges so it stays visible.
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
