// The site's signature diagonal divider — DESIGN.md §1, exact polygon.
// On the landing hero it is positioned by the caller
// (absolute bottom-0 left-0 z-[3], inside the hero wrapper).
export default function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={`h-[60px] md:h-[120px] w-full ${className}`.trim()}
    >
      <polygon points="0,0 0,120 1440,120 1440,80 920,80 680,0" fill="#0F0F0F" />
    </svg>
  );
}
