// Circuit fact panel — RoundDetailPage subcomponent (PLAN T16). Conveys every
// key circuit stat TEXTUALLY so the page is fully usable without the rotate-only
// 3D canvas (non-pointer requirement). DESIGN.md §4: typographic, thin
// neutral-800 rules, tracking-[0.3em] uppercase eyebrow labels, no card chrome.
import Eyebrow from '../../components/Eyebrow';
import type { Circuit } from '../../types';

export interface CircuitFactPanelProps {
  circuit: Circuit;
  className?: string;
}

export default function CircuitFactPanel({ circuit, className = '' }: CircuitFactPanelProps) {
  return (
    <section
      aria-label={`Thông số đường đua ${circuit.name}`}
      className={`${className}`.trim()}
    >
      <Eyebrow>Đường đua</Eyebrow>
      <h2 className="mt-3 text-2xl font-light leading-tight tracking-tight text-neutral-900 md:text-3xl">
        {circuit.name}
      </h2>

      {/* Key metrics — thin typographic rules, no card chrome. */}
      <dl className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        <div className="flex items-baseline justify-between py-4">
          <dt>
            <Eyebrow>Chiều dài</Eyebrow>
          </dt>
          <dd className="text-lg font-light text-neutral-900">{circuit.lengthKm} km</dd>
        </div>
        <div className="flex items-baseline justify-between py-4">
          <dt>
            <Eyebrow>Số vòng</Eyebrow>
          </dt>
          <dd className="text-lg font-light text-neutral-900">{circuit.laps} vòng</dd>
        </div>
        <div className="flex items-baseline justify-between py-4">
          <dt>
            <Eyebrow>Phân khu</Eyebrow>
          </dt>
          <dd className="text-lg font-light text-neutral-900">3 phân khu</dd>
        </div>
      </dl>

      {circuit.facts.length > 0 && (
        <div className="mt-8">
          <Eyebrow>Điểm nhấn</Eyebrow>
          <ul className="mt-4 space-y-3">
            {circuit.facts.map((fact, i) => (
              <li
                key={i}
                className="border-l border-neutral-200 pl-4 text-sm leading-relaxed text-neutral-700"
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
