// Primary CTA — DESIGN.md §1 (light hero: bg-neutral-900) and §2 (dark
// sections: bg-neutral-800 hover:bg-neutral-700). Renders a router Link when
// `to` is given, a plain button otherwise.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const VARIANTS = {
  light: 'bg-neutral-900 text-white text-sm font-medium rounded px-6 py-3 md:px-8 md:py-3.5',
  dark: 'bg-neutral-900 text-white text-sm font-medium rounded px-7 py-3.5 transition-colors hover:bg-neutral-800',
  // F1-red primary CTA — the brand accent action on dark pages.
  f1: 'bg-f1 text-white text-sm font-medium rounded px-7 py-3.5 transition-colors hover:bg-f1-hover',
} as const;

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500';

export interface PrimaryButtonProps {
  children: ReactNode;
  /** Route target — renders a <Link> when set. */
  to?: string;
  onClick?: () => void;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

export default function PrimaryButton({
  children,
  to,
  onClick,
  variant = 'light',
  className = '',
}: PrimaryButtonProps) {
  const classes = `inline-block text-center ${VARIANTS[variant]} ${FOCUS} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
