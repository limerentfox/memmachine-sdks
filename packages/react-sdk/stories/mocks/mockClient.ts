/* Simple mock MemMachineClient for Storybook */
export type DelayResult<T> = { delay?: number; value?: T; error?: Error };

export function delay<T>(ms: number, value: T, shouldReject = false): Promise<T> {
  return new Promise((resolve, reject) => setTimeout(() => (shouldReject ? reject(value) : resolve(value)), ms));
}

export function makeMockClient(overrides: Partial<any> = {}) {
  const defaultImpl = {
    health: async () => ({ status: 'ok' }),
    sessions: {
      getAll: async () => ({ sessions: [] }),
      forUser: async (id: string) => ({ sessions: [{ session_id: 's-user-' + id, user_ids: [id] }] }),
      forGroup: async (id: string) => ({ sessions: [{ session_id: 's-group-' + id, group_id: id }] }),
      forAgent: async (id: string) => ({ sessions: [{ session_id: 's-agent-' + id, agent_id: id }] }),
    },
    memories: {
      add: async (_input: any) => {},
      addEpisodic: async (_input: any) => {},
      addProfile: async (_input: any) => {},
      search: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
      searchEpisodic: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
      searchProfile: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
      delete: async (_req: any) => {},
    },
    mcp: {
      sessions: async () => ({ sessions: [] }),
      userSessions: async (id: string) => ({ sessions: [{ session_id: 'mcp-user-' + id, user_ids: [id] }] }),
      groupSessions: async (id: string) => ({ sessions: [{ session_id: 'mcp-group-' + id, group_id: id }] }),
      agentSessions: async (id: string) => ({ sessions: [{ session_id: 'mcp-agent-' + id, agent_id: id }] }),
      addSessionMemory: async (_i: any) => ({ ok: true }),
      addEpisodicMemory: async (_i: any) => ({ ok: true }),
      addProfileMemory: async (_i: any) => ({ ok: true }),
      searchEpisodicMemory: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
      searchProfileMemory: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
      searchSessionMemory: async (_q: any) => ({ items: [], meta: { took_ms: 5 } }),
      deleteSessionData: async (_r: any) => ({ ok: true }),
      deleteData: async () => ({ ok: true }),
    },
    setApiKey: (_t?: string) => {},
  } as any;
  return { ...defaultImpl, ...overrides } as any;
}

export function withMemMachineProvider(client: any) {
  const React = require('react');
  const { MemMachineProvider } = require('../../src/context/MemMachineProvider');
  return (Story: any) => (
    React.createElement(MemMachineProvider, { client }, React.createElement(Story))
  );
}
