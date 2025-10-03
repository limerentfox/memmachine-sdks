# API Reference

This reference documents every public type and method exported by `@instruct/memmachine-sdk`.

- Entry point: `MemMachineClient`
- Error class: `ApiError`
- Types: `ClientOptions`, `SessionData`, `NewEpisode`, `SearchQuery`, `SearchResult`, `DeleteDataRequest`, `MemorySession`, `AllSessionsResponse`, `HealthResponse`, `McpStatus`

Importing:

```ts
import {
  MemMachineClient,
  ApiError,
  type ClientOptions,
  type SessionData,
  type NewEpisode,
  type SearchQuery,
  type SearchResult,
  type DeleteDataRequest,
  type MemorySession,
  type AllSessionsResponse,
  type HealthResponse,
  type McpStatus,
} from '@instruct/memmachine-sdk';
```

## MemMachineClient

### constructor(options?: ClientOptions)
Creates a client configured for your environment.

```ts
const client = new MemMachineClient({
  baseUrl: 'http://localhost:8080',
  apiKey: process.env.MEMMACHINE_API_KEY,
  timeoutMs: 15000,
  headers: { 'X-App': 'my-app' },
  fetch: globalThis.fetch,
  restPrefix: '/v1',
  mcpPrefix: '/mcp',
});
```

- Defaults:
  - baseUrl: `http://localhost:8080`
  - headers: `{ 'Content-Type': 'application/json' }`
  - timeoutMs: `15000`
  - restPrefix: `/v1`
  - mcpPrefix: `/mcp`

### Properties

- http: HttpClient – low-level HTTP helper (exposed for advanced use only)
- memories: MemoriesGroup
- sessions: SessionsGroup
- mcp: McpGroup

### Methods

- health(): Promise<HealthResponse>
- setApiKey(token?: string): void

#### health
GET `/v1/health` – Returns service status.

```ts
const status = await client.health();
// type: HealthResponse
```

#### setApiKey
Updates the bearer token used for subsequent requests.

```ts
client.setApiKey('NEW_TOKEN');
```

---

## Group: memories (REST)

All paths are under `/v1`.

### add(body: NewEpisode): Promise<void>
POST `/memories` – Adds to both episodic and profile memories.

### addEpisodic(body: NewEpisode): Promise<void>
POST `/memories/episodic` – Adds only to episodic memory.

### addProfile(body: NewEpisode): Promise<void>
POST `/memories/profile` – Adds only to profile memory.

### search(body: SearchQuery): Promise<SearchResult>
POST `/memories/search` – Searches both memories.

### searchEpisodic(body: SearchQuery): Promise<SearchResult>
POST `/memories/episodic/search` – Searches only episodic memory.

### searchProfile(body: SearchQuery): Promise<SearchResult>
POST `/memories/profile/search` – Searches only profile memory.

### delete(body: DeleteDataRequest): Promise<void>
DELETE `/memories` – Deletes all data for a session.

Example:

```ts
await client.memories.add({
  session: { session_id: 'sess_1', user_id: ['u1'] },
  producer: 'agent_a',
  produced_for: 'u1',
  episode_content: 'Met at 3pm, discussed onboarding.',
  episode_type: 'dialog',
});

const results = await client.memories.search({
  session: { session_id: 'sess_1', user_id: ['u1'] },
  query: 'onboarding',
  limit: 10,
});

await client.memories.delete({ session: { session_id: 'sess_1' } });
```

---

## Group: sessions (REST)

List sessions globally or by entity. All return `Promise<AllSessionsResponse>`.

- getAll(): GET `/sessions`
- forUser(userId: string): GET `/users/{userId}/sessions`
- forGroup(groupId: string): GET `/groups/{groupId}/sessions`
- forAgent(agentId: string): GET `/agents/{agentId}/sessions`

Example:

```ts
const all = await client.sessions.getAll();
const userSessions = await client.sessions.forUser('u1');
```

---

## Group: mcp (MCP tools/resources)

All paths are under `/mcp`.

