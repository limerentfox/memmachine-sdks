# MemMachine React TypeScript SDK

Modern, React‑first SDK wrapping `@instruct/memmachine-sdk` with:
- Context provider for global configuration and auth
- Typed hooks for queries and mutations with loading/error states
- Headless UI components for common tasks
- Optional HOC and small utilities

This guide covers installation, provider setup, and quick‑start examples. Detailed references live in separate docs in this folder.

## Installation

```bash
npm install @instruct/memmachine-react-sdk @instruct/memmachine-sdk react react-dom
# or
pnpm add @instruct/memmachine-react-sdk @instruct/memmachine-sdk react react-dom
# or
yarn add @instruct/memmachine-react-sdk @instruct/memmachine-sdk react react-dom
```

## Requirements
- React 18+
- TypeScript 5+ recommended

## Storybook

Explore components, hooks, and full integrations interactively via Storybook. From the repo root:

```bash
npm run -w @instruct/memmachine-react-sdk storybook
```

Build a static Storybook site:

```bash
npm run -w @instruct/memmachine-react-sdk build-storybook
```

Addons are configured for accessibility and responsive testing, and stories use a mocked client for offline demos.

## Setup with Provider and Context
Wrap your app with the provider. The provider accepts all `ClientOptions` from `@instruct/memmachine-sdk` except `fetch` (managed internally):

```ts
// app.tsx or main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemMachineProvider } from '@instruct/memmachine-react-sdk/context';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MemMachineProvider
      baseUrl={import.meta.env.VITE_MEMMACHINE_BASE_URL}
      apiKey={import.meta.env.VITE_MEMMACHINE_API_KEY}
      // timeoutMs={15000}
      // headers={{ 'X-Custom': 'value' }}
      // restPrefix="/api/v1"
      // mcpPrefix="/mcp"
    >
      <App />
    </MemMachineProvider>
  </React.StrictMode>
);
```

You can update the token at runtime using the `useApiKey` hook:

```ts
import { useApiKey } from '@instruct/memmachine-react-sdk/hooks';

export function SignInButton() {
  const [, setApiKey] = useApiKey();
  return (
    <button onClick={() => setApiKey(window.prompt('Paste token') || undefined)}>
      Set API key
    </button>
  );
}
```

## Quick Start Examples

### Health Check
```tsx
import { MemMachineProvider } from '@instruct/memmachine-react-sdk/context';
import { useHealth } from '@instruct/memmachine-react-sdk/hooks';

function HealthBadge() {
  const { data, loading, error } = useHealth();
  if (loading) return <span>Checking…</span>;
  if (error) return <span style={{ color: 'red' }}>Offline</span>;
  return <span>{data?.service} {data?.version} — {data?.status}</span>;
}

export default function App() {
  return (
    <MemMachineProvider baseUrl="http://localhost:8080">
      <HealthBadge />
    </MemMachineProvider>
  );
}
```

### Searching Memories (hook)
```tsx
import { useSearchMemories } from '@instruct/memmachine-react-sdk/hooks';
import type { SessionData } from '@instruct/memmachine-sdk';

function Results({ session }: { session: SessionData }) {
  const { data, loading, error } = useSearchMemories({ session, query: 'hello world', limit: 10 });
  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

### Adding a Memory (mutation)
```tsx
import { useAddMemory } from '@instruct/memmachine-react-sdk/hooks';
import type { NewEpisode, SessionData } from '@instruct/memmachine-sdk';

function Add({ session }: { session: SessionData }) {
  const add = useAddMemory();
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body: NewEpisode = {
      session,
      producer: 'web',
      produced_for: 'user-123',
      episode_type: 'dialog',
      episode_content: (e.currentTarget.elements.namedItem('content') as HTMLInputElement).value,
    };
    await add.mutate(body);
  }
  return (
    <form onSubmit={onSubmit}>
      <input name="content" placeholder="Say something" />
      <button disabled={add.loading} type="submit">Add</button>
      {add.error && <span role="alert">{add.error.message}</span>}
    </form>
  );
}
```

### Using Headless Components
```tsx
import { MemorySearch } from '@instruct/memmachine-react-sdk/components';
import type { SessionData, SearchResult } from '@instruct/memmachine-sdk';

function Example({ session }: { session: SessionData }) {
  return (
    <MemorySearch
      session={session}
      store="episodic"
      renderResult={(r: SearchResult) => (
        <ul>{r.results.map((it, i) => <li key={i}>{it.text}</li>)}</ul>
      )}
    />
  );
}
```

## What’s Next
- See HOOKS.md for signatures and examples of all hooks
- See COMPONENTS.md for full component props and customization options
- See TUTORIALS.md for form handling, optimistic updates, error boundaries, and real‑time patterns
- See INTEGRATIONS.md for Next.js, Vite, and CRA setup
