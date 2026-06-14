// Rounded pill — DESIGN.md §2 pattern: border-neutral-700, hover border-neutral-500.
// Team routes may tint via CSS vars later; the base stays strictly neutral.
import type { HTMLAttributes } from 'react';

export default function Pill({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center px-5 py-2 rounded-full border border-neutral-300 text-sm text-neutral-700 hover:border-neutral-500 ${className}`.trim()}
      {...rest}
    >
      {children}
    </span>
  );
}
