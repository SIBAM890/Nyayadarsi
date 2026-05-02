/**
 * Generic async data fetching hook.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '@/types/api';

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Hook for declarative data fetching.
 * Calls `fetchFn` on mount and provides a `refetch` function.
 */
export function useApi<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  deps: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchFn();
    if (mountedRef.current) {
      setData(result.data);
      setError(result.error);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute]);

  return { data, error, loading, refetch: execute };
}
