// Jolpica (Ergast-compatible) typed fetchers — PLAN §3 API surface.
// Maps API entities to our contracts via src/data/idMaps.ts.
// Every fetcher resolves `{ data, stale }` and never throws (client.ts).
//
// Pagination note: requests use `limit=100`; every season-scoped endpoint
// consumed here tops out well under 100 items (24 races, 22 drivers,
// 11 constructors, ≤24 results per driver), so one page is always complete.
// The bulk all-driver results endpoint (24×22 rows > 100) is only used by
// scripts/refresh-data.ts, which loops offsets explicitly.
import type {
  ConstructorStanding,
  DriverSeasonResult,
  DriverStanding,
  Race,
} from '../../types';
import { fetchWithCache } from './client';
import {
  jolpicaCircuitId,
  jolpicaConstructorId,
  jolpicaDriverId,
} from '../../data/idMaps';
import { calendar } from '../../data/calendar';
import {
  fallbackConstructorStandings,
  fallbackDriverStandings,
} from '../../data/fallbacks/standings';
import { fallbackDriverResults } from '../../data/fallbacks/driverResults';

const BASE = 'https://api.jolpi.ca/ergast/f1';
const SEASON = '2026';

const TTL_RESULTS = 15 * 60 * 1000; // 15 min
const TTL_STANDINGS = 10 * 60 * 1000; // 10 min
const TTL_SCHEDULE = 24 * 60 * 60 * 1000; // 24 h

// ---------- reverse id maps (Jolpica id → our slug) ----------

function invert(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [ours, theirs] of Object.entries(map)) out[theirs] = ours;
  return out;
}

const teamIdByConstructor = invert(jolpicaConstructorId);
const driverIdByJolpica = invert(jolpicaDriverId);
const circuitIdByJolpica = invert(jolpicaCircuitId);

// ---------- defensive JSON narrowing helpers ----------

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

// ---------- fetchers ----------

/**
 * 2026 round-by-round results for one of our driver slugs (e.g.
 * "lando-norris"). Rounds not yet raced are simply absent from the API
 * response — callers render what exists. TTL 15 min.
 */
export async function getDriverSeasonResults(
  driverId: string,
): Promise<{ data: DriverSeasonResult[]; stale: boolean }> {
  const jolpicaId = jolpicaDriverId[driverId];
  const fallback = fallbackDriverResults[driverId] ?? [];
  if (!jolpicaId) {
    // unmapped slug — never throw to UI
    return { data: fallback, stale: true };
  }
  return fetchWithCache<DriverSeasonResult[]>(
    `driver-results:${SEASON}:${driverId}`,
    `${BASE}/${SEASON}/drivers/${jolpicaId}/results.json?limit=100`,
    TTL_RESULTS,
    fallback,
    (json) => {
      const races = arr(obj(obj(obj(json).MRData).RaceTable).Races);
      return races.map((raceRaw): DriverSeasonResult => {
        const race = obj(raceRaw);
        const result = obj(arr(race.Results)[0]);
        const status = str(result.status);
        const positionText = str(result.positionText) || str(result.position);
        const classified = /^\d+$/.test(positionText);
        const position = classified ? parseInt(positionText, 10) : null;
        // Ergast convention: anything but "Finished" / "+n Lap(s)" is a non-finish.
        const dnf = status !== 'Finished' && !/^\+\d+ Laps?$/.test(status);
        return {
          round: num(race.round),
          raceName: str(race.raceName),
          position,
          points: num(result.points),
          podium: position !== null && position <= 3 && !dnf,
          dnf,
          status,
        };
      });
    },
  );
}

/** Current 2026 constructor standings. TTL 10 min. */
export async function getConstructorStandings(): Promise<{
  data: ConstructorStanding[];
  stale: boolean;
}> {
  return fetchWithCache<ConstructorStanding[]>(
    `constructor-standings:${SEASON}`,
    `${BASE}/${SEASON}/constructorstandings.json?limit=100`,
    TTL_STANDINGS,
    fallbackConstructorStandings,
    (json) => {
      const lists = arr(obj(obj(obj(json).MRData).StandingsTable).StandingsLists);
      const rows = arr(obj(lists[0]).ConstructorStandings);
      return rows.map((rowRaw): ConstructorStanding => {
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
    },
  );
}

/** Current 2026 driver standings. TTL 10 min. */
export async function getDriverStandings(): Promise<{
  data: DriverStanding[];
  stale: boolean;
}> {
  return fetchWithCache<DriverStanding[]>(
    `driver-standings:${SEASON}`,
    `${BASE}/${SEASON}/driverstandings.json?limit=100`,
    TTL_STANDINGS,
    fallbackDriverStandings,
    (json) => {
      const lists = arr(obj(obj(obj(json).MRData).StandingsTable).StandingsLists);
      const rows = arr(obj(lists[0]).DriverStandings);
      return rows.map((rowRaw): DriverStanding => {
        const row = obj(rowRaw);
        const driver = obj(row.Driver);
        const constructors = arr(row.Constructors);
        // mid-season swaps list multiple constructors — current team is last
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
    },
  );
}

/**
 * Live 2026 schedule (non-blocking verification of the calendar seed,
 * PLAN §1). Falls back to the committed seed. TTL 24 h.
 */
export async function getSchedule(): Promise<{ data: Race[]; stale: boolean }> {
  return fetchWithCache<Race[]>(
    `schedule:${SEASON}`,
    `${BASE}/${SEASON}.json?limit=100`,
    TTL_SCHEDULE,
    calendar,
    (json) => {
      const races = arr(obj(obj(obj(json).MRData).RaceTable).Races);
      if (races.length === 0) throw new Error('empty schedule payload');
      return races.map((raceRaw): Race => {
        const race = obj(raceRaw);
        const circuit = obj(race.Circuit);
        const location = obj(circuit.Location);
        const apiCircuitId = str(circuit.circuitId);
        return {
          round: num(race.round),
          name: str(race.raceName),
          country: str(location.country),
          city: str(location.locality),
          circuitId: circuitIdByJolpica[apiCircuitId] ?? apiCircuitId,
          date: str(race.date),
          lat: num(location.lat),
          lng: num(location.long),
        };
      });
    },
  );
}
