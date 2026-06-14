// OpenF1 — RESERVED FOR V2 (PLAN §3: "openf1.ts reserved (v2)").
// SPEC §6 names OpenF1 (https://openf1.org) as the session-data source
// (live timing, car telemetry, radio). No v1 route consumes it; this module
// exists so the v2 wiring has a stable home and base URL.

export const OPENF1_BASE = 'https://api.openf1.org/v1';

/**
 * v2 helper (documented, intentionally minimal): list sessions for a year,
 * e.g. `getSessions(2026)` → race/quali/practice session metadata.
 * Endpoint: GET {OPENF1_BASE}/sessions?year={year}
 * Returns `[]` on any error — same never-throw policy as the Jolpica layer.
 */
export async function getSessions(year: number): Promise<unknown[]> {
  try {
    const res = await fetch(`${OPENF1_BASE}/sessions?year=${year}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json: unknown = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}
