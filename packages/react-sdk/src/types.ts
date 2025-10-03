import type { ApiError } from '@instruct/memmachine-sdk';

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface QueryState<T> {
  status: Status;
  loading: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface MutationState<T> {
  status: Status;
  loading: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface Mutation<TInput, TOutput> extends MutationState<TOutput> {
  mutate: (input: TInput) => Promise<TOutput>;
  reset: () => void;
}

export type NoInfer<T> = [T][T extends any ? 0 : never];
