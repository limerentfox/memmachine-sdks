import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useHealth } from '../../src/hooks/useHealth';
import { makeMockClient, withMemMachineProvider, delay } from '../mocks/mockClient';

function HealthExample() {
  const state = useHealth();
  return (
    <div style={{ minWidth: 320 }}>
      <div><strong>Status:</strong> {state.status}</div>
      {state.loading && <div role="status">Loading…</div>}
      {state.error && <div role="alert" style={{ color: 'red' }}>{state.error.message}</div>}
      {state.data && <pre aria-live="polite">{JSON.stringify(state.data, null, 2)}</pre>}
    </div>
  );
}

const meta: Meta<typeof HealthExample> = {
  title: 'Hooks/useHealth',
  component: HealthExample,
};
export default meta;

type Story = StoryObj<typeof HealthExample>;

export const Loading: Story = {
  name: 'Loading state',
  decorators: [withMemMachineProvider(makeMockClient({ health: () => delay(3000, { status: 'ok' }) }))],
};

export const Success: Story = {
  name: 'Success state',
  decorators: [withMemMachineProvider(makeMockClient({ health: async () => ({ status: 'ok' }) }))],
};

export const Error: Story = {
  name: 'Error state',
  decorators: [withMemMachineProvider(makeMockClient({ health: async () => { throw new Error('Backend unavailable'); } }))],
};
