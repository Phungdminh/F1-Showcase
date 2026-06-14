// Detail panel for a selected car component — CarExplorerPage subcomponent
// (PLAN T15). Right-side panel on desktop, full-width stacked block on mobile.
// Pure presentation: receives the resolved CarComponent + a close handler; the
// scripted slide-in is refined by f1-motion-designer in Phase 4. DESIGN.md §4:
// #0F0F0F surface, tracking-[0.3em] uppercase eyebrows, font-light heading,
// thin neutral-800 rules. Team accent (var(--team-primary)) marks subpart rules.
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Eyebrow from '../../components/Eyebrow';
import type { CarComponent } from '../../types';
import { DUR, EASE, RISE, STAGGER, useReducedMotionSafe } from '../../lib/motion';

// Subpart rows gently stagger in when a component is selected (keyed by component
// id so re-selecting replays). Reduced motion → instant (no transform/stagger).
const LIST: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER.cards } },
};
const ROW: Variants = {
  hidden: { opacity: 0, y: RISE.hero },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE.out } },
};

export interface ComponentDetailPanelProps {
  /** Resolved component for the current selection; null → empty hint state. */
  component: CarComponent | null;
  onClose: () => void;
  className?: string;
}

export default function ComponentDetailPanel({
  component,
  onClose,
  className = '',
}: ComponentDetailPanelProps) {
  const reduced = useReducedMotionSafe();

  if (!component) {
    return (
      <aside
        aria-label="Chi tiết cụm linh kiện"
        className={`flex min-h-[8rem] items-center rounded border border-neutral-200 bg-white p-6 shadow-sm ${className}`.trim()}
      >
        <p className="text-sm leading-relaxed text-neutral-500">
          Chọn một cụm linh kiện để xem chi tiết cấu tạo.
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-label={`Chi tiết: ${component.name}`}
      className={`relative rounded border border-neutral-200 bg-white p-6 shadow-sm md:p-8 ${className}`.trim()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded text-neutral-500 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      <Eyebrow className="pr-12">Cụm linh kiện</Eyebrow>
      <h2 className="mt-3 text-2xl font-light leading-tight tracking-tight text-neutral-900 md:text-3xl">
        {component.name}
      </h2>
      <p className="mt-4 max-w-prose text-sm leading-relaxed text-neutral-700">
        {component.summary}
      </p>

      <div className="mt-8">
        <Eyebrow>Bộ phận con</Eyebrow>
        <motion.ul
          key={component.id}
          className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200"
          variants={reduced ? undefined : LIST}
          initial={reduced ? undefined : 'hidden'}
          animate={reduced ? undefined : 'show'}
        >
          {component.subParts.map((part) => (
            <motion.li
              key={part.id}
              data-motion="subpart-row"
              variants={reduced ? undefined : ROW}
              className="border-l-2 py-4 pl-4"
              style={{ borderLeftColor: 'var(--team-primary)' }}
            >
              <p className="text-sm font-medium text-neutral-900">{part.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                {part.description}
              </p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </aside>
  );
}
