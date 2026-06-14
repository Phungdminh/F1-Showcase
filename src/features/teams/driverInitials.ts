// Shared helper for the placeholder driver avatars (headshotUrl is null in the
// 2026 seed). Used by TeamDetailPage (16px circle) and DriverDetailPage (20px
// header portrait) so both produce identical initials for the layoutId morph.
//
// Takes the first letter of the first and last whitespace-separated tokens,
// uppercased (e.g. "Andrea Kimi Antonelli" → "AA", "Max Verstappen" → "MV").
export function driverInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}
