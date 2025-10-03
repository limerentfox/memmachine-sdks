import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { useLazySearchMemories } from '../../src/hooks/memories';
import { makeMockClient, withMemMachineProvider, delay } from '../mocks/mockClient';

function LazySearchExample() {
  const [run, state] = useLazySearchMemories();
  const [query, setQuery] = useState('hello');
  const session: any = { session_id: 's-123', user_ids: ['u-1'] };
  return (
    <div style={{ minWidth: 360 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Query" />
        <button onClick={() => run({ session, query })} disabled={state.loading}>Search</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <div><strong>Status:</strong> {state.status}</div>
        {state.loading && <div role="status">Searching…</div>}
        {state.error && <div role="alert" style={{ color: 'red' }}>{state.error.message}</div>}
        {state.data && <pre aria-live="polite">{JSON.stringify(state.data, null, 2)}</pre>}
      </div>
    </div>
  );
}

const meta: Meta<typeof LazySearchExample> = {
  title: 'Hooks/useLazySearchMemories',
  component: LazySearchExample,
};
export default meta;

type Story = StoryObj<typeof LazySearchExample>;

export const Loading: Story = {
  decorators: [withMemMachineProvider(makeMockClient({ memories: { search: () => delay(2500, { items: [], meta: { took_ms: 2500 } }) } }))],
};

export const Success: Story = {
  decorators: [withMemMachineProvider(makeMockClient({ memories: { search: async (_q: any) => ({ items: [{ id: 'm-1', score: 0.95 }], meta: { took_ms: 12 } } ) } }))],
};

export const Error: Story = {
  decorators: [withMemMachineProvider(makeMockClient({ memories: { search: async () => { throw new Error('Search failed'); } } }))],
};
