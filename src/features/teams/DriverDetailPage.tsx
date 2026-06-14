// /teams/:teamId/drivers/:driverId — round-by-round 2026 results (PLAN.md §2,
// T9). Replaces the Phase-2 placeholder. Live Jolpica results via
// getDriverSeasonResults(driverId) with a committed fallback snapshot; renders
// loading / populated / empty / stale / error states.
//
// Rendered inside TeamThemeBoundary, so accents read var(--team-primary).
//
// Motion wiring placed (not animated — Phase 4 owns timing/transition):
//   layoutId="driver-portrait-{driverId}" → morph target from the team driver card
//   data-motion="result-row" on every timeline row → Phase-4 cascade hook
import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { DriverSeasonResult } from '../../types';
import Eyebrow from '../../components/Eyebrow';
import Navbar from '../../components/Navbar';
import Skeleton from '../../components/Skeleton';
import StaleDataBadge from '../../components/StaleDataBadge';
import ErrorFallback from '../../components/ErrorFallback';
import { getTeam } from '../../data/teams';
import { getDriver } from '../../data/drivers';
import { getDriverSeasonResults } from '../../lib/api/jolpica';
import { driverResultsSnapshot } from '../../data/fallbacks/driverResults';
import DriverPortrait from './DriverPortrait';
import type { Variants } from 'framer-motion';
import { DUR, EASE, RISE, SPRING, STAGGER, useReducedMotionSafe } from '../../lib/motion';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: DriverSeasonResult[]; stale: boolean };

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

interface Totals {
  points: number;
  podiums: number;
  wins: number;
  dnfs: number;
}

function computeTotals(results: DriverSeasonResult[]): Totals {
  return results.reduce<Totals>(
    (acc, r) => ({
      points: acc.points + r.points,
      podiums: acc.podiums + (r.podium ? 1 : 0),
      wins: acc.wins + (r.position === 1 ? 1 : 0),
      dnfs: acc.dnfs + (r.dnf ? 1 : 0),
    }),
    { points: 0, podiums: 0, wins: 0, dnfs: 0 },
  );
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-4xl font-light leading-none tracking-tight text-neutral-900 md:text-5xl">
        {value}
      </p>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
        {label}
      </p>
    </div>
  );
}

// A single satisfying pop for win/podium badges — scale 1→1.12→1 on a SPRING,
// played once as the row cascades in. Reduced motion → no pop (renders static).
function BadgePop({
  reduced,
  className,
  style,
  children,
}: {
  reduced: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (reduced) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }
  return (
    <motion.span
      className={className}
      style={style}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.12, 1] }}
      transition={{ type: 'spring', ...SPRING, delay: 0.06 }}
    >
      {children}
    </motion.span>
  );
}

function FinishBadge({ result, reduced }: { result: DriverSeasonResult; reduced: boolean }) {
  if (result.dnf) {
    return (
      <span className="inline-flex items-center rounded-full border border-neutral-300 px-3 py-0.5 text-xs text-neutral-500">
        DNF
      </span>
    );
  }
  if (result.position === null) {
    return <span className="text-neutral-500">—</span>;
  }
  // P1 win → team accent; P2–P3 podium → outlined; rest → plain numeral.
  if (result.position === 1) {
    return (
      <BadgePop
        reduced={reduced}
        className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium text-black"
        style={{ backgroundColor: 'var(--team-primary)' }}
      >
        P1
      </BadgePop>
    );
  }
  if (result.podium) {
    return (
      <BadgePop
        reduced={reduced}
        className="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium"
        style={{ borderColor: 'var(--team-primary)', color: 'var(--team-primary)' }}
      >
        P{result.position}
      </BadgePop>
    );
  }
  return <span className="text-sm text-neutral-700">P{result.position}</span>;
}

// Results cascade: rows start +120ms after the header settles (header first, data
// second — MOTION §3), then each row rises STAGGER.cards apart. Reduced motion
// collapses to an instant container (no transform, no stagger).
const ROWS_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.12, staggerChildren: STAGGER.cards } },
};
const ROW_ITEM: Variants = {
  hidden: { opacity: 0, y: RISE.hero },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE.out } },
};

