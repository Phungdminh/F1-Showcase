// /teams/:teamId/car — 3D car component explorer (PLAN T15). Mounts the lazy
// CarExplorerScene (built in parallel by f1-3d-specialist) against its FROZEN
// props interface; compiles today against the stub. DESIGN.md §4: full-bleed
// #0F0F0F stage, tracking-[0.3em] eyebrows, font-light headings. Team accent
// resolved to a concrete hex for three.js (CSS vars are not readable in WebGL).
//
// MOTION.md §3 (team → car): the stage carries layoutId="car-thumb-{teamId}"
// for shared-element morph from the team page; the poster is visible immediately
// and crossfades to the canvas on its FIRST rendered frame (never a blank/black
// canvas). The crossfade is a plain Tailwind opacity transition (loading-state
// concern); f1-motion-designer owns the route-level choreography in Phase 4.
import { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import Eyebrow from '../../components/Eyebrow';
import Skeleton from '../../components/Skeleton';
import ErrorFallback from '../../components/ErrorFallback';
import { carComponents, getCarComponent } from '../../data/carComponents';
import { getTeam } from '../../data/teams';
import ComponentDetailPanel from './ComponentDetailPanel';
import { DUR, EASE } from '../../lib/motion';
// Per-team paint scheme for the car (color schemes only, no logos).
import { getLivery } from '../../three/car/liveries';

// Lazy 3D scene — three.js must never land in the initial chunk (CLAUDE.md).
const CarExplorerScene = lazy(() => import('../../three/car/CarExplorerScene'));

const NEUTRAL_ACCENT = '#e5e5e5';

export default function CarExplorerPage() {
  const { teamId } = useParams<'teamId'>();
  const team = teamId ? getTeam(teamId) : undefined;
  // three.js can't read CSS vars — resolve the accent to a concrete hex string.
  const accent = team?.primaryColor ?? NEUTRAL_ACCENT;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const selectedComponent = selectedId ? getCarComponent(selectedId) ?? null : null;

  if (!teamId || !team) {
    return (
      <main className="min-h-screen bg-transparent px-6 py-24 sm:px-8 md:px-16 lg:px-20 xl:px-28">
        <Eyebrow className="mb-6">Cấu tạo xe 2026</Eyebrow>
        <ErrorFallback
          title="Không tìm thấy đội đua"
          message="Đội đua này không có trong danh sách 2026. Quay lại để chọn một đội khác."
          className="max-w-md"
        />
        <Link
          to="/teams"
          className="mt-8 inline-block text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
        >
          ← Đội đua
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-16 sm:px-8 md:px-16 md:py-20 lg:px-20 xl:px-28">
      {/* Header */}
      <header className="mb-10">
        <Link
          to={`/teams/${teamId}`}
          className="inline-block text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
        >
          ← Quay lại đội
        </Link>
        <Eyebrow className="mt-8">Cấu tạo xe 2026</Eyebrow>
        <h1 className="mt-3 text-4xl font-light leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
          {team.carModel}
        </h1>
        <p className="mt-3 text-sm text-neutral-600">{team.name}</p>
      </header>

      <div>
        {/* Stage — the description panel overlays it (top-right) the moment a
            component is selected, so the details are never hidden off to the side. */}
        <div className="relative">
          {/* Shared-element morph target from the team page (MOTION.md §2). */}
          <motion.div
            layoutId={`car-thumb-${teamId}`}
            layout
            transition={{ ease: EASE.move, duration: DUR.slow }}
            className="relative h-[58vh] min-h-[440px] w-full overflow-hidden rounded md:h-[66vh]"
            style={{
              // Studio stage: a soft team-coloured floor glow over a centred
              // charcoal spotlight fading to deep dark — prettier than flat black.
              background:
                'radial-gradient(120% 70% at 50% 102%, color-mix(in srgb, var(--team-primary) 24%, transparent), transparent 58%), radial-gradient(95% 85% at 50% 42%, #24272f 0%, #101218 55%, #0a0b0e 100%)',
            }}
          >
            {/* Poster fallback — always rendered UNDERNEATH so the stage is
                never blank/black. Fades out once the canvas reports first frame. */}
            <div
              aria-hidden={canvasReady}
              className={`absolute inset-0 z-0 flex flex-col items-center justify-center gap-5 bg-transparent transition-opacity duration-500 ${
                canvasReady ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
            >
              <Skeleton className="h-40 w-3/4 max-w-md" />
              <Eyebrow>Đang tải mô hình 3D</Eyebrow>
            </div>

            {/* Lazy canvas layer — poster already covers the loading window. */}
            <div className="absolute inset-0 z-10">
              <Suspense fallback={null}>
                <CarExplorerScene
                  components={carComponents}
                  selectedId={selectedId}
                  accentColor={accent}
                  livery={getLivery(teamId, accent)}
                  onComponentSelect={setSelectedId}
                  onFirstFrame={() => setCanvasReady(true)}
                />
              </Suspense>
            </div>

            {/* On-stage description overlay — appears the moment a component is
                selected, so the part's summary + sub-parts are always visible. */}
            {selectedComponent && (
              <div className="absolute right-3 top-3 bottom-3 z-20 w-[21rem] max-w-[calc(100%-1.5rem)] overflow-y-auto sm:right-4 sm:top-4 sm:bottom-4">
                <ComponentDetailPanel
                  component={selectedComponent}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            )}
          </motion.div>

          {/* Hint shown until a part is picked. */}
          {!selectedComponent && (
            <p className="pointer-events-none absolute bottom-4 left-4 z-20 text-xs uppercase tracking-[0.2em] text-white/70">
              Nhấn vào một bộ phận để xem chi tiết
            </p>
          )}
        </div>

        {/* Keyboard / non-pointer equivalent: every hotspot is also a button.
            Selecting here is identical to clicking a 3D hotspot (a11y path). */}
        <nav aria-label="Danh sách cụm linh kiện" className="mt-6">
          <Eyebrow className="mb-3">Chọn cụm linh kiện</Eyebrow>
          <ul className="flex flex-wrap gap-2">
            {carComponents.map((component) => {
              const active = selectedId === component.id;
              return (
                <li key={component.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedId(component.id)}
                    className="rounded border px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
                    style={{
                      borderColor: active ? 'var(--team-primary)' : '#d4d4d4',
                      color: active ? '#171717' : '#525252',
                    }}
                  >
                    {component.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </main>
  );
}
