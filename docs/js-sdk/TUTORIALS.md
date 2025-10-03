# Tutorials: Common Use Cases

This guide walks through end-to-end examples using the MemMachine TypeScript SDK.

## 1) Add and Search Memories (REST)

Use `memories` to add episodes to episodic/profile memories and run searches.

```ts
import { MemMachineClient, ApiError, type NewEpisode, type SearchQuery } from '@instruct/memmachine-sdk';

const client = new MemMachineClient({
  baseUrl: 'http://localhost:8080',
  apiKey: process.env.MEMMACHINE_API_KEY,
});

async function run() {
  // 1) Add an episodic event
  const episodic: NewEpisode = {
    session: { session_id: 's_chat_001', user_id: ['u_123'] },
    producer: 'agent_alpha',
    produced_for: 'u_123',
    episode_content: 'We agreed to schedule a follow-up on Tuesday.',
    episode_type: 'dialog',
  };
  await client.memories.addEpisodic(episodic);

  // 2) Add a profile fact
  const profile: NewEpisode = {
    session: { session_id: 's_chat_001', user_id: ['u_123'] },
    producer: 'agent_alpha',
    produced_for: 'u_123',
    episode_content: 'Prefers oolong tea and uses dark mode.',
    episode_type: 'preference',
  };
  await client.memories.addProfile(profile);

  // 3) Search both memories
  const query: SearchQuery = {
    session: { session_id: 's_chat_001', user_id: ['u_123'] },
    query: 'preferences',
    limit: 5,
  };
  const res = await client.memories.search(query);
  console.log('Search content:', res.content);
}

run().catch((e) => console.error(e));
```

## 2) Authentication Best Practices

- Keep tokens in environment variables (e.g., `MEMMACHINE_API_KEY`).
- Rotate tokens without re-instantiating the client using `setApiKey`.

```ts
const client = new MemMachineClient({ baseUrl: 'http://localhost:8080' });
client.setApiKey(process.env.MEMMACHINE_API_KEY);

// Later (rotation)
client.setApiKey(process.env.NEW_MEMMACHINE_API_KEY);
```

## 3) Robust Error Handling with Retries

Use `ApiError` to branch on status codes and apply simple retries.

```ts
import { MemMachineClient, ApiError } from '@instruct/memmachine-sdk';

const client = new MemMachineClient({ baseUrl: 'http://localhost:8080', apiKey: process.env.MEMMACHINE_API_KEY });

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (e instanceof ApiError) {
        // Retry on 429/5xx
        if (e.status === 429 || (e.status >= 500 && e.status < 600)) {
          const backoffMs = 250 * Math.pow(2, i);
          await new Promise((r) => setTimeout(r, backoffMs));
          continue;
        }
      }
      break; // non-retryable
    }
  }
  throw lastErr;
}

// Usage
await withRetry(() => client.memories.add({
  session: { session_id: 's1' },
  producer: 'agent_a',
  produced_for: 'u1',
  episode_content: 'Hello world',
  episode_type: 'dialog',
}));
```

## 4) Embeddings Instead of Text

You can provide vectors when you already have embeddings. Use `number[]` for `episode_content`:

```ts
await client.memories.add({
  session: { session_id: 's_embed', user_id: ['u9'] },
  producer: 'agent_embedder',
  produced_for: 'u9',
  episode_content: [0.12, -0.04, 0.33, /* ... */],
  episode_type: 'embedding',
  metadata: { model: 'text-embedding-3-small' },
});
```

## 5) Listing Sessions and Building UI

Use the `sessions` group to power dashboards and filters.

```ts
const all = await client.sessions.getAll();
const forUser = await client.sessions.forUser('u_123');
const forGroup = await client.sessions.forGroup('g_5');
const forAgent = await client.sessions.forAgent('agent_alpha');
```

You can render `AllSessionsResponse.sessions` as a list and drill down by `session_id`.

## 6) MCP Endpoints for LLM Tools

The `mcp` group mirrors the REST features behind LLM-oriented endpoints. Check `status` and handle `error_msg`.

```ts
const status = await client.mcp.addSessionMemory({
  session: { session_id: 's_llm_1' },
  producer: 'assistant',
  produced_for: 'user_7',
  episode_content: 'Summarized user preferences.',
  episode_type: 'summary',
});
if (status.status !== 0) console.warn('Tool error:', status.error_msg);
```

## 7) Timeouts and Performance

Set a global timeout when constructing the client:

```ts
const client = new MemMachineClient({ baseUrl: 'http://localhost:8080', timeoutMs: 10_000 });
```

When a request exceeds the timeout, the SDK aborts it and throws `ApiError` with a descriptive message. Use retries if appropriate.

## 8) Browser Usage and CORS

The SDK is ESM and works in modern browsers. Ensure your API origin allows your app’s origin via CORS. Provide a `fetch` polyfill only if your environment lacks `fetch`.

```ts
// Example: pass a custom fetch (e.g., from cross-fetch) if needed
const client = new MemMachineClient({ baseUrl: 'https://api.example.com', fetch: window.fetch.bind(window) });
```

## 9) Testing and Mocking

Inject a custom `fetch` to stub responses in tests.

```ts
function mockFetch(): typeof fetch {
  return (async (url, init) => {
    if (typeof url === 'string' && url.endsWith('/v1/health')) {
      return new Response(JSON.stringify({ status: 'healthy', service: 'memmachine', version: '1.0.0', memory_managers: { profile_memory: true, episodic_memory: true } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('Not found', { status: 404 });
  }) as any;
}

const client = new MemMachineClient({ baseUrl: 'http://localhost:8080', fetch: mockFetch() });
const health = await client.health();
```

## 10) Cleaning Up Data Safely

To remove session data, prefer the REST delete with an explicit `session` object for clarity and auditability.

```ts
await client.memories.delete({ session: { session_id: 's_chat_001' } });
```

If you are operating in an MCP context, `mcp.delete()` deletes data for the active MCP session without passing a body.

```ts
const status = await client.mcp.delete();
if (status.status !== 0) console.error(status.error_msg);
```

## Edge Cases & Tips

- 400 Bad Request: verify `producer`/`produced_for` belong to the provided `session` context.
- 404 Not Found: ensure a matching episodic memory instance exists for the `session`.
- 503 Unhealthy: check `client.health()`; back off and retry.
- Large payloads: prefer embeddings when appropriate or paginate writes client-side.
- Search shape: `SearchResult.content` is backend-defined; create type guards for expected shapes in your app.
