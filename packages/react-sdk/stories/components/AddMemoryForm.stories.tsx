import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AddMemoryForm, type AddMemoryFormProps } from '../../src/components/AddMemoryForm';
import { makeMockClient, withMemMachineProvider } from '../mocks/mockClient';

const meta: Meta<typeof AddMemoryForm> = {
  title: 'Components/AddMemoryForm',
  component: AddMemoryForm,
  decorators: [withMemMachineProvider(makeMockClient())],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof AddMemoryForm>;

const baseSession: any = { session_id: 's-demo-1', user_ids: ['user-1'] };

export const Default: Story = {
  args: {
    session: baseSession,
    store: 'all',
    defaultProducer: 'alice',
    defaultProducedFor: 'bob',
    defaultType: 'dialog',
    submitLabel: 'Add',
  } satisfies AddMemoryFormProps,
};

export const Episodic: Story = {
  name: 'Episodic store',
  decorators: [withMemMachineProvider(makeMockClient())],
  args: { session: baseSession, store: 'episodic' },
};

export const Profile: Story = {
  name: 'Profile store',
  decorators: [withMemMachineProvider(makeMockClient())],
  args: { session: baseSession, store: 'profile' },
};

export const ErrorOnSubmit: Story = {
  name: 'Error state on submit',
  decorators: [
    withMemMachineProvider(
      makeMockClient({
        memories: {
          add: async () => { throw new Error('Simulated failure adding memory'); },
          addEpisodic: async () => { throw new Error('Simulated failure adding episodic memory'); },
          addProfile: async () => { throw new Error('Simulated failure adding profile memory'); },
          search: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
          searchEpisodic: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
          searchProfile: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
          delete: async (_r: any) => {},
        }
      })
    )
  ],
  args: { session: baseSession },
};
