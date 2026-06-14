// 2026 driver seed (22 drivers, 11 teams) — f1-data-engineer (T2).
// Consumers: team detail / driver detail pages, src/lib/api/jolpica.ts.
//
// VERIFICATION (2026-06-12): lineups are the pre-season 2026 entry list as
// verified at knowledge cutoff 2026-01. Live re-check vs Jolpica 2026 results
// was DENIED in this build environment, so mid-season driver swaps cannot be
// ruled out — every pairing below is therefore UNVERIFIED against what
// actually raced. Re-verify via the live data layer / `npm run data:refresh`.
import type { Driver } from '../types';

export const drivers: Driver[] = [
  // McLaren
  {
    id: 'lando-norris',
    teamId: 'mclaren',
    name: 'Lando Norris',
    // VERIFIED 2026-06-12 vs Jolpica /2026/drivers — 2025 WDC, runs #1
    number: 1,
    country: 'Anh',
    headshotUrl: null,
  },
  { id: 'oscar-piastri', teamId: 'mclaren', name: 'Oscar Piastri', number: 81, country: 'Úc', headshotUrl: null },
  // Ferrari
  { id: 'charles-leclerc', teamId: 'ferrari', name: 'Charles Leclerc', number: 16, country: 'Monaco', headshotUrl: null },
  { id: 'lewis-hamilton', teamId: 'ferrari', name: 'Lewis Hamilton', number: 44, country: 'Anh', headshotUrl: null },
  // Red Bull
  {
    id: 'max-verstappen',
    teamId: 'red-bull',
    name: 'Max Verstappen',
    // VERIFIED 2026-06-12 vs Jolpica /2026/drivers — runs #3 in 2026
    number: 3,
    country: 'Hà Lan',
    headshotUrl: null,
  },
  { id: 'isack-hadjar', teamId: 'red-bull', name: 'Isack Hadjar', number: 6, country: 'Pháp', headshotUrl: null },
  // Mercedes
  { id: 'george-russell', teamId: 'mercedes', name: 'George Russell', number: 63, country: 'Anh', headshotUrl: null },
  { id: 'kimi-antonelli', teamId: 'mercedes', name: 'Andrea Kimi Antonelli', number: 12, country: 'Ý', headshotUrl: null },
  // Aston Martin
  { id: 'fernando-alonso', teamId: 'aston-martin', name: 'Fernando Alonso', number: 14, country: 'Tây Ban Nha', headshotUrl: null },
  { id: 'lance-stroll', teamId: 'aston-martin', name: 'Lance Stroll', number: 18, country: 'Canada', headshotUrl: null },
  // Alpine
  { id: 'pierre-gasly', teamId: 'alpine', name: 'Pierre Gasly', number: 10, country: 'Pháp', headshotUrl: null },
  { id: 'franco-colapinto', teamId: 'alpine', name: 'Franco Colapinto', number: 43, country: 'Argentina', headshotUrl: null },
  // Williams
  { id: 'alexander-albon', teamId: 'williams', name: 'Alexander Albon', number: 23, country: 'Thái Lan', headshotUrl: null },
  { id: 'carlos-sainz', teamId: 'williams', name: 'Carlos Sainz', number: 55, country: 'Tây Ban Nha', headshotUrl: null },
  // Racing Bulls
  { id: 'liam-lawson', teamId: 'racing-bulls', name: 'Liam Lawson', number: 30, country: 'New Zealand', headshotUrl: null },
  {
    id: 'arvid-lindblad',
    teamId: 'racing-bulls',
    name: 'Arvid Lindblad',
    // UNVERIFIED — rookie race number not confirmable offline
    number: 41,
    country: 'Anh',
    headshotUrl: null,
  },
  // Audi
  { id: 'nico-hulkenberg', teamId: 'audi', name: 'Nico Hülkenberg', number: 27, country: 'Đức', headshotUrl: null },
  { id: 'gabriel-bortoleto', teamId: 'audi', name: 'Gabriel Bortoleto', number: 5, country: 'Brazil', headshotUrl: null },
  // Haas
  { id: 'esteban-ocon', teamId: 'haas', name: 'Esteban Ocon', number: 31, country: 'Pháp', headshotUrl: null },
  { id: 'oliver-bearman', teamId: 'haas', name: 'Oliver Bearman', number: 87, country: 'Anh', headshotUrl: null },
  // Cadillac
  { id: 'sergio-perez', teamId: 'cadillac', name: 'Sergio Pérez', number: 11, country: 'México', headshotUrl: null },
  { id: 'valtteri-bottas', teamId: 'cadillac', name: 'Valtteri Bottas', number: 77, country: 'Phần Lan', headshotUrl: null },
];

export function getDriver(driverId: string): Driver | undefined {
  return drivers.find((d) => d.id === driverId);
}

export function getTeamDrivers(teamId: string): Driver[] {
  return drivers.filter((d) => d.teamId === teamId);
}
