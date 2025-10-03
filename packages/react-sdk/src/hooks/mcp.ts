import { useMemo } from 'react';
import type { AllSessionsResponse, DeleteDataRequest, McpStatus, NewEpisode, SearchQuery, SearchResult } from '@instruct/memmachine-sdk';
import { useMemMachineClient } from './useMemMachineClient.js';
import { useMutation, useQuery } from './common.js';

export function useMcpAddSessionMemory() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => (input: NewEpisode) => client.mcp.addSessionMemory(input), [client]);
  return useMutation<NewEpisode, McpStatus>(mutator);
}

export function useMcpAddEpisodicMemory() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => (input: NewEpisode) => client.mcp.addEpisodicMemory(input), [client]);
  return useMutation<NewEpisode, McpStatus>(mutator);
}

export function useMcpAddProfileMemory() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => (input: NewEpisode) => client.mcp.addProfileMemory(input), [client]);
  return useMutation<NewEpisode, McpStatus>(mutator);
}

export function useMcpSearchEpisodicMemory(params: SearchQuery, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.mcp.searchEpisodicMemory(params), [client, params]);
  return useQuery<SearchResult>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useMcpSearchProfileMemory(params: SearchQuery, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.mcp.searchProfileMemory(params), [client, params]);
  return useQuery<SearchResult>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useMcpSearchSessionMemory(params: SearchQuery, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.mcp.searchSessionMemory(params), [client, params]);
  return useQuery<SearchResult>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useMcpDeleteSessionData() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => (input: DeleteDataRequest) => client.mcp.deleteSessionData(input), [client]);
  return useMutation<DeleteDataRequest, McpStatus>(mutator);
}

export function useMcpDeleteData() {
  const client = useMemMachineClient();
  const mutator = useMemo(() => () => client.mcp.deleteData(), [client]);
  return useMutation<void, McpStatus>(mutator as unknown as (v: void) => Promise<McpStatus>);
}

export function useMcpSessions(options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.mcp.sessions(), [client]);
  return useQuery<AllSessionsResponse>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useMcpUserSessions(userId: string, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.mcp.userSessions(userId), [client, userId]);
  return useQuery<AllSessionsResponse>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useMcpGroupSessions(groupId: string, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.mcp.groupSessions(groupId), [client, groupId]);
  return useQuery<AllSessionsResponse>(fetcher, [fetcher], { enabled: options?.enabled });
}

export function useMcpAgentSessions(agentId: string, options?: { enabled?: boolean }) {
  const client = useMemMachineClient();
  const fetcher = useMemo(() => () => client.mcp.agentSessions(agentId), [client, agentId]);
  return useQuery<AllSessionsResponse>(fetcher, [fetcher], { enabled: options?.enabled });
}
