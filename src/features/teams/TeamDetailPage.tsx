// /teams/:teamId (index) — team profile (PLAN.md §2, T8). Replaces the
// Phase-2 placeholder. Rendered inside TeamThemeBoundary, which has already set
// --team-primary / --team-secondary, so EVERY accent here reads the CSS var —
// never a hardcoded hex (DESIGN.md §4).
//
// Motion wiring placed (not animated — Phase 4 owns timing/transition):
//   layoutId="team-accent-{teamId}"      → morph target from the /teams card edge
//   layoutId="car-thumb-{teamId}"        → morph target to /teams/:id/car stage
//   layoutId="driver-portrait-{driverId}" → morph source to the driver page header
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Eyebrow from '../../components/Eyebrow';
import PrimaryButton from '../../components/PrimaryButton';
import Navbar from '../../components/Navbar';
import { getTeam } from '../../data/teams';
import { getTeamDrivers } from '../../data/drivers';
import { getTeamHistory } from '../../data/teamHistory';
import DriverPortrait from './DriverPortrait';
import { DUR, EASE } from '../../lib/motion';

// Shared transition for all three shared-element morph anchors on this page so
// they land within ~1px of their final layout, no end-of-morph jump (MOTION §3).
const MORPH = { ease: EASE.move, duration: DUR.slow } as const;

export default function TeamDetailPage() {
  const { teamId } = useParams<'teamId'>();
  const team = teamId ? getTeam(teamId) : undefined;

  if (!team || !teamId) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar variant="light" />
        <main className="px-5 pb-24 pt-10 md:px-12 lg:px-20 xl:px-28 md:pt-16">
          <Eyebrow className="mb-6">Không tìm thấy</Eyebrow>
          <h1 className="text-3xl font-light tracking-tight text-neutral-900 md:text-5xl">
            Không có đội đua này
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-600">
            Không tìm thấy đội đua trong dữ liệu mùa giải 2026.
          </p>
          <Link
            to="/teams"
            className="mt-8 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Về danh sách đội đua
          </Link>
        </main>
      </div>
    );
  }

  const drivers = getTeamDrivers(teamId);
  const history = getTeamHistory(teamId);

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar variant="light" />
      <main className="px-5 pb-24 pt-10 md:px-12 lg:px-20 xl:px-28 md:pt-16">
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Đội đua
        </Link>

        {/* Header band */}
        <header className="mt-8">
          <Eyebrow className="mb-6">Hồ sơ đội đua</Eyebrow>
          <h1 className="text-4xl font-light leading-[1.0] tracking-tight text-neutral-900 md:text-7xl">
            {team.name}
          </h1>
          <p className="mt-4 text-sm text-neutral-500 md:text-base">{team.fullName}</p>

          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Trụ sở
              </dt>
              <dd className="mt-2 text-sm text-neutral-700">{team.base}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Giám đốc đội
              </dt>
              <dd className="mt-2 text-sm text-neutral-700">{team.teamPrincipal}</dd>
            </div>
          </dl>
        </header>

        {/* Accent band — full-width morph target of the card edge. Reads the
            CSS var set by TeamThemeBoundary, NOT a hex. */}
        <motion.div
          layoutId={`team-accent-${teamId}`}
          layout
          transition={MORPH}
          aria-hidden="true"
          className="mt-8 h-1 w-full"
          style={{ backgroundColor: 'var(--team-primary)' }}
        />

        {/* Engine + car */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="history-heading">
            <Eyebrow id="history-heading" className="mb-6">
              Lịch sử chiến tích
            </Eyebrow>
            <p className="text-2xl font-light tracking-tight text-neutral-900 md:text-3xl">
              {history.headline}
            </p>
            <ul className="mt-5 space-y-2.5">
              {history.bullets.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-neutral-700">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-f1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {history.note && (
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-600">
                {history.note}
              </p>
            )}
          </section>

          <section aria-labelledby="car-heading">
            <Eyebrow id="car-heading" className="mb-6">
              Xe đua
            </Eyebrow>
            <p className="text-2xl font-light tracking-tight text-neutral-900 md:text-3xl">
              {team.carModel}
            </p>

            <PrimaryButton variant="f1" to={`/teams/${teamId}/car`} className="mt-6">
              Khám phá xe 3D
            </PrimaryButton>
          </section>
        </div>

        {/* Drivers */}
        <section aria-labelledby="drivers-heading" className="mt-16">
          <Eyebrow id="drivers-heading" className="mb-6">
            Tay đua 2026
          </Eyebrow>
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
            {drivers.map((driver) => (
              <Link
                key={driver.id}
                to={`drivers/${driver.id}`}
                data-motion="driver-card"
                className="group flex items-center justify-between gap-5 border border-neutral-200 bg-white p-6 shadow-sm transition-colors hover:border-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
              >
                <div className="min-w-0">
                  <p
                    className="text-5xl font-light leading-none tracking-tight"
                    style={{ color: 'var(--team-primary)' }}
                  >
                    {driver.number}
                  </p>
                  <p className="mt-3 truncate text-lg font-light text-neutral-900">{driver.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">{driver.country}</p>
                </div>
                {/* Driver headshot on the RIGHT (real photo via headshotUrl, else
                    a team-coloured placeholder). Morph source to the driver page. */}
                <motion.div
                  layoutId={`driver-portrait-${driver.id}`}
                  layout
                  transition={MORPH}
                  className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
                >
                  <DriverPortrait driver={driver} />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
