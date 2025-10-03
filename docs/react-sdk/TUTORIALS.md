# Tutorials (React + TypeScript)

This guide demonstrates common patterns using the MemMachine React SDK.

- Form handling
- Real-time updates (polling)
- Error boundaries
- Optimistic updates

All samples assume your app is wrapped with `MemMachineProvider`.

## 1) Form Handling

Use the mutations from the Memories hooks to submit data with validation and user feedback.

```tsx
import { useState } from 'react';
import { useAddMemory } from '@instruct/memmachine-react-sdk/hooks';
import type { NewEpisode, SessionData } from '@instruct/memmachine-sdk';

export function AddNoteForm({ session }: { session: SessionData }) {
  const add = useAddMemory();
  const [text, setText] = useState('');
  const [producer, setProducer] = useState('web');
  const [forId, setForId] = useState('user-123');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const body: NewEpisode = {
      session,
      producer,
      produced_for: forId,
      episode_type: 'dialog',
      episode_content: text,
    };
    await add.mutate(body);
    if (!add.error) setText('');
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <input value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="Producer" required />
      <input value={forId} onChange={(e) => setForId(e.target.value)} placeholder="Produced for" required />
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write…" rows={3} required />
      <button type="submit" disabled={add.loading}>Save</button>
      {add.error && <div role="alert">{add.error.message}</div>}
    </form>
  );
}
```

## 2) Real‑Time Updates (Polling)

The SDK does not open sockets by itself, but polling is easy with `useLazyQuery` or `useQuery` and intervals.

```tsx
import { useEffect } from 'react';
import { useLazyQuery, useMemMachineClient } from '@instruct/memmachine-react-sdk/hooks';

export function HealthTicker() {
  const client = useMemMachineClient();
  const [run, state] = useLazyQuery(() => client.health());

  useEffect(() => {
    void run(); // initial
    const id = setInterval(() => void run(), 5000);
    return () => clearInterval(id);
  }, [run]);

  if (state.loading && !state.data) return <p>Checking…</p>;
  if (state.error) return <p role="alert">{state.error.message}</p>;
  return <p>{state.data?.status} ({state.data?.version})</p>;
}
```

Tip: pause polling when the tab is hidden using the Page Visibility API for efficiency.

## 3) Error Boundaries

Hooks return errors in state; they do not throw. Still, it’s good practice to use an Error Boundary around chunks of your UI.

```tsx
import React from 'react';

class ErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean; message?: string }> {
  state = { hasError: false, message: undefined };
  static getDerivedStateFromError(err: unknown) { return { hasError: true, message: err instanceof Error ? err.message : String(err) }; }
  componentDidCatch(error: unknown, info: unknown) { console.error(error, info); }
  render() {
    if (this.state.hasError) return <div role="alert">Something went wrong: {this.state.message}</div>;
    return this.props.children;
  }
}

export function AppSection() {
  return (
    <ErrorBoundary>
      {/* components using SDK hooks */}
    </ErrorBoundary>
  );
}
```

For hook-level errors, render inline messages from `{ error }`:
```tsx
const { error } = useHealth();
{error && <p role="alert">{error.message}</p>}
```

## 4) Optimistic Updates

Give users instant feedback while a mutation runs. Combine local state with `useMutation` and reconcile after the server response.

```tsx
import { useState } from 'react';
import { useAddEpisodicMemory } from '@instruct/memmachine-react-sdk/hooks';
import type { NewEpisode, SessionData } from '@instruct/memmachine-sdk';

type Item = { id: string; text: string; pending?: boolean };

export function Notes({ session }: { session: SessionData }) {
  const add = useAddEpisodicMemory();
  const [items, setItems] = useState<Item[]>([]);

  async function addNote(text: string) {
    const temp: Item = { id: `temp-${Date.now()}`, text, pending: true };
    setItems((x) => [temp, ...x]);
    try {
      const body: NewEpisode = {
        session,
        producer: 'web',
        produced_for: 'user-123',
        episode_type: 'dialog',
        episode_content: text,
      };
      await add.mutate(body);
      setItems((x) => x.map((it) => (it.id === temp.id ? { ...it, pending: false } : it)));
    } catch (e) {
      // rollback on error
      setItems((x) => x.filter((it) => it.id !== temp.id));
    }
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const v = (f.elements.namedItem('t') as HTMLInputElement).value; if (v) { void addNote(v); f.reset(); } }}>
        <input name="t" placeholder="Quick note" />
        <button disabled={add.loading}>Add</button>
      </form>
      <ul>
        {items.map((it) => (
          <li key={it.id} style={{ opacity: it.pending ? 0.6 : 1 }}>
            {it.text} {it.pending && <em>(saving…)</em>}
          </li>
        ))}
      </ul>
      {add.error && <p role="alert">{add.error.message}</p>}
    </div>
  );
}
```

Notes:
- Mark new items as `pending` until the mutation resolves.
- On failure, remove or mark the item with an error state.
- Optionally re‑fetch queries for stronger consistency.
