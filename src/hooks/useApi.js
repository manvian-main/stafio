import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Generic data-fetching hook: loading/error/data/refetch with automatic
 * request cancellation (AbortController) so a fast unmount or a fast
 * re-trigger never lets a stale response overwrite a newer one.
 *
 * `fetcher` receives an AbortSignal as its last argument — pass it through
 * to apiClient calls as `{ signal }`.
 */
export function useApi(fetcher, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const abortRef = useRef(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback((...args) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    return fetcherRef.current(controller.signal, ...args)
      .then((result) => {
        setData(result);
        return result;
      })
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setError(err);
        throw err;
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) run().catch(() => {});
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  return { data, error, loading, refetch: run, setData };
}
