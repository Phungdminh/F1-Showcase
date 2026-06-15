// /calendar/:roundId — round detail + 3D track viewer (PLAN T16). Mounts the
// lazy TrackScene (built in parallel by f1-3d-specialist) against its FROZEN
// props interface; compiles today against the stub. DESIGN.md §4: #0F0F0F
// stage, tracking-[0.3em] eyebrows, font-light headings, thin neutral rules.
//
// MOTION.md §3 (calendar → round): the header carries layoutId="round-card-
// {round}" so the calendar preview card morphs into it; the ribbon draws itself
// in only after the route settles (sequenced via drawProgress, see MOTION-HOOK).
// The poster is visible immediately and crossfades to the canvas on its FIRST
// rendered frame — never a blank/black canvas.
import { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import Eyebrow from '../../components/Eyebrow';
import Skeleton from '../../components/Skeleton';
import { getRace } from '../../data/calendar';
import { getCircuit } from '../../data/circuits';
import CircuitFactPanel from './CircuitFactPanel';
import { DUR, EASE } from '../../lib/motion';

// Lazy 3D scene — three.js must never land in the initial chunk (CLAUDE.md).
const TrackScene = lazy(() => import('../../three/track/TrackScene'));

// Each round gets its own vivid hue (evenly spaced around the colour wheel) —
// it tints the 3D track's stage glow, lap pulse, and sector ticks.
const roundAccent = (round: number): string =>
  `hsl(${Math.round(((round - 1) * 360) / 24)}, 72%, 56%)`;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function RoundDetailPage() {
  const { roundId } = useParams<'roundId'>();
  const round = Number(roundId);
  const race = Number.isInteger(round) ? getRace(round) : undefined;

  const [canvasReady, setCanvasReady] = useState(false);
  // Reset canvas state when navigating to a different round (component reuses across params).
  useEffect(() => { setCanvasReady(false); }, [round]);

  // Invalid / missing round → friendly not-found with a way back.
  if (!race) {
    return (
      <main className="min-h-screen bg-transparent px-6 py-24 sm:px-8 md:px-16 lg:px-20 xl:px-28">
        <Eyebrow className="mb-6">Chặng đua</Eyebrow>
        <h1 className="text-3xl font-light leading-[1.1] tracking-tight text-neutral-900 md:text-5xl">
          Không tìm thấy chặng đua
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-neutral-600">
          Chặng đua này không có trong lịch 2026. Vui lòng quay lại lịch thi đấu để chọn một chặng khác.
        </p>
        <Link
          to="/calendar"
          className="mt-8 inline-block text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
        >
          ← Lịch thi đấu
        </Link>
      </main>
    );
  }

  const circuit = getCircuit(race.circuitId);
  const accent = roundAccent(round);

  return (
    <main className="min-h-screen bg-transparent px-6 py-16 sm:px-8 md:px-16 md:py-20 lg:px-20 xl:px-28">
      <Link
        to="/calendar"
        className="inline-block text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
      >
        ← Lịch thi đấu
      </Link>

      {/* Header card. The shared-element `layoutId` morph from the calendar preview
          card (MOTION.md §2) is intentionally removed: paired across
          <AnimatePresence mode="wait"> it deadlocks the calendar's exit (worse under
          map zoom/pan), so this route never mounts and the page shows blank. The
          parallax route transition covers the change with no hard cut. */}
      <motion.div
        transition={{ ease: EASE.move, duration: DUR.slow }}
        className="mt-8"
      >
        <Eyebrow>Vòng {round}</Eyebrow>
        <h1 className="mt-3 text-4xl font-light leading-[1.05] tracking-tight text-neutral-900 md:text-6xl">
          {race.name}
        </h1>
        <p className="mt-4 text-sm text-neutral-600">
          {race.city}, {race.country} · {formatDate(race.date)}
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        {/* Stage — studio gradient tinted with this round's accent (a soft
            coloured floor glow over a centred charcoal spotlight). */}
        <div
          className="relative h-[60vh] min-h-[420px] w-full overflow-hidden rounded"
          style={{
            background: `radial-gradient(120% 75% at 50% 102%, color-mix(in srgb, ${accent} 26%, transparent), transparent 60%), radial-gradient(95% 90% at 50% 40%, #20242c 0%, #0e1015 55%, #0a0b0e 100%)`,
          }}
        >
          {circuit ? (
            <>
              {/* Poster fallback — always underneath; never a blank/black canvas.
                  Fades out once the canvas reports its first frame. */}
              <div
                aria-hidden={canvasReady}
                className={`absolute inset-0 z-0 flex flex-col items-center justify-center gap-5 bg-transparent transition-opacity duration-500 ${
                  canvasReady ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                <Skeleton className="h-48 w-3/4 max-w-lg" />
                <Eyebrow>Đang dựng đường đua 3D</Eyebrow>
              </div>

              <div className="absolute inset-0 z-10">
                <Suspense fallback={null}>
                  <TrackScene
                    circuit={circuit}
                    drawProgress={1}
                    accentColor={accent}
                    onFirstFrame={() => setCanvasReady(true)}
                  />
                </Suspense>
              </div>
            </>
          ) : (
            // Valid race but no circuit geometry (data gap) — graceful textual note.
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <Eyebrow>Sơ đồ đường đua</Eyebrow>
              <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
                Sơ đồ đường đua đang được cập nhật.
              </p>
            </div>
          )}
        </div>

        {/* Fact panel — conveys all key info textually (non-pointer usable). */}
        {circuit ? (
          <CircuitFactPanel circuit={circuit} className="lg:sticky lg:top-20 lg:self-start" />
        ) : (
          <section aria-label="Thông số đường đua" className="lg:sticky lg:top-20 lg:self-start">
            <Eyebrow>Đường đua</Eyebrow>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Thông số đường đua cho chặng này đang được cập nhật.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
