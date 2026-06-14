// Refresh committed fallback snapshots from Jolpica — run via
// `npm run data:refresh` (wired to tsx in package.json). Node 18+ (global
// fetch). Rewrites:
//   src/data/fallbacks/standings.ts
//   src/data/fallbacks/driverResults.ts
//
// Strategy: 3 logical pulls — constructor standings, driver standings, and
// the season-wide results feed (paginated with limit=100/offset, since
// 24 rounds × 22 cars exceeds one page) which is then grouped per driver.
// This keeps it at a handful of HTTP calls instead of 22 per-driver calls.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ConstructorStanding, DriverSeasonResult, DriverStanding } from '../src/types';
import { jolpicaConstructorId, jolpicaDriverId } from '../src/data/idMaps';

const BASE = 'https://api.jolpi.ca/ergast/f1';
const SEASON = '2026';
const LIMIT = 100;

// ---------- JSON narrowing helpers (mirror src/lib/api/jolpica.ts) ----------

function obj(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};
}
function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : 0;
}

function invert(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [ours, theirs] of Object.entries(map)) out[theirs] = ours;
  return out;
}

const teamIdByConstructor = invert(jolpicaConstructorId);
const driverIdByJolpica = invert(jolpicaDriverId);

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<unknown>;
}

/** Fetch every page of an MRData endpoint, extracting items per page. */
async function fetchAllPages(
  path: string,
  extract: (mrData: Record<string, unknown>) => unknown[],
): Promise<unknown[]> {
  const items: unknown[] = [];
  let offset = 0;
  for (;;) {
    const sep = path.includes('?') ? '&' : '?';
    const json = await fetchJson(`${BASE}/${path}${sep}limit=${LIMIT}&offset=${offset}`);
    const mrData = obj(obj(json).MRData);
    items.push(...extract(mrData));
    const total = num(mrData.total);
    offset += LIMIT;
    if (offset >= total) break;
  }
  return items;
}

// ---------- pulls ----------

async function pullConstructorStandings(): Promise<ConstructorStanding[]> {
  const json = await fetchJson(`${BASE}/${SEASON}/constructorstandings.json?limit=${LIMIT}`);
  const lists = arr(obj(obj(obj(json).MRData).StandingsTable).StandingsLists);
  return arr(obj(lists[0]).ConstructorStandings).map((rowRaw): ConstructorStanding => {
    const row = obj(rowRaw);
    const constructor = obj(row.Constructor);
    const apiId = str(constructor.constructorId);
    return {
      position: num(row.position),
      teamId: teamIdByConstructor[apiId] ?? apiId,
      teamName: str(constructor.name),
      points: num(row.points),
      wins: num(row.wins),
    };
  });
}

async function pullDriverStandings(): Promise<DriverStanding[]> {
  const json = await fetchJson(`${BASE}/${SEASON}/driverstandings.json?limit=${LIMIT}`);
  const lists = arr(obj(obj(obj(json).MRData).StandingsTable).StandingsLists);
  return arr(obj(lists[0]).DriverStandings).map((rowRaw): DriverStanding => {
    const row = obj(rowRaw);
    const driver = obj(row.Driver);
    const constructors = arr(row.Constructors);
    const team = obj(constructors[constructors.length - 1]);
    const apiDriverId = str(driver.driverId);
    const apiTeamId = str(team.constructorId);
    return {
      position: num(row.position),
      driverId: driverIdByJolpica[apiDriverId] ?? apiDriverId,
      driverName: `${str(driver.givenName)} ${str(driver.familyName)}`.trim(),
      teamId: teamIdByConstructor[apiTeamId] ?? apiTeamId,
      points: num(row.points),
      wins: num(row.wins),
    };
  });
}

