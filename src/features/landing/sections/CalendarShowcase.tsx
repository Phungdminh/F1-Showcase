// CalendarShowcase — the season map as a pinned/parallax stage. Reuses the
// calendar WorldMap (real Natural-Earth land) with the full 24-round racing line
// projected through it, plus light non-interactive round dots (the focusable
// markers live on /calendar — here we avoid adding 24 tab stops). The NEXT race
// is highlighted with GP name, circuit, date and a "Còn N ngày" countdown.
//
// PARALLAX: the map layer drifts up + scales slightly slower than the text
// overlay (depth), and both fade up on entry. GSAP scrub for the drift, in-view
// reveal for the text. Reduced motion → everything static & visible.
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import Eyebrow from '../../../components/Eyebrow';
import WorldMap, { project } from '../../calendar/WorldMap';
import { calendar, getUpcomingRace } from '../../../data/calendar';
import { getCircuit } from '../../../data/circuits';
import { DUR, RISE } from '../../../lib/motion';
import { EASE_OUT, useParallax } from '../useParallax';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500';

const VI_DATE = new Intl.DateTimeFormat('vi-VN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from now until the race date (>= 0). */
function daysUntil(iso: string, now: Date): number {
  const diff = new Date(iso).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / DAY_MS));
}

export default function CalendarShowcase() {
  const now = new Date();
  const upcoming = getUpcomingRace(now);
  const circuit = upcoming ? getCircuit(upcoming.circuitId) : undefined;
  const routePoints = calendar.map((r) => project(r.lat, r.lng));

  const scope = useRef<HTMLElement>(null);

  useParallax(scope, ({ gsap }) => {
    const root = scope.current;
    if (!root) return;

    const map = root.querySelector<HTMLElement>('[data-layer="map"]');
    const reveal = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);

    gsap.set(reveal, { autoAlpha: 0, y: RISE.section });
    gsap.to(reveal, {
      autoAlpha: 1,
      y: 0,
      ease: EASE_OUT,
      duration: DUR.slow,
      stagger: 0.08,
      clearProps: 'transform,willChange',
      scrollTrigger: { trigger: root, start: 'top 75%', once: true },
    });

    // Map drifts slower + scales subtly as the section passes — the depth layer.
    if (map) {
      gsap.fromTo(
        map,
        { yPercent: -6, scale: 1.04 },
        {
          yPercent: 6,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
  });

  return (
    <section
      ref={scope}
      aria-labelledby="calendar-heading"
      className="relative overflow-hidden bg-transparent px-5 py-28 md:px-12 md:py-36"
    >
      <div className="mb-14 md:mb-20">
        <Eyebrow data-reveal className="text-neutral-600">
          Lịch thi đấu
        </Eyebrow>
        <h2
          id="calendar-heading"
          data-reveal
          className="mt-5 text-[clamp(2.5rem,8vw,7rem)] font-light leading-[0.95] tracking-tight text-neutral-900"
        >
          24 CHẶNG
        </h2>
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        {/* Map stage — the depth layer that drifts on scroll. */}
        <div data-layer="map" data-reveal className="relative">
          {/* Non-interactive markers (decorative): the real, focusable map lives
              at /calendar — here we only want light dots, no 24 extra tab stops.
              The next round gets a brighter, larger dot. */}
          <WorldMap routePoints={routePoints}>
            {calendar.map((race) => {
              const isNext = upcoming ? race.round === upcoming.round : false;
              const { x, y } = project(race.lat, race.lng);
              return (
                <circle
                  key={race.round}
                  cx={x}
                  cy={y}
                  r={isNext ? 4 : 2.4}
                  fill={isNext ? '#ffffff' : '#9aa3b2'}
                  opacity={isNext ? 1 : 0.7}
                  aria-hidden="true"
                />
              );
            })}
          </WorldMap>
        </div>

        {/* Next-race overlay — text leads, sits above the map. */}
        <div data-reveal className="relative">
          {upcoming ? (
            <div className="border-l-2 border-neutral-300 pl-6 md:pl-8">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-500">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                Chặng tiếp theo
              </p>
              <p className="mt-6 text-5xl font-light leading-none tracking-tight text-neutral-900 md:text-7xl">
                R{String(upcoming.round).padStart(2, '0')}
              </p>
              <h3 className="mt-4 text-2xl font-light text-neutral-900 md:text-3xl">{upcoming.name}</h3>
              <p className="mt-2 text-sm text-neutral-600">
                {circuit ? `${circuit.name} · ` : ''}
                {upcoming.city}, {upcoming.country}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{VI_DATE.format(new Date(upcoming.date))}</p>
              <p className="mt-8 text-sm uppercase tracking-[0.2em] text-neutral-500">
                Còn{' '}
                <span className="text-base font-medium tabular-nums text-neutral-900">
                  {daysUntil(upcoming.date, now)}
                </span>{' '}
                ngày
              </p>
            </div>
          ) : (
            <div className="border-l-2 border-neutral-300 pl-6 md:pl-8">
              <h3 className="text-2xl font-light text-neutral-900 md:text-3xl">Mùa giải đã khép lại</h3>
              <p className="mt-2 text-sm text-neutral-600">Hẹn gặp lại ở mùa giải tới.</p>
            </div>
          )}

          <Link
            to="/calendar"
            className={`mt-10 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline ${FOCUS}`}
          >
            Xem lịch đầy đủ
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
