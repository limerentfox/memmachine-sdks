import { FormEvent, useCallback, useMemo, useRef, useState } from 'react';
import type { SearchQuery, SearchResult, SessionData } from '@instruct/memmachine-sdk';
import { useMemMachineClient } from '../hooks/useMemMachineClient.js';

export interface MemorySearchProps {
  session: SessionData;
  initialQuery?: string;
  store?: 'all' | 'episodic' | 'profile';
  limit?: number;
  onResult?: (result: SearchResult) => void;
  renderResult?: (result: SearchResult) => JSX.Element;
  submitLabel?: string;
}

export function MemorySearch({ session, initialQuery = '', store = 'all', limit, onResult, renderResult, submitLabel = 'Search' }: MemorySearchProps) {
  const client = useMemMachineClient();
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const mounted = useRef(true);
  const reqId = useRef(0);

  const doSearch = useCallback(async () => {
    const myReq = ++reqId.current;
    setLoading(true); setError(null);
    try {
      const body: SearchQuery = { session, query, ...(limit ? { limit } : {}) };
      const res = await (store === 'episodic' ? client.memories.searchEpisodic(body) : store === 'profile' ? client.memories.searchProfile(body) : client.memories.search(body));
      if (!mounted.current || myReq !== reqId.current) return;
      setResult(res);
      onResult?.(res);
    } catch (e) {
      if (!mounted.current || myReq !== reqId.current) return;
      setError(e as Error);
    } finally {
      if (mounted.current && myReq === reqId.current) setLoading(false);
    }
  }, [client, limit, onResult, query, session, store]);

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    void doSearch();
  }, [doSearch]);

  const content = useMemo(() => {
    if (loading) return <div role="status">Searching…</div>;
    if (error) return <div role="alert" style={{ color: 'red' }}>{error.message}</div>;
    if (!result) return null;
    return renderResult ? renderResult(result) : (
      <pre aria-live="polite" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
    );
  }, [error, loading, renderResult, result]);

  return (
    <div>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your query…"
          aria-label="Query"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading}>{submitLabel}</button>
      </form>
      <div style={{ marginTop: 8 }}>{content}</div>
    </div>
  );
}

export default MemorySearch;
