import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

/**
 * Server-driven table state: debounced search, filters, sorting and
 * pagination, replacing the hand-rolled filter/sort/.slice() chains that
 * used to be duplicated across Employees.jsx, Attendance.jsx,
 * LeaveApproval.jsx and AttendanceReport.jsx.
 *
 * `fetchPage(params, signal)` must call the domain service and return
 * either a bare array (endpoint not yet paginated) or `{ data, pagination }`
 * as returned by the backend's `success(data=..., pagination=...)` shape.
 */
export function useDataTable({
  fetchPage,
  initialFilters = {},
  pageSize = 20,
  searchDelay = 400,
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFiltersState] = useState(initialFilters);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(search, searchDelay);
  const abortRef = useRef(null);
  const filtersKey = JSON.stringify(filters);

  const setFilters = useCallback((next) => {
    setFiltersState((prev) => (typeof next === "function" ? next(prev) : next));
  }, []);

  // Any change to search/filters/sort restarts pagination at page 1.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filtersKey, sortBy, sortOrder]);

  const load = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    const params = {
      page,
      limit: pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(sortBy ? { sortBy, sortOrder } : {}),
      ...filters,
    };

    return fetchPage(params, controller.signal)
      .then((result) => {
        const isPaginated = result && !Array.isArray(result) && "data" in result;
        setRows(isPaginated ? result.data : result || []);
        setTotal(isPaginated && result.pagination ? result.pagination.total : (isPaginated ? result.data : result || []).length);
      })
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch, sortBy, sortOrder, filtersKey, fetchPage]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return {
    rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    loading,
    error,
    refetch: load,
  };
}
