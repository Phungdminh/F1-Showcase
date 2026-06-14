// StandingsShowcase — numbers lead. Seeds INSTANTLY from standingsSnapshot
// (SSR-safe, no spinner on the landing) and refreshes from the live Jolpica
// fetcher in an effect (which never throws — falls back to the snapshot).
// The constructors' leader is rendered huge in its team color; a compact top-5
// list follows, plus a small drivers' leader callout.
//
// PARALLAX: the giant leader number drifts on scrub (depth) while the list reveals
// in on entry. Reduced motion → static. Team colors are data-display (allowed),
// applied via inline style — never hardcoded.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Eyebrow from '../../../components/Eyebrow';
import { standingsSnapshot } from '../../../data/fallbacks/standings';
import { getConstructorStandings, getDriverStandings } from '../../../lib/api/jolpica';
import { getTeam } from '../../../data/teams';
import type { ConstructorStanding, DriverStanding } from '../../../types';
import { DUR, RISE } from '../../../lib/motion';
import { EASE_OUT, useParallax } from '../useParallax';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500';

/** Team primaryColor from our seed (falls back to neutral if id is unknown). */
function teamColor(teamId: string): string {
  return getTeam(teamId)?.primaryColor ?? '#9aa3b2';
}

export default function StandingsShowcase() {
  // Seed from the committed snapshot so the section paints immediately.
  const [constructors, setConstructors] = useState<ConstructorStanding[]>(
    standingsSnapshot.constructors,
  );
  const [driverLeader, setDriverLeader] = useState<DriverStanding | undefined>(
    standingsSnapshot.drivers[0],
  );

  // Refresh from the live layer (non-blocking, never throws). Guarded so a late
  // resolve after unmount doesn't set state.
  useEffect(() => {
    let alive = true;
    void (async () => {
      const [c, d] = await Promise.all([getConstructorStandings(), getDriverStandings()]);
      if (!alive) return;
      if (c.data.length > 0) setConstructors(c.data);
      if (d.data.length > 0) setDriverLeader(d.data[0]);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const leader = constructors[0];
  const top5 = constructors.slice(0, 5);

  const scope = useRef<HTMLElement>(null);

  useParallax(scope, ({ gsap }) => {
    const root = scope.current;
    if (!root) return;

    const reveal = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
    gsap.set(reveal, { autoAlpha: 0, y: RISE.section });
    gsap.to(reveal, {
      autoAlpha: 1,
      y: 0,
      ease: EASE_OUT,
      duration: DUR.slow,
      stagger: 0.06,
      clearProps: 'transform,willChange',
      scrollTrigger: { trigger: root, start: 'top 78%', once: true },
    });

    const bigNumber = root.querySelector<HTMLElement>('[data-big-number]');
    if (bigNumber) {
      gsap.fromTo(
        bigNumber,
        { yPercent: -10 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
  });

  return (
    <section
      ref={scope}
      aria-labelledby="standings-heading"
      className="relative overflow-hidden bg-transparent px-5 py-28 md:px-12 md:py-36"
    >
      <div className="mb-14 md:mb-20">
        <Eyebrow data-reveal className="text-neutral-600">
          Bảng xếp hạng
        </Eyebrow>
        <h2
          id="standings-heading"
          data-reveal
          className="mt-5 text-[clamp(2.5rem,8vw,7rem)] font-light leading-[0.95] tracking-tight text-neutral-900"
        >
          BẢNG XẾP HẠNG
        </h2>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        {/* Constructors' leader — huge, in team color. */}
        {leader && (
          <div data-reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Dẫn đầu — Đội đua
            </p>
            <div className="mt-6 flex items-end gap-4">
              <span
                data-big-number
                className="text-[clamp(5rem,18vw,16rem)] font-light leading-[0.8] tabular-nums"
                style={{ color: teamColor(leader.teamId) }}
              >
                {leader.points}
              </span>
              <span className="mb-3 text-sm text-neutral-500">điểm</span>
            </div>
            <p
              className="mt-2 text-3xl font-light tracking-tight md:text-5xl"
              style={{ color: teamColor(leader.teamId) }}
            >
              {leader.teamName}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              {leader.wins} chiến thắng mùa này
            </p>

            {driverLeader && (
              <div className="mt-10 border-t border-neutral-200 pt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                  Dẫn đầu — Tay đua
                </p>
                <p className="mt-3 flex items-baseline gap-3">
                  <span
                    className="text-xl font-light text-neutral-900 md:text-2xl"
                  >
                    {driverLeader.driverName}
                  </span>
                  <span className="text-sm tabular-nums text-neutral-600">
                    {driverLeader.points} điểm
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Compact top-5. */}
        <div data-reveal>
          <ol className="divide-y divide-neutral-200 border-y border-neutral-200">
            {top5.map((row) => (
              <li key={row.teamId} className="flex items-center gap-4 py-4">
                <span className="w-6 text-sm tabular-nums text-neutral-500">{row.position}</span>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 rounded-sm"
                  style={{ backgroundColor: teamColor(row.teamId) }}
                />
                <span className="flex-1 truncate text-base font-light text-neutral-900 md:text-lg">
                  {row.teamName}
                </span>
                <span className="text-base font-medium tabular-nums text-neutral-900 md:text-lg">
                  {row.points}
                </span>
              </li>
            ))}
          </ol>

          <Link
            to="/standings"
            className={`mt-10 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline ${FOCUS}`}
          >
            Bảng xếp hạng đầy đủ
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
