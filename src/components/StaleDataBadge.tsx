// Subtle "cached data" note — shown when the API layer returns a fallback
// snapshot with stale: true (PLAN.md §1 cache strategy).
export default function StaleDataBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500 ${className}`.trim()}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" aria-hidden="true" />
      Dữ liệu lưu tạm
    </span>
  );
}
