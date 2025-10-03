# Hooks Reference (React TypeScript)

This guide documents every exported hook from `@instruct/memmachine-react-sdk` with accurate TypeScript signatures, parameters, return types, and usage examples.

Contents:
- Context & client hooks
- Query utilities (generic)
- REST: Memories
- REST: Sessions
- MCP: Memories & Sessions

> Return state shape for queries and mutations derives from `QueryState<T>` and `Mutation<TInput, TOutput>`:
>
> ```ts
> type Status = 'idle' | 'loading' | 'success' | 'error';
>
> interface QueryState<T> { status: Status; loading: boolean; data: T | null; error: ApiError | null }
> interface MutationState<T> { status: Status; loading: boolean; data: T | null; error: ApiError | null }
> interface Mutation<TInput, TOutput> extends MutationState<TOutput> { mutate: (input: TInput) => Promise<TOutput>; reset: () => void }
> ```

## Context & Client Hooks

### useMemMachineClient
```ts
function useMemMachineClient(options?: Omit<ClientOptions, 'fetch'>): MemMachineClient
```
- Parameters:
  - options: override options to get a scoped client (keeps provider config as defaults)
- Returns: `MemMachineClient`
- Example:
```ts
import { useMemMachineClient } from '@instruct/memmachine-react-sdk/hooks';

const client = useMemMachineClient({ apiKey: 'override-token' });
await client.health();
```

### useApiKey
```ts
function useApiKey(): [string | undefined, (token?: string) => void]
```
- Returns: tuple of current apiKey and setter. Setter updates the client used by the provider.
- Example:
```tsx
const [apiKey, setApiKey] = useApiKey();
<button onClick={() => setApiKey(undefined)}>Sign out</button>
```

### useHealth
```ts
function useHealth(): QueryState<HealthResponse>
```
- Auto-fetches health on mount.
- Example:
```tsx
const { data, loading, error } = useHealth();
```

## Query Utilities (Generic)

These are exported for advanced use cases. Most apps will use the domain hooks below.

### useQuery
```ts
function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  opts?: { skip?: boolean; enabled?: boolean }
): QueryState<T>
```
- Triggers when `deps` change (like a very light query library).
- `enabled` (preferred) gates execution. `skip` is also supported.
- Example:
```ts
const client = useMemMachineClient();
const { data } = useQuery(() => client.health(), [client]);
```

### useLazyQuery
```ts
function useLazyQuery<T>(fetcher: () => Promise<T>): [run: () => Promise<T>, state: QueryState<T>]
```
- Returns a function you call to run the request on demand.
- Example:
```ts
const client = useMemMachineClient();
const [run, state] = useLazyQuery(() => client.health());
await run();
```

### useMutation
```ts
function useMutation<TInput, TOutput>(mutator: (input: TInput) => Promise<TOutput>): Mutation<TInput, TOutput>
```
- Ideal for POST/PUT/DELETE flows with success/error states.
- Example:
```ts
const add = useMutation((input: NewEpisode) => client.memories.add(input));
await add.mutate({ /* ... */ } as NewEpisode);
```

## REST: Memories Hooks

All types come from `@instruct/memmachine-sdk`.

### useAddMemory
```ts
function useAddMemory(): Mutation<NewEpisode, void>
```
- Calls `client.memories.add`.

### useAddEpisodicMemory
```ts
function useAddEpisodicMemory(): Mutation<NewEpisode, void>
```
- Calls `client.memories.addEpisodic`.

### useAddProfileMemory
```ts
function useAddProfileMemory(): Mutation<NewEpisode, void>
```
- Calls `client.memories.addProfile`.

### useDeleteMemoryData
```ts
function useDeleteMemoryData(): Mutation<DeleteDataRequest, void>
```
- Calls `client.memories.delete`.

### useSearchMemories
```ts
function useSearchMemories(
  params: SearchQuery,
  options?: { enabled?: boolean }
): QueryState<SearchResult>
```
- Calls `client.memories.search(params)`.

### useLazySearchMemories
```ts
function useLazySearchMemories(): [
  (params: SearchQuery) => Promise<SearchResult>,
  QueryState<SearchResult>
]
```
- Lazily run a search with dynamic parameters.

### useSearchEpisodicMemories
```ts
function useSearchEpisodicMemories(
  params: SearchQuery,
  options?: { enabled?: boolean }
): QueryState<SearchResult>
```
- Calls `client.memories.searchEpisodic(params)`.

### useSearchProfileMemories
```ts
function useSearchProfileMemories(
  params: SearchQuery,
  options?: { enabled?: boolean }
): QueryState<SearchResult>
```
- Calls `client.memories.searchProfile(params)`.

Example usage:
```tsx
const { data, loading, error } = useSearchMemories({ session, query: 'hello', limit: 5 });
```

## REST: Sessions Hooks

### useSessionsAll
```ts
function useSessionsAll(options?: { enabled?: boolean }): QueryState<AllSessionsResponse>
```

### useSessionsForUser
```ts
function useSessionsForUser(
  userId: string,
  options?: { enabled?: boolean }
): QueryState<AllSessionsResponse>
```

### useSessionsForGroup
```ts
function useSessionsForGroup(
  groupId: string,
  options?: { enabled?: boolean }
): QueryState<AllSessionsResponse>
```

### useSessionsForAgent
```ts
function useSessionsForAgent(
  agentId: string,
  options?: { enabled?: boolean }
): QueryState<AllSessionsResponse>
```

Example usage:
```tsx
const { data } = useSessionsForUser('user-123');
```

## MCP: Memory & Session Hooks

MCP hooks call the `client.mcp` endpoints.

### Memory mutations
```ts
function useMcpAddSessionMemory(): Mutation<NewEpisode, McpStatus>
function useMcpAddEpisodicMemory(): Mutation<NewEpisode, McpStatus>
function useMcpAddProfileMemory(): Mutation<NewEpisode, McpStatus>
```

### Memory searches
```ts
function useMcpSearchSessionMemory(
  params: SearchQuery,
  options?: { enabled?: boolean }
): QueryState<SearchResult>

function useMcpSearchEpisodicMemory(
  params: SearchQuery,
  options?: { enabled?: boolean }
): QueryState<SearchResult>

function useMcpSearchProfileMemory(
  params: SearchQuery,
  options?: { enabled?: boolean }
): QueryState<SearchResult>
```

### Data deletion
```ts
function useMcpDeleteSessionData(): Mutation<DeleteDataRequest, McpStatus>
function useMcpDeleteData(): Mutation<void, McpStatus> // call mutate() with no args
```

### Sessions
```ts
function useMcpSessions(options?: { enabled?: boolean }): QueryState<AllSessionsResponse>
function useMcpUserSessions(userId: string, options?: { enabled?: boolean }): QueryState<AllSessionsResponse>
function useMcpGroupSessions(groupId: string, options?: { enabled?: boolean }): QueryState<AllSessionsResponse>
function useMcpAgentSessions(agentId: string, options?: { enabled?: boolean }): QueryState<AllSessionsResponse>
```

## Patterns & Tips
- Prefer `enabled: Boolean(x)` to guard queries until inputs are present.
- For one-off actions, `useMutation` with `await mutate()` simplifies flow control.
- For aggressive UX, combine `useMutation` with optimistic UI and a follow‑up query refresh (see TUTORIALS.md).