### addSessionMemory(body: NewEpisode): Promise<McpStatus>
POST `/add_session_memory` – Unified add (episodic + profile).

### addEpisodicMemory(body: NewEpisode): Promise<McpStatus>
POST `/add_episodic_memory` – Add to episodic only.

### addProfileMemory(body: NewEpisode): Promise<McpStatus>
POST `/add_profile_memory` – Add to profile only.

### searchEpisodicMemory(body: SearchQuery): Promise<SearchResult>
POST `/search_episodic_memory` – Search episodic only.

### searchProfileMemory(body: SearchQuery): Promise<SearchResult>
POST `/search_profile_memory` – Search profile only.

### searchSessionMemory(body: SearchQuery): Promise<SearchResult>
POST `/search_session_memory` – Unified search.

### deleteSessionData(body: DeleteDataRequest): Promise<McpStatus>
POST `/delete_session_data` – Delete for a provided session.

### delete(): Promise<McpStatus>
POST `/delete_data` – Delete for the active session in MCP context.

### sessions(): Promise<AllSessionsResponse>
GET `/sessions` – All sessions as a resource.

### userSessions(userId: string): Promise<AllSessionsResponse>
GET `/users/{userId}/sessions`

### groupSessions(groupId: string): Promise<AllSessionsResponse>
GET `/groups/{groupId}/sessions`

### agentSessions(agentId: string): Promise<AllSessionsResponse>
GET `/agents/{agentId}/sessions`

Example:

```ts
const status = await client.mcp.addProfileMemory({
  session: { session_id: 'sess_9', user_id: ['u9'] },
  producer: 'agent_z',
  produced_for: 'u9',
  episode_content: 'Prefers dark theme.',
  episode_type: 'preference',
});
if (status.status !== 0) console.warn('MCP tool reported error:', status.error_msg);
```

---

## Types

### ClientOptions
Configuration options for the client. See README for details.

### SessionData
```ts
interface SessionData {
  group_id?: string | null;
  agent_id?: string[] | null;
  user_id?: string[] | null;
  session_id: string;
}
```

### NewEpisode
```ts
interface NewEpisode {
  session: SessionData;
  producer: string;
  produced_for: string;
  episode_content: string | number[];
  episode_type: string;
  metadata?: Record<string, unknown> | null;
}
```

### SearchQuery
```ts
interface SearchQuery {
  session: SessionData;
  query: string;
  filter?: Record<string, unknown> | null;
  limit?: number | null;
}
```

### SearchResult
```ts
interface SearchResult {
  status: number; // 0 = success
  content: Record<string, unknown>; // shape depends on backend
}
```

### DeleteDataRequest
```ts
interface DeleteDataRequest {
  session: SessionData;
}
```

### MemorySession, AllSessionsResponse
```ts
interface MemorySession {
  user_ids: string[];
  session_id: string;
  group_id?: string | null;
  agent_ids?: string[] | null;
}

interface AllSessionsResponse {
  sessions: MemorySession[];
}
```

### HealthResponse
```ts
interface HealthResponse {
  status: string;
  service: string;
  version: string;
  memory_managers: {
    profile_memory: boolean;
    episodic_memory: boolean;
  };
}
```

### McpStatus
```ts
interface McpStatus {
  status: number; // 0 = success
  error_msg: string;
}
```

---

## Errors

### ApiError extends Error
Thrown for all non-2xx responses.

Fields:
- status: number
- message: string
- details?: unknown
- method?: string
- path?: string

Example:

```ts
try {
  await client.memories.addEpisodic(...);
} catch (e) {
  if (e instanceof ApiError) {
    if (e.status === 404) {
      // handle missing session
    }
  }
}
```

---

## HTTP Behavior

- Content-Type defaults to `application/json`. Customize per-request headers by passing `headers` via low-level helpers if needed.
- Timeouts: default 15s per request (configurable via `timeoutMs`).
- 204 No Content returns `undefined`.
- Body serialization: JSON for non-GET methods; GET/DELETE allow optional JSON body if backend supports it.
