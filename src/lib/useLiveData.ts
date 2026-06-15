// useLiveData — turns a one-shot cached fetcher into a self-refreshing ("live")
// resource. On mount it loads cache-first (fast paint); then it polls every
// `intervalMs`, each poll passing `revalidate: true` so it genuinely hits the
// network (see fetchWithCache). Polling pauses while the tab is hidden and fires
// an immediate refresh when the tab becomes visible again, so we never hammer
// the API in background tabs. The fetcher is expected to never throw (the api/
// layer resolves to a stale fallback instead); we still guard defensively.
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LiveData<T> {
  /** Latest data, or null before the first load resolves. */
  data: T | null;
  /** True when the latest value came from a fallback/expired cache, not the network. */
  stale: boolean;
  /** True only during the very first load (no data yet) — drive skeletons off this. */
  loading: boolean;
  /** True while a background poll is in flight (data already on screen). */
  refreshing: boolean;
  /** Epoch ms of the last successful network refresh, or null. */
  lastUpdated: number | null;
  /** True while polling is active (tab visible). */
  live: boolean;
  /** Force an immediate revalidating refresh. */
  refresh: () => void;
}

export function useLiveData<T>(
  fetcher: (revalidate: boolean) => Promise<{ data: T; stale: boolean }>,
  intervalMs: number,
): LiveData<T> {
  const [data, setData] = useState<T | null>(null);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [live, setLive] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  );

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const lastFetchRef = useRef(0); // epoch ms a fetch last started (throttle gate)

  const run = useCallback(async (revalidate: boolean) => {
    if (inFlightRef.current) return; // never overlap requests
    inFlightRef.current = true;
    lastFetchRef.current = Date.now();
    if (revalidate) setRefreshing(true);
    try {
      const res = await fetcherRef.current(revalidate);
      if (!mountedRef.current) return;
      setData(res.data);
      setStale(res.stale);
      if (!res.stale) setLastUpdated(Date.now());
    } catch {
      if (mountedRef.current) setStale(true); // fetchers shouldn't throw; guard anyway
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
      inFlightRef.current = false;
    }
  }, []);

  // First load (and a clean reset whenever the fetcher identity changes — e.g.
  // a different driverId), cache-first for a fast paint.
  useEffect(() => {
    mountedRef.current = true;
    setData(null);
    setStale(false);
    setLastUpdated(null);
    setLoading(true);
    void run(false);
    return () => {
      mountedRef.current = false;
    };
  }, [fetcher, run]);

  // Poll on an interval, paused while hidden; refresh immediately on re-show.
  useEffect(() => {
    let id: number | undefined;
    const stop = () => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    const start = () => {
      stop();
      id = window.setInterval(() => void run(true), intervalMs);
    };
    const onVisibility = () => {
      if (document.hidden) {
        setLive(false);
        stop();
      } else {
        setLive(true);
        // Only force an immediate refresh if the data is already at least one
        // interval old — otherwise rapid visibility flapping (some embedded/
        // headless browsers fire visibilitychange repeatedly) would storm the API.
        if (Date.now() - lastFetchRef.current >= intervalMs) void run(true);
        start();
      }
    };
    if (!document.hidden) {
      setLive(true);
      start();
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs, run, fetcher]);

  const refresh = useCallback(() => void run(true), [run]);

  return { data, stale, loading, refreshing, lastUpdated, live, refresh };
}
