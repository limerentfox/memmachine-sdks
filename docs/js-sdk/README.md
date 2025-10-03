# MemMachine TypeScript SDK (@instruct/memmachine-sdk)

A modern, type-safe JS/TS client for the MemMachine Unified API. It wraps both the standard REST endpoints (/v1) and the MCP tooling/resource endpoints (/mcp) with a small, isomorphic HTTP layer, helpful errors, and first-class TypeScript types.

- Fully typed methods and models
- Simple auth with Bearer tokens
- REST and MCP method groups in one client
- Works in Node.js >= 18 (built-in fetch) and modern browsers

## Installation

- npm: `npm install @instruct/memmachine-sdk`
- yarn: `yarn add @instruct/memmachine-sdk`
- pnpm: `pnpm add @instruct/memmachine-sdk`

Requirements: Node.js 18+ or a runtime with `fetch` available (supply a custom `fetch` in `ClientOptions` for non-standard environments).

## Quick Start

```ts
import { MemMachineClient, ApiError, type NewEpisode, type SearchQuery } from '@instruct/memmachine-sdk';

const client = new MemMachineClient({
  baseUrl: 'http://localhost:8080', // defaults to http://localhost:8080
  apiKey: process.env.MEMMACHINE_API_KEY, // optional
});

async function main() {
  // Health check
  const health = await client.health();
  console.log('Health:', health);

  // Add a memory episode (unified: episodic + profile)
  const episode: NewEpisode = {
    session: { session_id: 'sess_123', user_id: ['user_1'] },
    producer: 'agent_1',
    produced_for: 'user_1',
    episode_content: 'User likes oolong tea and cycling.',
    episode_type: 'profile_note',
    metadata: { source: 'chat' },
  };
  await client.memories.add(episode);

  // Search both memories
  const query: SearchQuery = {
    session: { session_id: 'sess_123', user_id: ['user_1'] },
    query: 'What does the user like?',
    limit: 5,
  };
  const results = await client.memories.search(query);
  console.log('Search results:', results);
}

main().catch((err) => {
  if (err instanceof ApiError) {
    console.error('API error', err.status, err.message, err.details);
  } else {
    console.error('Unexpected error', err);
  }
});
```

## Overview

The SDK exposes a single entry point: `MemMachineClient`. Methods are grouped by functionality:

- `memories` (REST): add and search memories across episodic and profile stores.
- `sessions` (REST): list sessions globally or filtered by user/group/agent.
- `mcp` (MCP tools/resources): perform the same core operations via MCP endpoints, designed for LLM-driven tool use.
- `health()` (REST): service status for orchestration and readiness checks.
- `setApiKey(token)` to update bearer tokens at runtime.

## Authentication

All requests support Bearer token authentication. Provide `apiKey` at construction or call `setApiKey` later:

```ts
const client = new MemMachineClient({ baseUrl: 'http://localhost:8080', apiKey: 'YOUR_TOKEN' });
client.setApiKey('NEW_TOKEN');
```

The client automatically attaches `Authorization: Bearer <token>` to every request when a token is set.

## Configuration (ClientOptions)

```ts
interface ClientOptions {
  baseUrl?: string;        // default: 'http://localhost:8080'
  apiKey?: string;         // default: undefined
  headers?: Record<string, string>; // default: { 'Content-Type': 'application/json' }
  timeoutMs?: number;      // default: 15000
  fetch?: typeof globalThis.fetch;  // custom fetch implementation
  restPrefix?: string;     // default: '/v1'
  mcpPrefix?: string;      // default: '/mcp'
}
```

Notes:
- `baseUrl` is the host root; the client prefixes REST paths with `/v1` and MCP paths with `/mcp` automatically (configurable).
- Provide `fetch` for non-standard runtimes (e.g., custom polyfills).

## Error Handling

All non-2xx responses throw a typed `ApiError`:

```ts
try {
  await client.memories.add(episode);
} catch (err) {
  if (err instanceof ApiError) {
    console.error('Request failed', err.status, err.message, err.details);
    // Optionally react to status codes, e.g., 400/404/503
  } else {
    throw err; // rethrow unexpected errors
  }
}
```

`ApiError` fields:
- `status: number` – HTTP status
- `message: string` – friendly error message (attempts to parse JSON `{ detail }` or text bodies)
- `details?: unknown` – raw parsed body when available
- `method?: string`, `path?: string` – request context

## Runtime Support

- Node.js >= 18 (built-in `fetch`)
- Modern browsers (ESM). For legacy environments, supply a `fetch` and ensure ESM-compatible bundling.

## License

MIT © Instruct
