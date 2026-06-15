// RoundPreviewCard — the preview panel shown for a selected round (PLAN T10).
// Carries the frozen shared-element id `round-card-${race.round}` (MOTION §2) so
// Phase-4 can morph it into the /calendar/:roundId header. We only wire layoutId +
// stable structure/classNames here; we do NOT author entrance animations (Phase-4 owns
// the SPRING + draw-in sequencing). data-motion="round-card" tags it for the motion pass.
import { motion } from 'framer-motion';
import { Check, MapPin } from 'lucide-react';
import type { Race } from '../../types';
import { getCircuit } from '../../data/circuits';
import Eyebrow from '../../components/Eyebrow';
import { DUR, EASE, SPRING, useReducedMotionSafe } from '../../lib/motion';

const VI_DATE = new Intl.DateTimeFormat('vi-VN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Whole days from `now` until the race; null when the race is today or past. */
function daysUntil(dateIso: string, now: Date): number | null {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const target = new Date(dateIso);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - start.getTime()) / MS_PER_DAY);
  return diff > 0 ? diff : null;
}

export interface RoundPreviewCardProps {
  race: Race;
  upcoming: boolean;
  now: Date;
  className?: string;
}

export default function RoundPreviewCard({ race, upcoming, now, className = '' }: RoundPreviewCardProps) {
  const circuit = getCircuit(race.circuitId);
  const countdown = upcoming ? daysUntil(race.date, now) : null;
  const reduced = useReducedMotionSafe();

  // The CONTENT springs in when the selected round changes (keyed by round) — a
  // gentle scale/opacity pop that reads as "the card just arrived". This lives on
  // an INNER wrapper, so it never fights the layoutId root's `layout` morph (Lane
  // A owns that). Reduced motion → no pop (static content). MOTION §3 / §6.
  return (
    // NOTE: no `layoutId`/`layout` here. This card and the /calendar/:roundId
    // header once shared a `layoutId` morph (MOTION §2), but a shared-element node
    // sitting in the calendar tree that <AnimatePresence mode="wait"> animates OUT
    // can deadlock the exit-complete callback — the detail route never mounts, so
    // the URL changes while the page stays blank/stuck. It is especially fragile
    // under map zoom/pan, where this card's source rect goes degenerate
    // (display:none / off-screen). The parallax route transition still covers the
    // change with no hard cut. Re-introduce a morph only with a presence mode that
    // keeps BOTH nodes mounted (e.g. popLayout), never mode="wait".
    <motion.div
      transition={{ ease: EASE.move, duration: DUR.slow }}
      data-motion="round-card"
      className={`w-72 max-w-full rounded-2xl border p-6 shadow-lg ${
        upcoming ? 'border-neutral-200 bg-white' : 'border-sky-200 bg-sky-50'
      } ${className}`.trim()}
    >
      <motion.div
        key={race.round}
        initial={reduced ? false : { opacity: 0, scale: 0.96 }}
        animate={reduced ? undefined : { opacity: 1, scale: 1 }}
        transition={reduced ? undefined : { type: 'spring', ...SPRING }}
      >
      <div className="flex items-center justify-between">
        <Eyebrow>Vòng {race.round}</Eyebrow>
        {upcoming ? (
          countdown !== null && (
            <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700">
              Còn {countdown} ngày
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
            <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.5} />
            Đã đua
          </span>
        )}
      </div>

      <h3 className="mt-4 text-2xl font-light leading-tight tracking-tight text-neutral-900">
        {race.name}
      </h3>

      <p className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
        <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span>
          {race.city}, {race.country}
        </span>
      </p>

      {circuit && <p className="mt-1 text-sm text-neutral-500">{circuit.name}</p>}

      <p className="mt-4 text-sm text-neutral-700">
        {VI_DATE.format(new Date(race.date))}
      </p>

      </motion.div>
    </motion.div>
  );
}
