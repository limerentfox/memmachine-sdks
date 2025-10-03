# Integration Examples

Practical patterns for using `@instruct/memmachine-sdk` in real applications.

## 1) Node + Express: Capture Chat Events as Episodic Memory

```ts
// server.ts
import express from 'express';
import { MemMachineClient, ApiError } from '@instruct/memmachine-sdk';

const app = express();
app.use(express.json());

const client = new MemMachineClient({
  baseUrl: process.env.MEMMACHINE_BASE_URL ?? 'http://localhost:8080',
  apiKey: process.env.MEMMACHINE_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { session_id, user_id, agent_id, message } = req.body as {
    session_id: string;
    user_id: string;
    agent_id: string;
    message: string;
  };

  try {
    await client.memories.addEpisodic({
      session: { session_id, user_id: [user_id], agent_id: [agent_id] },
      producer: agent_id,
      produced_for: user_id,
      episode_content: message,
      episode_type: 'dialog',
      metadata: { channel: 'webchat' },
    });

    const search = await client.memories.search({
      session: { session_id, user_id: [user_id] },
      query: 'key facts about the user',
      limit: 5,
    });

    res.json({ ok: true, memory_context: search.content });
  } catch (e) {
    if (e instanceof ApiError) {
      res.status(e.status).json({ error: e.message, details: e.details });
    } else {
      res.status(500).json({ error: 'Unexpected error' });
    }
  }
});

app.listen(3000, () => console.log('Server on http://localhost:3000'));
```

## 2) Next.js (App Router) API Route

```ts
// app/api/memory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MemMachineClient, ApiError } from '@instruct/memmachine-sdk';

const client = new MemMachineClient({
  baseUrl: process.env.MEMMACHINE_BASE_URL ?? 'http://localhost:8080',
  apiKey: process.env.MEMMACHINE_API_KEY,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await client.memories.add(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ error: e.message, details: e.details }, { status: e.status });
    }
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
```

## 3) Service Layer Wrapper in a TS App

Encapsulate the SDK to centralize auth, logging, and error policies.

```ts
// memoryService.ts
import { MemMachineClient, ApiError, type NewEpisode, type SearchQuery } from '@instruct/memmachine-sdk';

export class MemoryService {
  private client: MemMachineClient;
  constructor() {
    this.client = new MemMachineClient({
      baseUrl: process.env.MEMMACHINE_BASE_URL ?? 'http://localhost:8080',
      apiKey: process.env.MEMMACHINE_API_KEY,
      timeoutMs: 12_000,
    });
  }

  async addEpisode(ep: NewEpisode): Promise<void> {
    try {
      await this.client.memories.add(ep);
    } catch (e) {
      this.handle(e);
    }
  }

  async search(q: SearchQuery) {
    try {
      return await this.client.memories.search(q);
    } catch (e) {
      this.handle(e);
    }
  }

  private handle(e: unknown): never {
    if (e instanceof ApiError) {
      // map to domain error types, log, etc.
      throw new Error(`MemMachine API failed (${e.status}): ${e.message}`);
    }
    throw e as Error;
  }
}
```

## 4) Background Job: Session Cleanup

```ts
import { MemMachineClient, ApiError } from '@instruct/memmachine-sdk';

const client = new MemMachineClient({ baseUrl: 'http://localhost:8080', apiKey: process.env.MEMMACHINE_API_KEY });

async function cleanupStaleSessions() {
  const all = await client.sessions.getAll();
  for (const s of all.sessions) {
    const isStale = /* your logic */ false;
    if (isStale) {
      try {
        await client.memories.delete({ session: { session_id: s.session_id } });
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) continue;
        throw e;
      }
    }
  }
}
```

## 5) Browser App (via Server Proxy)

Avoid exposing tokens in the browser. Create a server endpoint that proxies requests using the SDK.

```ts
// /api/proxy-memory.ts (server-only)
import { MemMachineClient } from '@instruct/memmachine-sdk';
const client = new MemMachineClient({ baseUrl: process.env.MEMMACHINE_BASE_URL!, apiKey: process.env.MEMMACHINE_API_KEY! });
export async function addProfileFact(session_id: string, user_id: string, content: string) {
  await client.memories.addProfile({
    session: { session_id, user_id: [user_id] },
    producer: 'assistant',
    produced_for: user_id,
    episode_content: content,
    episode_type: 'profile_note',
  });
}
```

Your React components call your server route instead of calling the SDK directly from the client.

## 6) Observability: Attach Request IDs

Attach a request ID header to trace requests across systems.

```ts
import { MemMachineClient } from '@instruct/memmachine-sdk';

function withRequestId(client: MemMachineClient, requestId: string) {
  // Use the low-level helper for one-off custom headers
  return client.http.requestRest('GET', '/health', { headers: { 'X-Request-Id': requestId } });
}
```

## 7) Edge/Serverless Environments

Provide a compatible `fetch` implementation if your platform differs.

```ts
// Example for a worker environment if needed
const client = new MemMachineClient({ baseUrl: 'https://api.example.com', fetch: globalThis.fetch });
```

## 8) Conversation Orchestration Pattern

1) Add the user and assistant turns as episodic memory.
2) Retrieve profile facts + episodic history with unified search.
3) Feed the results back into your prompt or agent planner.

```ts
await client.memories.addEpisodic({
  session: { session_id: 'conv_42', user_id: ['u42'] },
  producer: 'user',
  produced_for: 'assistant',
  episode_content: 'I prefer metric units.',
  episode_type: 'dialog',
});

const context = await client.memories.search({
  session: { session_id: 'conv_42', user_id: ['u42'] },
  query: 'preferences and recent decisions',
  limit: 10,
});
```
