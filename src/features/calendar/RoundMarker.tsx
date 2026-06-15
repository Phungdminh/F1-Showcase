// RoundMarker — a red map-pin at the round's projected lat/lng inside the
// WorldMap SVG (PLAN T10). The pin TIP anchors exactly on the location. A
// keyboard-operable <button> wrapped in <foreignObject> so it lives in the SVG
// coordinate space yet is a real focusable control. Upcoming = bright red pin
// (gentle pulse); past = dimmed red pin. Selection/behavior come in via props.
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Race } from '../../types';
import { project } from './WorldMap';
import { useReducedMotionSafe } from '../../lib/motion';

const VI_DATE = new Intl.DateTimeFormat('vi-VN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const PIN_COLOR = '#E10600';

/** Classic location pin: red teardrop with a white inner circle. */
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path
        fill={PIN_COLOR}
        d="M12 1.5C7.86 1.5 4.5 4.86 4.5 9c0 5.2 6.06 12.06 6.96 13.05a.73.73 0 0 0 1.08 0C13.44 21.06 19.5 14.2 19.5 9c0-4.14-3.36-7.5-7.5-7.5z"
      />
      <circle cx="12" cy="9" r="2.7" fill="#ffffff" />
    </svg>
  );
}

export interface RoundMarkerProps {
  race: Race;
  upcoming: boolean;
  active: boolean;
  onSelect: (round: number) => void;
  /** Pointer left / focus lost — the page debounces this into hiding the card. */
  onHoverEnd: () => void;
  /** Current map zoom scale — pin divides by this to stay constant screen size. */
  scale?: number;
}

export default function RoundMarker({ race, upcoming, active, onSelect, onHoverEnd, scale = 1 }: RoundMarkerProps) {
  const reduced = useReducedMotionSafe();
  const navigate = useNavigate();
  const { x, y } = project(race.lat, race.lng);
  const label = `Vòng ${race.round} — ${race.name}, ${VI_DATE.format(new Date(race.date))}${
    upcoming ? ' (sắp diễn ra)' : ' (đã đua)'
  }`;
  // Pin size in SVG units divided by scale so the pin stays the same screen size
  // regardless of how far the user has zoomed in.
  const S = 24 / scale;

  const pulsing = !reduced && upcoming && !active;

  return (
    <foreignObject x={x - S / 2} y={y - S} width={S} height={S} overflow="visible">
      <button
        type="button"
        onClick={() => navigate(`/calendar/${race.round}`)}
        onMouseEnter={() => onSelect(race.round)}
        onMouseLeave={onHoverEnd}
        onFocus={() => onSelect(race.round)}
        onBlur={onHoverEnd}
        aria-label={label}
        aria-pressed={active}
        data-motion="round-marker"
        data-upcoming={upcoming ? 'true' : 'false'}
        className="flex h-full w-full items-end justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-300"
      >
        <motion.span
          aria-hidden="true"
          className="block h-full w-full"
          style={{
            transformOrigin: 'bottom center',
            opacity: upcoming ? 1 : 0.45,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))',
            willChange: pulsing ? 'transform' : 'auto',
          }}
          animate={active ? { scale: 1.3 } : pulsing ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={
            pulsing
              ? { duration: 2, ease: 'easeInOut', repeat: Infinity }
              : { duration: 0.2 }
          }
        >
          <PinIcon />
        </motion.span>
      </button>
    </foreignObject>
  );
}
