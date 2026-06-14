// Error state for data views — dark-section styling per DESIGN.md §4
// (every data view ships loading/empty/error states).
export interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorFallback({
  title = 'Không tải được dữ liệu',
  message = 'Đã có lỗi khi tải nội dung. Vui lòng thử lại.',
  onRetry,
  className = '',
}: ErrorFallbackProps) {
  return (
    <div role="alert" className={`rounded border border-neutral-200 bg-white p-6 shadow-sm ${className}`.trim()}>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">Lỗi</p>
      <p className="text-lg font-light text-neutral-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
