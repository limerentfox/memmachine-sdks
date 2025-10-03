import { useMemo } from 'react';
import type { AllSessionsResponse } from '@instruct/memmachine-sdk';
import { useMemMachineClient } from './useMemMachineClient.js';
import { useQuery } from './common.js';

export function useSessionsAll(options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.sessions.getAll(), [client]);
  return useQuery<AllSessionsResponse>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useSessionsForUser(userId: string, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.sessions.forUser(userId), [client, userId]);
  return useQuery<AllSessionsResponse>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useSessionsForGroup(groupId: string, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.sessions.forGroup(groupId), [client, groupId]);
  return useQuery<AllSessionsResponse>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useSessionsForAgent(agentId: string, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.sessions.forAgent(agentId), [client, agentId]);
  return useQuery<AllSessionsResponse>(fetcher, [fetcher], { enabled: options?.enabled });
}
