# Components Reference (React TypeScript)

All components are headless (unstyled) and strictly typed. You can compose them with your own design system. Import from `@instruct/memmachine-react-sdk/components`.

- MemorySearch
- AddMemoryForm
- SessionsList

Types referenced below come from `@instruct/memmachine-sdk` unless otherwise noted.

## <MemorySearch />

Search memories and render results. Handles loading/error states and exposes a render prop for custom UI.

```tsx
import { MemorySearch } from '@instruct/memmachine-react-sdk/components';
import type { SessionData, SearchResult } from '@instruct/memmachine-sdk';

export interface MemorySearchProps {
  session: SessionData;
  initialQuery?: string;
  store?: 'all' | 'episodic' | 'profile';
  limit?: number;
  onResult?: (result: SearchResult) => void;
  renderResult?: (result: SearchResult) => JSX.Element;
  submitLabel?: string;
}
```

Example (default renderer):
```tsx
<MemorySearch session={session} initialQuery="hello" />
```

Example (custom renderer):
```tsx
<MemorySearch
  session={session}
  store="episodic"
  limit={10}
  renderResult={(res) => (
    <ul>
      {res.results.map((r, i) => (
        <li key={i}>{r.text}</li>
      ))}
    </ul>
  )}
/>
```

Accessibility:
- Input has `aria-label="Query"` and the dynamic region uses `aria-live="polite"`.

Customization:
- Fully control layout via `renderResult` and surrounding markup.
- Localize the submit button with `submitLabel`.

## <AddMemoryForm />

Minimal form that posts a `NewEpisode` to the selected store using the appropriate hooks.

```ts
import { AddMemoryForm } from '@instruct/memmachine-react-sdk/components';
import type { SessionData, NewEpisode } from '@instruct/memmachine-sdk';

export interface AddMemoryFormProps {
  session: SessionData;
  store?: 'all' | 'episodic' | 'profile';
  defaultProducer?: string;
  defaultProducedFor?: string;
  defaultType?: string;
  onSubmitted?: (input: NewEpisode) => void;
  submitLabel?: string;
}
```

Example:
```tsx
<AddMemoryForm
  session={session}
  store="profile"
  defaultProducer="web"
  defaultProducedFor="user-123"
  defaultType="dialog"
  onSubmitted={(body) => console.log('submitted', body)}
  submitLabel="Save"
/>
```

Behavior:
- Uses `useAddMemory`, `useAddEpisodicMemory`, or `useAddProfileMemory` based on `store`.
- Shows a simple error message when mutations fail.

Customization:
- Replace this component with your own form using the hooks if you need design system fields, validation, or i18n.

## <SessionsList />

Fetches and renders a list of sessions with sensible defaults, or use a render prop for custom display.

```ts
import { SessionsList } from '@instruct/memmachine-react-sdk/components';
import type { AllSessionsResponse } from '@instruct/memmachine-sdk';

export interface SessionsListProps {
  source?: 'rest' | 'mcp';
  variant?: 'all' | 'user' | 'group' | 'agent';
  id?: string; // required for user/group/agent variants
  render?: (resp: AllSessionsResponse) => JSX.Element;
}
```

Examples:
```tsx
// All sessions from REST
<SessionsList />

// User sessions via REST
<SessionsList variant="user" id="user-123" />

// Agent sessions via MCP, custom renderer
<SessionsList
  source="mcp"
  variant="agent"
  id="agent-42"
  render={(resp) => (
    <ol>
      {resp.sessions.map((s) => (
        <li key={s.session_id}><code>{s.session_id}</code></li>
      ))}
    </ol>
  )}
/>
```

Behavior:
- Handles loading and error states internally with minimal UI.
- Validates `id` when needed based on `variant`.

Customization:
- Provide `render` to fully control output.
- Wrap with your own loaders and error UIs by composing around the component.
