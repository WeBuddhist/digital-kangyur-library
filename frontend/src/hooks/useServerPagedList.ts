import { useCallback, useEffect, useRef, useState } from 'react';

export interface PagedResult<T> {
  items: T[];
  total: number;
}

/**
 * Server-side paginated list with a debounced search box.
 * `fetchPage` asks the API for one page; search runs on the server so it covers every page.
 */
export function useServerPagedList<T>(
  fetchPage: (page: number, limit: number, search: string) => Promise<PagedResult<T>>,
  {
    pageSize,
    onError,
    debounceMs = 300,
  }: { pageSize: number; onError?: (error: unknown) => void; debounceMs?: number }
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  // Keep the latest callbacks without re-running the fetch effect on every render
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, debounceMs);
    return () => clearTimeout(id);
  }, [searchQuery, debounceMs]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRef
      .current(page, pageSize, debouncedSearch)
      .then((result) => {
        if (cancelled) return;
        // Page emptied (e.g. last item on it deleted): step back one page
        if (result.items.length === 0 && page > 1 && result.total > 0) {
          setPage(Math.max(1, Math.ceil(result.total / pageSize)));
          return;
        }
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((error) => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        onErrorRef.current?.(error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, reloadToken]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  const goToPage = useCallback((next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    items,
    total,
    page,
    pageSize,
    setPage: goToPage,
    searchQuery,
    setSearchQuery,
    /** True once the debounced search has been applied (for "no results" messages) */
    isSearching: debouncedSearch.length > 0,
    loading,
    reload,
  };
}
