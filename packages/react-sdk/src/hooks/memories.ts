import { useMemo, useRef, useCallback } from 'react';
import type { DeleteDataRequest, NewEpisode, SearchQuery, SearchResult } from '@instruct/memmachine-sdk';
import { useMemMachineClient } from './useMemMachineClient.js';
import { useMutation, useQuery, useLazyQuery } from './common.js';

export function useAddMemory() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => (input: NewEpisode) => client.memories.add(input), [client]);
  return useMutation<NewEpisode, void>(mutator);
}

export function useAddEpisodicMemory() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => (input: NewEpisode) => client.memories.addEpisodic(input), [client]);
  return useMutation<NewEpisode, void>(mutator);
}

export function useAddProfileMemory() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => (input: NewEpisode) => client.memories.addProfile(input), [client]);
  return useMutation<NewEpisode, void>(mutator);
}

export function useDeleteMemoryData() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => (input: DeleteDataRequest) => client.memories.delete(input), [client]);
  return useMutation<DeleteDataRequest, void>(mutator);
}

export function useSearchMemories(params: SearchQuery, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.memories.search(params), [client, params]);
  const deps = useMemo(() => [fetcher], [fetcher]);
  return useQuery<SearchResult>(fetcher, deps, { enabled: options?.enabled });
}

export function useLazySearchMemories() {
  const client = useMemMachineClient();
  const paramsRef = useRef<SearchQuery | null>(null);
  const fetcher = useMemo(() => () => {
    if (!paramsRef.current) return Promise.reject(new Error('params required'));
    return client.memories.search(paramsRef.current);
  }, [client]);
  const [runBase, state] = useLazyQuery<SearchResult>(fetcher);
  const run = useCallback((params: SearchQuery) => {
    paramsRef.current = params;
    return runBase();
  }, [runBase]);
  return [run, state] as const;
}

export function useSearchEpisodicMemories(params: SearchQuery, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.memories.searchEpisodic(params), [client, params]);
  return useQuery<SearchResult>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useSearchProfileMemories(params: SearchQuery, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.memories.searchProfile(params), [client, params]);
  return useQuery<SearchResult>(fetcher, [fetcher], { enabled: options?.enabled });
}