export default function DriverDetailPage() {
  const { teamId, driverId } = useParams<'teamId' | 'driverId'>();
  const reduced = useReducedMotionSafe();
  const driver = driverId ? getDriver(driverId) : undefined;
  const team = teamId ? getTeam(teamId) : undefined;
  // Validate the driver actually belongs to this team route.
  const valid = !!driver && !!teamId && driver.teamId === teamId;

  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (!valid || !driverId) return;
    let active = true;
    setState({ status: 'loading' });
    (async () => {
      try {
        // The fetcher never throws (built-in fallback) — try/catch is defense.
        const { data, stale } = await getDriverSeasonResults(driverId);
        if (active) setState({ status: 'ready', data, stale });
      } catch {
        if (active) setState({ status: 'error' });
      }
    })();
    return () => {
      active = false;
    };
  }, [valid, driverId]);

  if (!valid || !driver) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar variant="light" />
        <main className="px-5 pb-24 pt-10 md:px-12 lg:px-20 xl:px-28 md:pt-16">
          <Eyebrow className="mb-6">Không tìm thấy</Eyebrow>
          <h1 className="text-3xl font-light tracking-tight text-neutral-900 md:text-5xl">
            Không có tay đua này
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-600">
            Tay đua không tồn tại hoặc không thuộc đội đua này trong mùa giải 2026.
          </p>
          <Link
            to={teamId ? `/teams/${teamId}` : '/teams'}
            className="mt-8 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Về trang đội đua
          </Link>
        </main>
      </div>
    );
  }

  const totals = state.status === 'ready' ? computeTotals(state.data) : null;

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar variant="light" />
      <main className="px-5 pb-24 pt-10 md:px-12 lg:px-20 xl:px-28 md:pt-16">
        <Link
          to={`/teams/${teamId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {team?.name ?? 'Đội đua'}
        </Link>

        {/* Header */}
        <header className="mt-8 flex flex-wrap items-center gap-6">
          <motion.div
            layoutId={`driver-portrait-${driverId}`}
            layout
            transition={{ ease: EASE.move, duration: DUR.slow }}
            className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
          >
            <DriverPortrait driver={driver} />
          </motion.div>
          <div>
            <Eyebrow className="mb-3">Tay đua</Eyebrow>
            <h1 className="text-4xl font-light leading-none tracking-tight text-neutral-900 md:text-6xl">
              {driver.name}
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-neutral-500">
              <span style={{ color: 'var(--team-primary)' }}>#{driver.number}</span>
              <span>{driver.country}</span>
              {team && <span>{team.name}</span>}
            </p>
          </div>
        </header>

        {/* Season totals strip */}
        <section aria-labelledby="totals-heading" className="mt-16">
          <Eyebrow id="totals-heading" className="mb-8">
            Mùa giải 2026
          </Eyebrow>
          {state.status === 'loading' && (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-24" />
              ))}
            </div>
          )}
          {totals && (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <StatBlock value={totals.points} label="Tổng điểm" />
              <StatBlock value={totals.podiums} label="Lên bục" />
              <StatBlock value={totals.wins} label="Thắng chặng" />
              <StatBlock value={totals.dnfs} label="DNF" />
            </div>
          )}
        </section>

        {/* Results timeline */}
        <section aria-labelledby="results-heading" className="mt-16">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Eyebrow id="results-heading">Kết quả từng chặng</Eyebrow>
            {state.status === 'ready' && state.stale && (
              <span className="inline-flex items-center gap-2">
                <StaleDataBadge />
                <span className="text-xs text-neutral-600">
                  Cập nhật {driverResultsSnapshot.fetchedAt}
                </span>
              </span>
            )}
          </div>

          {state.status === 'loading' && (
            <div className="space-y-px" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}

          {state.status === 'error' && (
            <ErrorFallback
              message="Không tải được kết quả mùa giải của tay đua. Vui lòng thử lại."
              onRetry={() => {
                if (driverId) {
                  setState({ status: 'loading' });
                  getDriverSeasonResults(driverId)
                    .then(({ data, stale }) => setState({ status: 'ready', data, stale }))
                    .catch(() => setState({ status: 'error' }));
                }
              }}
            />
          )}

          {state.status === 'ready' && state.data.length === 0 && (
            <p className="text-sm leading-relaxed text-neutral-600">
              Mùa giải đang diễn ra — chưa có kết quả cho chặng nào.
            </p>
          )}

          {state.status === 'ready' && state.data.length > 0 && (
            <motion.ul
              className="border-t border-neutral-200"
              variants={reduced ? undefined : ROWS_CONTAINER}
              initial={reduced ? undefined : 'hidden'}
              animate={reduced ? undefined : 'show'}
            >
              {[...state.data]
                .sort((a, b) => a.round - b.round)
                .map((result) => (
                  <motion.li
                    key={result.round}
                    data-motion="result-row"
                    variants={reduced ? undefined : ROW_ITEM}
                    className="grid grid-cols-[3rem_1fr_auto_auto] items-center gap-4 border-b border-neutral-200 py-4"
                  >
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                      R{pad2(result.round)}
                    </span>
                    <span className="truncate text-sm text-neutral-700">{result.raceName}</span>
                    <span className="justify-self-end">
                      <FinishBadge result={result} reduced={reduced} />
                    </span>
                    <span className="w-14 justify-self-end text-right text-sm tabular-nums text-neutral-600">
                      {result.points} đ
                    </span>
                  </motion.li>
                ))}
            </motion.ul>
          )}
        </section>
      </main>
    </div>
  );
}
