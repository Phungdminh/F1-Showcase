// LiveBadge — the "this data is auto-refreshing" indicator for live-polled
// resources (standings, driver results). A pulsing F1-red dot + "TRỰC TIẾP" with
// a relative "cập nhật N giây trước" that ticks every second, so the live polling
// is visible even when the underlying numbers don't change between races. Goes
// grey/"TẠM DỪNG" when polling is paused (tab hidden), and defers to the existing
// StaleDataBadge when the data is a cached fallback. Reduced motion → no ping.
import { useEffect, useState } from 'react';
import { useReducedMotionSafe } from '../lib/motion';
import StaleDataBadge from './StaleDataBadge';

function relativeVi(fromTs: number, now: number): string {
  const s = Math.max(0, Math.round((now - fromTs) / 1000));
  if (s < 5) return 'vừa cập nhật';
  if (s < 60) return `cập nhật ${s} giây trước`;
  const m = Math.floor(s / 60);
  if (m < 60) return `cập nhật ${m} phút trước`;
  return `cập nhật ${Math.floor(m / 60)} giờ trước`;
}

export interface LiveBadgeProps {
  /** Polling currently active (tab visible). */
  live: boolean;
  /** Latest value is a cached fallback, not fresh from the network. */
  stale: boolean;
  /** Epoch ms of the last successful network refresh, or null. */
  lastUpdated: number | null;
  className?: string;
}

export default function LiveBadge({ live, stale, lastUpdated, className = '' }: LiveBadgeProps) {
  const reduced = useReducedMotionSafe();
  // Re-render every second so the relative timestamp counts up live.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (stale) return <StaleDataBadge className={className} />;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 text-xs ${
        live ? 'text-neutral-700' : 'text-neutral-500'
      } ${className}`.trim()}
      aria-live="polite"
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        {live && !reduced && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-f1 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${live ? 'bg-f1' : 'bg-neutral-400'}`}
        />
      </span>
      <span className="font-medium tracking-wide">{live ? 'TRỰC TIẾP' : 'TẠM DỪNG'}</span>
      {lastUpdated !== null && (
        <span className="text-neutral-400">· {relativeVi(lastUpdated, now)}</span>
      )}
    </span>
  );
}
