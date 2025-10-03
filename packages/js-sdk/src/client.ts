import { HttpClient } from './http.js';
import { ApiError } from './errors.js';
import type {
  ClientOptions,
  NewEpisode,
  SearchQuery,
  SearchResult,
  DeleteDataRequest,
  AllSessionsResponse,
  HealthResponse,
  McpStatus,
} from './types.js';

/**
 * Top-level client for the MemMachine Unified API.
 *
 * - REST endpoints are served under `/v1`
 * - MCP tools/resources are served under `/mcp`
 *
 * Pass the host root in `baseUrl` (e.g., http://localhost:8080) and the client
 * handles prefixing paths with `/v1` or `/mcp` automatically.
 */
export class MemMachineClient {
  /** Low-level HTTP client (isomorphic fetch). */
  readonly http: HttpClient;

  /** Grouped REST methods for working with memories. */
  readonly memories: {
    /** Add a memory episode to both episodic and profile memory. */
    add: (body: NewEpisode) => Promise<void>;
    /** Add a memory episode only to episodic memory. */
    addEpisodic: (body: NewEpisode) => Promise<void>;
    /** Add a memory episode only to profile memory. */
    addProfile: (body: NewEpisode) => Promise<void>;
    /** Search both episodic and profile memories. */
    search: (body: SearchQuery) => Promise<SearchResult>;
    /** Search only episodic memory. */
    searchEpisodic: (body: SearchQuery) => Promise<SearchResult>;
    /** Search only profile memory. */
    searchProfile: (body: SearchQuery) => Promise<SearchResult>;
    /** Delete all data for the specified session. */
    delete: (body: DeleteDataRequest) => Promise<void>;
  };

  /** Grouped REST methods for reading sessions. */
  readonly sessions: {
    /** List all sessions. */
    getAll: () => Promise<AllSessionsResponse>;
    /** List all sessions for a user. */
    forUser: (userId: string) => Promise<AllSessionsResponse>;
    /** List all sessions for a group. */
    forGroup: (groupId: string) => Promise<AllSessionsResponse>;
    /** List all sessions for an agent. */
    forAgent: (agentId: string) => Promise<AllSessionsResponse>;
  };

  /** Grouped MCP tool/resource methods. */
  readonly mcp: {
    /** Adds unified memory via MCP tool. */
    addSessionMemory: (body: NewEpisode) => Promise<McpStatus>;
    /** Adds episodic memory via MCP tool. */
    addEpisodicMemory: (body: NewEpisode) => Promise<McpStatus>;
    /** Adds profile memory via MCP tool. */
    addProfileMemory: (body: NewEpisode) => Promise<McpStatus>;
    /** Searches episodic memory via MCP tool. */
    searchEpisodicMemory: (body: SearchQuery) => Promise<SearchResult>;
    /** Searches profile memory via MCP tool. */
    searchProfileMemory: (body: SearchQuery) => Promise<SearchResult>;
    /** Searches both memories via MCP tool. */
    searchSessionMemory: (body: SearchQuery) => Promise<SearchResult>;
    /** Deletes session data via MCP tool (self-contained). */
    deleteSessionData: (body: DeleteDataRequest) => Promise<McpStatus>;
    /** Deletes all data via MCP tool using contextual session info. */
    deleteData: () => Promise<McpStatus>;
    /** All sessions as MCP resource. */
    sessions: () => Promise<AllSessionsResponse>;
    /** User sessions as MCP resource. */
    userSessions: (userId: string) => Promise<AllSessionsResponse>;
    /** Group sessions as MCP resource. */
    groupSessions: (groupId: string) => Promise<AllSessionsResponse>;
    /** Agent sessions as MCP resource. */
    agentSessions: (agentId: string) => Promise<AllSessionsResponse>;
  };

  constructor(options: ClientOptions = {}) {
    this.http = new HttpClient(options);

    // REST groups
    this.memories = {
      add: async (body: NewEpisode): Promise<void> => {
        await this.http.requestRest<void>('POST', '/memories', { body });
      },
      addEpisodic: async (body: NewEpisode): Promise<void> => {
        await this.http.requestRest<void>('POST', '/memories/episodic', { body });
      },
      addProfile: async (body: NewEpisode): Promise<void> => {
        await this.http.requestRest<void>('POST', '/memories/profile', { body });
      },
      search: (body: SearchQuery) => this.http.requestRest<SearchResult>('POST', '/memories/search', { body }),
      searchEpisodic: (body: SearchQuery) => this.http.requestRest<SearchResult>('POST', '/memories/episodic/search', { body }),
      searchProfile: (body: SearchQuery) => this.http.requestRest<SearchResult>('POST', '/memories/profile/search', { body }),
      delete: async (body: DeleteDataRequest): Promise<void> => {
        await this.http.requestRest<void>('DELETE', '/memories', { body });
      },
    };

    this.sessions = {
      getAll: () => this.http.requestRest<AllSessionsResponse>('GET', '/sessions'),
      forUser: (userId: string) => this.http.requestRest<AllSessionsResponse>('GET', `/users/${encodeURIComponent(userId)}/sessions`),
      forGroup: (groupId: string) => this.http.requestRest<AllSessionsResponse>('GET', `/groups/${encodeURIComponent(groupId)}/sessions`),
      forAgent: (agentId: string) => this.http.requestRest<AllSessionsResponse>('GET', `/agents/${encodeURIComponent(agentId)}/sessions`),
    };

    // MCP tools/resources
    this.mcp = {
      addSessionMemory: (body: NewEpisode) => this.http.requestMcp<McpStatus>('POST', '/add_session_memory', { body }),
      addEpisodicMemory: (body: NewEpisode) => this.http.requestMcp<McpStatus>('POST', '/add_episodic_memory', { body }),
      addProfileMemory: (body: NewEpisode) => this.http.requestMcp<McpStatus>('POST', '/add_profile_memory', { body }),
      searchEpisodicMemory: (body: SearchQuery) => this.http.requestMcp<SearchResult>('POST', '/search_episodic_memory', { body }),
      searchProfileMemory: (body: SearchQuery) => this.http.requestMcp<SearchResult>('POST', '/search_profile_memory', { body }),
      searchSessionMemory: (body: SearchQuery) => this.http.requestMcp<SearchResult>('POST', '/search_session_memory', { body }),
      deleteSessionData: (body: DeleteDataRequest) => this.http.requestMcp<McpStatus>('POST', '/delete_session_data', { body }),
      deleteData: () => this.http.requestMcp<McpStatus>('POST', '/delete_data'),
      sessions: () => this.http.requestMcp<AllSessionsResponse>('GET', '/sessions'),
      userSessions: (userId: string) => this.http.requestMcp<AllSessionsResponse>('GET', `/users/${encodeURIComponent(userId)}/sessions`),
      groupSessions: (groupId: string) => this.http.requestMcp<AllSessionsResponse>('GET', `/groups/${encodeURIComponent(groupId)}/sessions`),
      agentSessions: (agentId: string) => this.http.requestMcp<AllSessionsResponse>('GET', `/agents/${encodeURIComponent(agentId)}/sessions`),
    };
  }

  /** Health check for the service. */
  health(): Promise<HealthResponse> {
    return this.http.requestRest<HealthResponse>('GET', '/health');
  }

  /** Update or set the bearer token used for auth. */
  setApiKey(token?: string) {
    this.http.setApiKey(token);
  }
}

export { ApiError } from './errors.js';
export type {
  ClientOptions,
  NewEpisode,
  SearchQuery,
  SearchResult,
  DeleteDataRequest,
  AllSessionsResponse,
  HealthResponse,
  McpStatus,
} from './types.js';
