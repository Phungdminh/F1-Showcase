// StandingsPage — live 2026 standings with Constructors / Drivers tabs (PLAN T12,
// DESIGN §4 typographic tables: thin border-neutral-800 rules, no card chrome,
// right-aligned numerals). Data comes from the live Jolpica fetchers; on any
// fetch/parse error the API layer returns the committed fallback snapshot flagged
// stale, and we surface a StaleDataBadge + "Cập nhật: {fetchedAt}" note.
//
// The one documented hex exception (DESIGN §0/§4): the constructor color chip reads
// getTeam(teamId)?.primaryColor via inline style — a data-display marker, not theming.
//
// Tabs carry data-motion="standings-tab"; the Phase-4 motion pass owns the tab
// crossfade (MOTION §3). We only render focusable role=tab buttons + panels.
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DUR, EASE, useReducedMotionSafe } from '../../lib/motion';
import Eyebrow from '../../components/Eyebrow';
import Navbar from '../../components/Navbar';
import Skeleton from '../../components/Skeleton';
import StaleDataBadge from '../../components/StaleDataBadge';
import ErrorFallback from '../../components/ErrorFallback';
import { getConstructorStandings, getDriverStandings } from '../../lib/api/jolpica';
import { standingsSnapshot } from '../../data/fallbacks/standings';
import { getTeam } from '../../data/teams';
import type { ConstructorStanding, DriverStanding } from '../../types';

type TabId = 'constructors' | 'drivers';

const TABS: { id: TabId; label: string }[] = [
  { id: 'constructors', label: 'Đội đua' },
  { id: 'drivers', label: 'Tay đua' },
];

interface LoadState {
  constructors: ConstructorStanding[] | null;
  drivers: DriverStanding[] | null;
  stale: boolean;
  error: boolean;
  loading: boolean;
}

const INITIAL: LoadState = {
  constructors: null,
  drivers: null,
  stale: false,
  error: false,
  loading: true,
};

