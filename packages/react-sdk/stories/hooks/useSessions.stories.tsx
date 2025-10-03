import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useSessionsAll } from '../../src/hooks/sessions';
import { makeMockClient, withMemMachineProvider, delay } from '../mocks/mockClient';

function SessionsAllExample() {
  const state = useSessionsAll();
  return (
    <div style={{ minWidth: 320 }}>
      <div><strong>Status:</strong> {state.status}</div>
      {state.loading && <div role="status">Loading…</div>}
      {state.error && <div role="alert" style={{ color: 'red' }}>{state.error.message}</div>}
      {state.data && (
        <ul>
          {state.data.sessions.map((s: any) => (
            <li key={s.session_id}><code>{s.session_id}</code></li>
          ))}
        </ul>
      )}
    </div>
  );
}

const meta: Meta<typeof SessionsAllExample> = {
  title: 'Hooks/useSessionsAll',
  component: SessionsAllExample,
};
export default meta;

type Story = StoryObj<typeof SessionsAllExample>;

export const Loading: Story = {
  decorators: [withMemMachineProvider(makeMockClient({ sessions: { getAll: () => delay(2000, { sessions: [] }) } }))],
};

export const Success: Story = {
  decorators: [withMemMachineProvider(makeMockClient({ sessions: { getAll: async () => ({ sessions: [{ session_id: 's-1' }, { session_id: 's-2' }] } } }))],
};

export const Error: Story = {
  decorators: [withMemMachineProvider(makeMockClient({ sessions: { getAll: async () => { throw new Error('API error fetching sessions'); } } }))],
};
