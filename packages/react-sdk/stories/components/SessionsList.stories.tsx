import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SessionsList, type SessionsListProps } from '../../src/components/SessionsList';
import { makeMockClient, withMemMachineProvider } from '../mocks/mockClient';

const meta: Meta<typeof SessionsList> = {
  title: 'Components/SessionsList',
  component: SessionsList,
  decorators: [withMemMachineProvider(makeMockClient())],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof SessionsList>;

export const AllRest: Story = {
  args: { source: 'rest', variant: 'all' } satisfies SessionsListProps,
};

export const UserRest: Story = {
  args: { source: 'rest', variant: 'user', id: 'user-1' },
};

export const GroupRest: Story = {
  args: { source: 'rest', variant: 'group', id: 'group-1' },
};

export const AgentRest: Story = {
  args: { source: 'rest', variant: 'agent', id: 'agent-1' },
};

export const AllMcp: Story = {
  args: { source: 'mcp', variant: 'all' },
};
