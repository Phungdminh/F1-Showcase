// Signature eyebrow label — DESIGN.md pattern, identical on light and dark:
// text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase. A short F1-red
// tick leads the label so the brand accent threads through every section header.
import type { HTMLAttributes } from 'react';

export default function Eyebrow({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`inline-flex items-center gap-2.5 text-xs font-medium tracking-[0.3em] text-neutral-500 uppercase ${className}`.trim()}
      {...rest}
    >
      <span aria-hidden="true" className="h-px w-5 shrink-0 bg-f1" />
      {children}
    </p>
  );
}
