import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { makeMockClient, withMemMachineProvider } from '../mocks/mockClient';
import { MemorySearch } from '../../src/components/MemorySearch';
import { AddMemoryForm } from '../../src/components/AddMemoryForm';
import { SessionsList } from '../../src/components/SessionsList';

function ExampleApp() {
  const session: any = { session_id: 's-demo-123', user_ids: ['user-123'] };
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 840 }}>
      <h3>Search</h3>
      <MemorySearch session={session} />
      <h3>Add Memory</h3>
      <AddMemoryForm session={session} defaultProducer="alice" defaultProducedFor="bob" />
      <h3>Sessions</h3>
      <SessionsList source="rest" variant="all" />
    </div>
  );
}

const meta: Meta<typeof ExampleApp> = {
  title: 'Integration/ExampleApp',
  component: ExampleApp,
  decorators: [withMemMachineProvider(makeMockClient())],
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'A simple composition of components to illustrate real-world usage patterns with the provider and mocked client.' } },
  },
};
export default meta;

type Story = StoryObj<typeof ExampleApp>;

export const Default: Story = {};
