// /teams — the 11-team grid (PLAN.md §2, T7). Replaces the Phase-2 placeholder.
//
// Cards live OUTSIDE TeamThemeBoundary (this page is the bare /teams route),
// so the accent edge here is the one DOCUMENTED exception to the "no team hex"
// rule: it reads team.primaryColor via inline style. Everything else stays
// neutral per DESIGN.md §4. Each card root also exposes --team-primary as a
// CSS var + data-motion="team-card" so the Phase-4 motion agent can color-sweep
// and stagger the entrance without touching this markup.
//
// Motion wiring placed (not animated — Phase 4 owns timing/transition):
//   layoutId="team-accent-{teamId}"  → morph target = TeamDetailPage accent band
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Eyebrow from '../../components/Eyebrow';
import Pill from '../../components/Pill';
import Navbar from '../../components/Navbar';
import TeamLogo from '../../components/TeamLogo';
import Stagger from '../../components/motion/Stagger';
import { DUR, EASE, useReducedMotionSafe } from '../../lib/motion';
import { teams } from '../../data/teams';

export default function TeamsPage() {
  const reduced = useReducedMotionSafe();

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar variant="light" />
      <main className="px-5 pb-24 pt-10 md:px-12 lg:px-20 xl:px-28 md:pt-16">
        <header className="mb-12 md:mb-16">
          <Eyebrow className="mb-6">Mùa giải 2026</Eyebrow>
          <h1 className="text-4xl font-light leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
            Đội hình 2026
          </h1>
        </header>

        <Stagger className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              data-motion="team-card"
              style={{ '--team-primary': team.primaryColor } as CSSProperties}
              className="group relative block overflow-hidden border border-neutral-200 bg-white p-8 shadow-sm transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {/* DOCUMENTED HEX EXCEPTION: accent edge reads team.primaryColor
                  directly because this card is outside TeamThemeBoundary. This
                  motion.div is the shared-element morph source for the detail
                  page header band (MOTION.md §2). LANE A OWNS THIS — do not add an
                  entrance to it; the stagger lives on the Stagger wrapper, the
                  sweep is the sibling overlay below. */}
              <motion.div
                layoutId={`team-accent-${team.id}`}
                layout
                transition={{ ease: EASE.move, duration: DUR.slow }}
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: team.primaryColor }}
              />

              {/* Color-sweep entrance: a faint team-primary wash that wipes across
                  once on mount (transform/opacity only). Same system, visibly
                  different per team via --team-primary. Skipped under reduced
                  motion (sibling of the layoutId node — never fights the morph). */}
              {!reduced && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 origin-left"
                  style={{ background: 'var(--team-primary)' }}
                  initial={{ scaleX: 0, opacity: 0.16 }}
                  animate={{ scaleX: 1, opacity: 0 }}
                  transition={{ duration: DUR.slow, ease: EASE.out }}
                />
              )}

              {/* Hover speed-line: a thin team-primary streak that slides across on
                  hover (group-hover translate). Pure transform/opacity. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 h-px w-1/3 -translate-x-full opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:translate-x-[300%] group-hover:opacity-70 motion-reduce:hidden"
                style={{ background: 'var(--team-primary)' }}
              />

              <div className="pl-2">
                <div className="flex items-center gap-4">
                  <TeamLogo team={team} size={48} />
                  <div>
                    <h2 className="text-2xl font-light tracking-tight text-neutral-900 md:text-3xl">
                      {team.name}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">{team.fullName}</p>
                  </div>
                </div>

                <Pill className="mt-6">{team.engineSupplier}</Pill>

                <dl className="mt-6 space-y-1">
                  <div>
                    <dt className="sr-only">Mẫu xe 2026</dt>
                    <dd className="text-xs text-neutral-500">{team.carModel}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Trụ sở</dt>
                    <dd className="text-xs text-neutral-500">{team.base}</dd>
                  </div>
                </dl>
              </div>
            </Link>
          ))}
        </Stagger>
      </main>
    </div>
  );
}
