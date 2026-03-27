"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook for async data fetching — replaces the repeated
 * useState + useCallback + useEffect pattern.
 *
 * Usage:
 *   const { data, loading, refresh } = useAsyncData(getTransactions, []);
 *   const { data, loading, refresh } = useAsyncData(() => getStats(month), [month]);
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
  initialData?: T,
) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      console.error("useAsyncData fetch error:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load, setData };
}

/**
 * Same as useAsyncData but for multiple parallel fetches.
 *
 * Usage:
 *   const { data, loading, refresh } = useAsyncMulti({
 *     accounts: getAccounts,
 *     categories: getCategories,
 *   }, []);
 */
export function useAsyncMulti<T extends Record<string, () => Promise<unknown>>>(
  fetchers: T,
  deps: React.DependencyList,
) {
  type Result = { [K in keyof T]: Awaited<ReturnType<T[K]>> };
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchersRef = useRef(fetchers);
  fetchersRef.current = fetchers;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const keys = Object.keys(fetchersRef.current) as (keyof T)[];
      const values = await Promise.all(keys.map((k) => fetchersRef.current[k]()));
      const result = {} as Result;
      keys.forEach((k, i) => { (result as Record<string, unknown>)[k as string] = values[i]; });
      setData(result);
    } catch (err) {
      console.error("useAsyncMulti fetch error:", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
}
