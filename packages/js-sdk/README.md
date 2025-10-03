# MemMachine TypeScript SDK

A modern, type-safe SDK for the MemMachine Unified API. It targets both browser and Node.js (>=18) environments and ships with full TypeScript types, ESM modules, intuitive methods, and robust error handling.

## Installation

```bash
npm install @instruct/memmachine-sdk
```

## Quick start

```ts
import { MemMachineClient } from '@instruct/memmachine-sdk';
import type { NewEpisode, SearchQuery } from '@instruct/memmachine-sdk';

const client = new MemMachineClient({
  baseUrl: 'http://localhost:8080', // host root; REST lives under /v1, MCP under /mcp
  // apiKey: 'optional-token',      // if your gateway enforces auth (adds Authorization: Bearer)
  timeoutMs: 15000,
});

// Add a memory to both episodic and profile stores
await client.memories.add({
  session: { session_id: 'sess-123', user_id: ['user-1'], agent_id: ['agent-1'] },
  producer: 'user-1',
  produced_for: 'agent-1',
  episode_content: 'Hello there',
  episode_type: 'dialog',
});

// Search both stores
const result = await client.memories.search({
  session: { session_id: 'sess-123', user_id: ['user-1'], agent_id: ['agent-1'] },
  query: 'favorite color',
  limit: 5,
});
console.log(result.content);
```

## Authentication

The backend does not enforce authentication itself. If deployed behind a gateway/proxy, pass `apiKey` when creating the client to add `Authorization: Bearer <token>` on every request. You can also set custom headers via `headers`.

## Error handling

All non-2xx responses throw a typed `ApiError` with `status`, `message`, and optional `details`. Catch and inspect it as needed.

```ts
try {
  await client.memories.add(...);
} catch (err) {
  if (err instanceof ApiError) {
    console.error(err.status, err.message, err.details);
  }
}
```

## Building

- ESM output with type declarations
- Tree-shakeable exports (`sideEffects: false`)
- Node >= 18 (for global `fetch`). Browsers supported natively.

## Links

- API reference: see `openapi.json` co-located with this package.
