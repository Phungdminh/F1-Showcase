// Cached fetch core — PLAN §3 API surface. Never throws to UI: every error
// path resolves to usable data flagged `stale: true` ("dữ liệu lưu tạm").
// Cache layers: in-memory Map → localStorage (guarded for non-browser env)
// → network → last-known expired value → caller-provided static fallback.

interface CacheEntry {
  value: unknown;
  expiresAt: number; // epoch ms
}

const memCache = new Map<string, CacheEntry>();
const LS_PREFIX = 'f1sc:';

function readLocalStorage(key: string): CacheEntry | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as CacheEntry).expiresAt !== 'number'
    ) {
      return null;
    }
    return parsed as CacheEntry;
  } catch {
    return null; // corrupt entry / storage blocked — behave as cache miss
  }
}

function writeLocalStorage(key: string, entry: CacheEntry): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota exceeded / private mode — in-memory cache still works
  }
}

/**
 * Fetch `url`, parse it with `parse`, and cache the parsed value under `key`
 * for `ttlMs`. On any fetch/parse error returns, in order of preference:
 * last-known cached value (even expired) or `fallback` — always with
 * `stale: true`. Resolves in every case; never rejects.
 *
 * `opts.revalidate` (used by the live-polling hook) skips the fresh-cache
 * short-circuit and always hits the network, so a poll genuinely refreshes;
 * the cache is still consulted as a fallback if that network call fails.
 */
export async function fetchWithCache<T>(
  key: string,
  url: string,
  ttlMs: number,
  fallback: T,
  parse: (json: unknown) => T,
  opts: { revalidate?: boolean } = {},
): Promise<{ data: T; stale: boolean }> {
  const now = Date.now();

  const mem = memCache.get(key);
  const stored = readLocalStorage(key);

  if (!opts.revalidate) {
    if (mem && mem.expiresAt > now) {
      return { data: mem.value as T, stale: false };
    }
    if (stored && stored.expiresAt > now) {
      memCache.set(key, stored);
      return { data: stored.value as T, stale: false };
    }
  }

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const json: unknown = await res.json();
    const data = parse(json);
    const entry: CacheEntry = { value: data, expiresAt: now + ttlMs };
    memCache.set(key, entry);
    writeLocalStorage(key, entry);
    return { data, stale: false };
  } catch {
    if (mem) return { data: mem.value as T, stale: true };
    if (stored) return { data: stored.value as T, stale: true };
    return { data: fallback, stale: true };
  }
}
