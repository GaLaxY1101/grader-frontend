'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePollingOptions<T> {
  intervalMs?: number;
  /** Stop polling once this predicate returns true for the fetched data. */
  stopWhen?: (data: T) => boolean;
}

/**
 * Polls `fetcher` every `intervalMs` ms.
 * Stops automatically when `stopWhen` returns true.
 * Cleans up the interval on unmount.
 */
export const usePolling = <T>(
  fetcher: () => Promise<T>,
  { intervalMs = 3000, stopWhen }: UsePollingOptions<T> = {},
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stoppedRef = useRef(false);
  // Keep a stable ref to fetcher so the interval callback doesn't go stale
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const stopWhenRef = useRef(stopWhen);
  stopWhenRef.current = stopWhen;

  const poll = useCallback(async () => {
    if (stoppedRef.current) return;
    try {
      const result = await fetcherRef.current();
      setData(result);
      if (stopWhenRef.current?.(result)) {
        stoppedRef.current = true;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Polling error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    stoppedRef.current = false;
    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [poll, intervalMs]);

  return { data, isLoading, error };
};
