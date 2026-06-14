// TeamsShowcase — all 11 teams as bold editorial rows. As each row enters view
// its primaryColor sweeps in as a left edge bar + the team name lifts, staggered
// (parallax depth: rows rise at slightly different rates). Hover tints the row
// with the team color. Team hexes come straight from the data (data-display use,
// allowed by CLAUDE.md), applied via inline style + a CSS var so we never hardcode.
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Eyebrow from '../../../components/Eyebrow';
import TeamLogo from '../../../components/TeamLogo';
import { teams } from '../../../data/teams';
import { DUR, RISE } from '../../../lib/motion';
import { EASE_OUT, useParallax } from '../useParallax';

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500';

export default function TeamsShowcase() {
  const scope = useRef<HTMLElement>(null);

  useParallax(scope, ({ gsap }) => {
    const root = scope.current;
    if (!root) return;

    const heading = gsap.utils.toArray<HTMLElement>('[data-reveal]', root);
    gsap.set(heading, { autoAlpha: 0, y: RISE.section });
    gsap.to(heading, {
      autoAlpha: 1,
      y: 0,
      ease: EASE_OUT,
      duration: DUR.slow,
      stagger: 0.1,
      clearProps: 'transform,willChange',
      scrollTrigger: { trigger: heading[0], start: 'top 85%', once: true },
    });

    // Each row: the name lifts + fades, the color bar wipes in from the left.
    // Rows are triggered individually so they reveal as the reader scrolls,
    // each with a tiny parallax offset (different start% via the row position).
    gsap.utils.toArray<HTMLElement>('[data-row]', root).forEach((row) => {
      const name = row.querySelector<HTMLElement>('[data-row-name]');
      const bar = row.querySelector<HTMLElement>('[data-row-bar]');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: row, start: 'top 88%', once: true },
      });
      if (name) {
        gsap.set(name, { autoAlpha: 0, y: RISE.section });
        tl.to(name, {
          autoAlpha: 1,
          y: 0,
          ease: EASE_OUT,
          duration: DUR.slow,
          clearProps: 'transform,willChange',
        });
      }
      if (bar) {
        gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
        tl.to(bar, { scaleX: 1, ease: EASE_OUT, duration: DUR.base }, '<0.05');
      }
    });
  });

  return (
    <section
      ref={scope}
      aria-labelledby="teams-heading"
      className="px-5 py-28 md:px-12 md:py-36"
    >
      <div className="mb-14 md:mb-20">
        <Eyebrow data-reveal className="text-neutral-600">
          Đội đua
        </Eyebrow>
        <h2
          id="teams-heading"
          data-reveal
          className="mt-5 text-[clamp(2.5rem,8vw,7rem)] font-light leading-[0.95] tracking-tight text-neutral-900"
        >
          11 ĐỘI ĐUA
        </h2>
      </div>

      <ul className="border-t border-neutral-200">
        {teams.map((team) => (
          <li key={team.id} data-row className="group border-b border-neutral-200">
            <Link
              to={`/teams/${team.id}`}
              style={{ '--team-primary': team.primaryColor } as CSSProperties}
              className={`relative flex items-center gap-5 py-6 transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--team-primary)_8%,transparent)] md:gap-8 md:py-8 ${FOCUS}`}
            >
              {/* Color sweep bar — wipes in on reveal, grows taller on hover. */}
              <span
                data-row-bar
                aria-hidden="true"
                className="h-12 w-1.5 shrink-0 rounded-full transition-all duration-300 group-hover:h-16 md:h-16 md:group-hover:h-24"
                style={{ backgroundColor: 'var(--team-primary)' }}
              />
              <TeamLogo team={team} size={56} />
              <div className="min-w-0 flex-1">
                <span
                  data-row-name
                  className="block truncate text-[clamp(1.75rem,5vw,4rem)] font-light leading-none tracking-tight text-neutral-900 transition-colors duration-300 group-hover:text-[var(--team-primary)]"
                >
                  {team.name}
                </span>
                <span className="mt-2 block text-xs uppercase tracking-[0.2em] text-neutral-500 md:text-sm">
                  {team.engineSupplier} · {team.carModel}
                </span>
              </div>
              <ArrowRight
                aria-hidden="true"
                className="h-6 w-6 shrink-0 -translate-x-2 text-neutral-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[var(--team-primary)] group-hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to="/teams"
        className={`mt-12 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline ${FOCUS}`}
      >
        Xem tất cả đội đua
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}
