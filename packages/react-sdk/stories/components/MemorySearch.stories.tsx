import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MemorySearch, type MemorySearchProps } from '../../src/components/MemorySearch';
import { makeMockClient, withMemMachineProvider } from '../mocks/mockClient';

const meta: Meta<typeof MemorySearch> = {
  title: 'Components/MemorySearch',
  component: MemorySearch,
  decorators: [withMemMachineProvider(makeMockClient())],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof MemorySearch>;

const baseSession: any = { session_id: 's-demo-1', user_ids: ['user-1'] };

export const Default: Story = {
  args: { session: baseSession } satisfies MemorySearchProps,
};

export const Episodic: Story = {
  name: 'Episodic store',
  args: { session: baseSession, store: 'episodic' },
};

export const Profile: Story = {
  name: 'Profile store',
  args: { session: baseSession, store: 'profile' },
};

export const ErrorOnSearch: Story = {
  name: 'Error state on search',
  decorators: [
    withMemMachineProvider(
      makeMockClient({
        memories: {
          add: async () => {},
          addEpisodic: async () => {},
          addProfile: async () => {},
          search: async () => { throw new Error('Simulated search failure'); },
          searchEpisodic: async () => { throw new Error('Simulated episodic search failure'); },
          searchProfile: async () => { throw new Error('Simulated profile search failure'); },
          delete: async (_r: any) => {},
        }
      })
    )
  ],
  args: { session: baseSession },
};
