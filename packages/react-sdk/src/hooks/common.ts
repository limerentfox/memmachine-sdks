import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '@instruct/memmachine-sdk';
import type { Mutation, MutationState, QueryState } from '../types.js';

function useIsMounted() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
}

export function useQuery<T>(fetcher: () => Promise<T>, deps: ReadonlyArray<unknown>, opts?: { skip?: boolean; enabled?: boolean }): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ status: 'idle', loading: false, data: null, error: null });
  const isMounted = useIsMounted();
  const enabled = opts?.enabled ?? !opts?.skip ?? true;
  const reqId = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let canceled = false;
    const myReq = ++reqId.current;
    setState((s) => ({ ...s, status: 'loading', loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (!isMounted.current || canceled || myReq !== reqId.current) return;
        setState({ status: 'success', loading: false, data, error: null });
      })
      .catch((err: unknown) => {
        if (!isMounted.current || canceled || myReq !== reqId.current) return;
        const apiErr = (err instanceof Error ? (err as any) : new Error(String(err))) as ApiError;
        setState({ status: 'error', loading: false, data: null, error: apiErr });
      });
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function useLazyQuery<T>(fetcher: () => Promise<T>): [() => Promise<T>, QueryState<T>] {
  const [state, setState] = useState<QueryState<T>>({ status: 'idle', loading: false, data: null, error: null });
  const isMounted = useIsMounted();
  const reqId = useRef(0);

  const run = useCallback(async () => {
    const myReq = ++reqId.current;
    setState({ status: 'loading', loading: true, data: null, error: null });
    try {
      const data = await fetcher();
      if (!isMounted.current || myReq !== reqId.current) return Promise.reject('canceled');
      setState({ status: 'success', loading: false, data, error: null });
      return data;
    } catch (err) {
      const apiErr = (err instanceof Error ? (err as any) : new Error(String(err))) as ApiError;
      if (isMounted.current && myReq === reqId.current) setState({ status: 'error', loading: false, data: null, error: apiErr });
      throw apiErr;
    }
  }, [fetcher]);

  return [run, state];
}

export function useMutation<TInput, TOutput>(mutator: (input: TInput) => Promise<TOutput>): Mutation<TInput, TOutput> {
  const [state, setState] = useState<MutationState<TOutput>>({ status: 'idle', loading: false, data: null, error: null });
  const isMounted = useIsMounted();
  const reqId = useRef(0);

  const mutate = useCallback(async (input: TInput) => {
    const myReq = ++reqId.current;
    setState({ status: 'loading', loading: true, data: null, error: null });
    try {
      const data = await mutator(input);
      if (!isMounted.current || myReq !== reqId.current) return Promise.reject('canceled');
      setState({ status: 'success', loading: false, data, error: null });
      return data;
    } catch (err) {
      const apiErr = (err instanceof Error ? (err as any) : new Error(String(err))) as ApiError;
      if (isMounted.current && myReq === reqId.current) setState({ status: 'error', loading: false, data: null, error: apiErr });
      throw apiErr;
    }
  }, [mutator]);

  const reset = useCallback(() => setState({ status: 'idle', loading: false, data: null, error: null }), []);

  return { ...state, mutate, reset };
}
