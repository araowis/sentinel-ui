/**
 * useApiCall — generic hook for async data fetching.
 *
 * Returns { data, loading, error, refetch }.
 *
 * Usage
 * ─────
 *   const { data, loading, error, refetch } = useApiCall(
 *     () => getIncidents({ status: 'OPEN' }),
 *     [statusFilter]        // re-fetch when these change
 *   );
 *
 * Error handling
 * ──────────────
 * Any Error thrown by `fn` lands in `error` as a string. The axios client
 * already converts HTTP errors to readable messages (see api/client.ts).
 * 422 FastAPI validation errors include the backend detail string.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiCall<T>(
  fn: () => Promise<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: any[] = [],
): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Use a ref to avoid stale-closure issues with the fn reference
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const execute = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('[useApiCall]', message);
      setState({ data: null, loading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
