# MemMachine React TypeScript SDK

React-first SDK that wraps `@instruct/memmachine-sdk` with:
- Typed hooks for all major API operations (loading, error, and data states)
- Context provider for global configuration and authentication
- Ready-to-use UI components for common patterns
- Higher-order component (HOC) and small utilities
- Tree-shakeable, strictly-typed exports

## Installation

```bash
npm install @instruct/memmachine-react-sdk @instruct/memmachine-sdk react react-dom
```

## Quick start

```tsx
import { MemMachineProvider } from '@instruct/memmachine-react-sdk/context';
import { useHealth } from '@instruct/memmachine-react-sdk/hooks';

function HealthBadge() {
  const { data, loading, error } = useHealth();
  if (loading) return <span>Checking…</span>;
  if (error) return <span style={{color:'red'}}>offline</span>;
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

## Provider and Context

- `MemMachineProvider` accepts all `ClientOptions` (except `fetch`).
- `useMemMachineClient()` returns the memoized `MemMachineClient`.
- `useApiKey()` returns `[apiKey, setApiKey]` for runtime token updates.

## Hooks (selected)

- Memories (REST):
  - `useAddMemory()`, `useAddEpisodicMemory()`, `useAddProfileMemory()`
  - `useSearchMemories(query, { enabled })`, `useSearchEpisodicMemories(query)`, `useSearchProfileMemories(query)`
  - `useDeleteMemoryData()`
- Sessions (REST):
  - `useSessionsAll()`, `useSessionsForUser(userId)`, `useSessionsForGroup(groupId)`, `useSessionsForAgent(agentId)`
- MCP tools/resources:
  - `useMcpAddSessionMemory()`, `useMcpAddEpisodicMemory()`, `useMcpAddProfileMemory()`
  - `useMcpSearchSessionMemory(query)`, `useMcpSearchEpisodicMemory(query)`, `useMcpSearchProfileMemory(query)`
  - `useMcpDeleteSessionData()`, `useMcpDeleteData()`
  - `useMcpSessions()`, `useMcpUserSessions(userId)`, `useMcpGroupSessions(groupId)`, `useMcpAgentSessions(agentId)`

All hooks return strictly typed state: `{ status, loading, data, error }` and mutations expose `{ mutate, reset }`.

## Components

- `MemorySearch` — Controlled search box + results renderer
- `AddMemoryForm` — Minimal form to post a new episode
- `SessionsList` — Lists sessions (REST or MCP)

These are intentionally unstyled and accessible, designed for easy composition and theming. Each accepts render props for custom UI.

## HOC

- `withMemMachine(Component)` injects `{ memmachine }` prop (client, config, setApiKey).

## Exports and Tree Shaking

- Individual entry points for `context`, `hooks`, `components`, `hoc`, `utils`.
- `sideEffects: false` and ESM for optimal bundling.

## Type safety

- All props, hooks, generics, and return types are strictly typed and align with the underlying SDK.

## Next steps

- Generate full documentation and story-driven examples (Storybook recommended).
- Package both SDKs into a single repository with CI for type checks.