export default function StandingsPage() {
  const [tab, setTab] = useState<TabId>('constructors');
  const [state, setState] = useState<LoadState>(INITIAL);

  // `isActive` lets the caller drop results after unmount (avoids a state update warning).
  const load = useCallback(async (isActive: () => boolean = () => true) => {
    setState((s) => ({ ...s, loading: true, error: false }));
    try {
      const [constructors, drivers] = await Promise.all([
        getConstructorStandings(),
        getDriverStandings(),
      ]);
      if (!isActive()) return;
      setState({
        constructors: constructors.data,
        drivers: drivers.data,
        stale: constructors.stale || drivers.stale,
        error: false,
        loading: false,
      });
    } catch {
      // The fetchers never throw, but guard defensively so the UI always has an error state.
      if (!isActive()) return;
      setState({
        constructors: standingsSnapshot.constructors,
        drivers: standingsSnapshot.drivers,
        stale: true,
        error: true,
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    void load(() => active);
    return () => {
      active = false;
    };
  }, [load]);

  const { loading, error, stale } = state;
  const reduced = useReducedMotionSafe();

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar variant="light" />
      <main className="px-5 pb-20 pt-10 md:px-16 md:pb-24 md:pt-16 lg:px-20 xl:px-28">
      <header className="max-w-3xl">
        <Eyebrow className="mb-6">Bảng xếp hạng</Eyebrow>
        <h1 className="text-4xl font-light leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
          Mùa giải 2026
        </h1>
        {stale && !loading && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StaleDataBadge />
            <span className="text-xs text-neutral-500">
              Cập nhật: {standingsSnapshot.fetchedAt}
            </span>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Loại bảng xếp hạng"
        className="mt-12 flex gap-8 border-b border-neutral-200"
      >
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`standings-tab-${id}`}
              aria-selected={active}
              aria-controls={`standings-panel-${id}`}
              data-motion="standings-tab"
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 pb-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 ${
                active
                  ? 'border-neutral-900 font-medium text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="mt-10">
        {error && !loading ? (
          <ErrorFallback
            title="Không tải được bảng xếp hạng"
            message="Đang hiển thị dữ liệu lưu tạm. Vui lòng thử lại."
            onRetry={() => void load()}
          />
        ) : (
          // One AnimatePresence so the outgoing panel exits FIRST (fade + slide down
          // 12px, 0.15s) before the incoming enters (fade + slide up from 12px) —
          // lines never overlap mid-flight (MOTION §3). mode="wait" guarantees the
          // handoff. The keyed motion.section is itself the role=tabpanel, so its
          // id/aria-labelledby always match the selected tab's aria-controls.
          // Reduced motion → plain 0.15s opacity swap.
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={tab}
              role="tabpanel"
              id={`standings-panel-${tab}`}
              aria-labelledby={`standings-tab-${tab}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: reduced ? 0.15 : DUR.base, ease: EASE.out },
              }}
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0.15 } }
                  : { opacity: 0, y: 12, transition: { duration: 0.15, ease: EASE.in } }
              }
            >
              {tab === 'constructors' ? (
                loading || !state.constructors ? (
                  <TableSkeleton columns={['#', 'Đội đua', 'Thắng', 'Điểm']} />
                ) : (
                  <ConstructorsTable rows={state.constructors} />
                )
              ) : loading || !state.drivers ? (
                <TableSkeleton columns={['#', 'Tay đua', 'Đội', 'Thắng', 'Điểm']} />
              ) : (
                <DriversTable rows={state.drivers} />
              )}
            </motion.section>
          </AnimatePresence>
        )}
      </div>
      </main>
    </div>
  );
}

function ConstructorsTable({ rows }: { rows: ConstructorStanding[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-sm text-neutral-500">Chưa có dữ liệu.</p>;
  }
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <th scope="col" className="py-3 pr-4 text-left font-medium w-10">
            #
          </th>
          <th scope="col" className="py-3 pr-4 text-left font-medium">
            Đội đua
          </th>
          <th scope="col" className="py-3 pl-4 text-right font-medium">
            Thắng
          </th>
          <th scope="col" className="py-3 pl-4 text-right font-medium">
            Điểm
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const color = getTeam(row.teamId)?.primaryColor;
          return (
            <tr key={row.teamId} className="border-b border-neutral-200">
              <td className="py-4 pr-4 tabular-nums text-neutral-500">{row.position}</td>
              <td className="py-4 pr-4">
                <span className="flex items-center gap-3 text-neutral-900">
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 shrink-0 rounded-full bg-neutral-300"
                    style={color ? { backgroundColor: color } : undefined}
                  />
                  <span className="font-light">{row.teamName}</span>
                </span>
              </td>
              <td className="py-4 pl-4 text-right tabular-nums text-neutral-700">{row.wins}</td>
              <td className="py-4 pl-4 text-right tabular-nums font-medium text-neutral-900">
                {row.points}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DriversTable({ rows }: { rows: DriverStanding[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-sm text-neutral-500">Chưa có dữ liệu.</p>;
  }
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <th scope="col" className="py-3 pr-4 text-left font-medium w-10">
            #
          </th>
          <th scope="col" className="py-3 pr-4 text-left font-medium">
            Tay đua
          </th>
          <th scope="col" className="py-3 px-4 text-left font-medium">
            Đội
          </th>
          <th scope="col" className="py-3 pl-4 text-right font-medium">
            Thắng
          </th>
          <th scope="col" className="py-3 pl-4 text-right font-medium">
            Điểm
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const teamName = getTeam(row.teamId)?.name ?? row.teamId;
          return (
            <tr key={row.driverId} className="border-b border-neutral-200">
              <td className="py-4 pr-4 tabular-nums text-neutral-500">{row.position}</td>
              <td className="py-4 pr-4 font-light text-neutral-900">{row.driverName}</td>
              <td className="py-4 px-4 text-neutral-600">{teamName}</td>
              <td className="py-4 pl-4 text-right tabular-nums text-neutral-700">{row.wins}</td>
              <td className="py-4 pl-4 text-right tabular-nums font-medium text-neutral-900">
                {row.points}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TableSkeleton({ columns }: { columns: string[] }) {
  return (
    <div aria-busy="true" aria-label="Đang tải bảng xếp hạng">
      <div className="flex gap-4 border-b border-neutral-200 pb-3">
        {columns.map((c) => (
          <Skeleton key={c} className="h-3 flex-1" />
        ))}
      </div>
      <div className="mt-4 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {columns.map((c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