async function pullDriverResults(): Promise<Record<string, DriverSeasonResult[]>> {
  const races = await fetchAllPages(`${SEASON}/results.json`, (mrData) =>
    arr(obj(mrData.RaceTable).Races),
  );
  const byDriver: Record<string, DriverSeasonResult[]> = {};
  for (const raceRaw of races) {
    const race = obj(raceRaw);
    const round = num(race.round);
    const raceName = str(race.raceName);
    for (const resultRaw of arr(race.Results)) {
      const result = obj(resultRaw);
      const apiDriverId = str(obj(result.Driver).driverId);
      const driverId = driverIdByJolpica[apiDriverId] ?? apiDriverId;
      const status = str(result.status);
      const positionText = str(result.positionText) || str(result.position);
      const classified = /^\d+$/.test(positionText);
      const position = classified ? parseInt(positionText, 10) : null;
      const dnf = status !== 'Finished' && !/^\+\d+ Laps?$/.test(status);
      (byDriver[driverId] ??= []).push({
        round,
        raceName,
        position,
        points: num(result.points),
        podium: position !== null && position <= 3 && !dnf,
        dnf,
        status,
      });
    }
  }
  for (const results of Object.values(byDriver)) {
    results.sort((a, b) => a.round - b.round);
  }
  return byDriver;
}

// ---------- snapshot writers ----------

function fmt(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function writeStandings(
  fetchedAt: string,
  constructors: ConstructorStanding[],
  drivers: DriverStanding[],
): void {
  const file = fileURLToPath(new URL('../src/data/fallbacks/standings.ts', import.meta.url));
  const src = `// Committed offline fallback for /standings — consumed by
// src/lib/api/jolpica.ts (getConstructorStandings / getDriverStandings).
// GENERATED by scripts/refresh-data.ts (\`npm run data:refresh\`) — do not
// hand-edit. Snapshot of live Jolpica data.
import type { ConstructorStanding, DriverStanding } from '../../types';

export const standingsSnapshot: {
  fetchedAt: string;
  constructors: ConstructorStanding[];
  drivers: DriverStanding[];
} = {
  fetchedAt: '${fetchedAt}',
  constructors: ${fmt(constructors).replace(/\n/g, '\n  ')},
  drivers: ${fmt(drivers).replace(/\n/g, '\n  ')},
};

export const fallbackConstructorStandings: ConstructorStanding[] = standingsSnapshot.constructors;
export const fallbackDriverStandings: DriverStanding[] = standingsSnapshot.drivers;
`;
  writeFileSync(file, src, 'utf8');
  console.log(`wrote ${file} (${constructors.length} constructors, ${drivers.length} drivers)`);
}

function writeDriverResults(
  fetchedAt: string,
  results: Record<string, DriverSeasonResult[]>,
): void {
  const file = fileURLToPath(new URL('../src/data/fallbacks/driverResults.ts', import.meta.url));
  const src = `// Committed offline fallback for /teams/:teamId/drivers/:driverId —
// consumed by src/lib/api/jolpica.ts (getDriverSeasonResults).
// Keyed by OUR driver slug (see src/data/idMaps.ts).
// GENERATED by scripts/refresh-data.ts (\`npm run data:refresh\`) — do not
// hand-edit. Snapshot of live Jolpica data.
import type { DriverSeasonResult } from '../../types';

export const driverResultsSnapshot: {
  fetchedAt: string;
  results: Record<string, DriverSeasonResult[]>;
} = {
  fetchedAt: '${fetchedAt}',
  results: ${fmt(results).replace(/\n/g, '\n  ')},
};

export const fallbackDriverResults: Record<string, DriverSeasonResult[]> =
  driverResultsSnapshot.results;
`;
  writeFileSync(file, src, 'utf8');
  console.log(`wrote ${file} (${Object.keys(results).length} drivers)`);
}

// ---------- main ----------

async function main(): Promise<void> {
  const fetchedAt = new Date().toISOString().slice(0, 10);
  console.log(`Refreshing ${SEASON} fallback snapshots (${fetchedAt})…`);
  const [constructors, drivers, results] = await Promise.all([
    pullConstructorStandings(),
    pullDriverStandings(),
    pullDriverResults(),
  ]);
  if (constructors.length === 0 && drivers.length === 0) {
    console.warn('WARNING: empty standings payload — season may not have started; writing anyway.');
  }
  writeStandings(fetchedAt, constructors, drivers);
  writeDriverResults(fetchedAt, results);
  console.log('Done.');
}

main().catch((err: unknown) => {
  console.error('refresh-data failed — existing snapshots left untouched.');
  console.error(err);
  process.exitCode = 1;
});
