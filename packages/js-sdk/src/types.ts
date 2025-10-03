/*
 * Type definitions aligned with the MemMachine OpenAPI (v1.0.0)
 */

/** Defines the context of a memory session. */
export interface SessionData {
  /** Optional group ID. */
  group_id?: string | null;
  /** List of agents involved in the session. */
  agent_id?: string[] | null;
  /** List of users involved in the session. */
  user_id?: string[] | null;
  /** Unique session identifier. */
  session_id: string;
}

/** Data model for adding a new memory episode. */
export interface NewEpisode {
  /** The session context for the episode. */
  session: SessionData;
  /** The ID of the entity that produced the content. */
  producer: string;
  /** The ID of the entity the content was produced for. */
  produced_for: string;
  /** The content, either as raw text or an embedding vector. */
  episode_content: string | number[];
  /** The type of content (e.g., 'dialog', 'summary'). */
  episode_type: string;
  /** Optional arbitrary metadata. */
  metadata?: Record<string, unknown> | null;
}

/** Data model for querying the memory system. */
export interface SearchQuery {
  /** The session context for the search. */
  session: SessionData;
  /** The natural language query or concept. */
  query: string;
  /** Optional filters for episodic/profile memory. */
  filter?: Record<string, unknown> | null;
  /** Maximum number of results to return. */
  limit?: number | null;
}

/** Unified response model for memory search results. */
export interface SearchResult {
  /** Status code (0 for success, non-zero for error). */
  status: number;
  /** The combined search results from memory. Varies by endpoint. */
  content: Record<string, unknown>;
}

/** Data model for deleting all data associated with a session. */
export interface DeleteDataRequest {
  /** The session context whose data should be deleted. */
  session: SessionData;
}

/** Model representing a single active memory session. */
export interface MemorySession {
  /** List of user IDs associated with the session. */
  user_ids: string[];
  /** Unique session identifier. */
  session_id: string;
  /** Optional group ID. */
  group_id?: string | null;
  /** List of agent IDs associated with the session. */
  agent_ids?: string[] | null;
}

/** Response model containing a list of all retrieved memory sessions. */
export interface AllSessionsResponse {
  /** The list of session objects. */
  sessions: MemorySession[];
}

/** Health check response model. */
export interface HealthResponse {
  status: string; // e.g., "healthy"
  service: string; // e.g., "memmachine"
  version: string; // e.g., "1.0.0"
  memory_managers: {
    profile_memory: boolean;
    episodic_memory: boolean;
  };
}

/** Simple status envelope used by MCP endpoints for write/delete tools. */
export interface McpStatus {
  /** Status code (0 for success). */
  status: number;
  /** Error message if status is non-zero. */
  error_msg: string;
}

/** Client construction options. */
export interface ClientOptions {
  /** The host root where the API is hosted. Example: http://localhost:8080 */
  baseUrl?: string;
  /** Optional bearer token. If provided, adds `Authorization: Bearer <token>` to all requests. */
  apiKey?: string;
  /** Default headers to apply to every request. */
  headers?: Record<string, string>;
  /** Default timeout in milliseconds for requests. */
  timeoutMs?: number;
  /** Optional custom fetch implementation (for testing or polyfills). */
  fetch?: typeof globalThis.fetch;
  /** Prefix for standard REST endpoints (default: '/v1'). */
  restPrefix?: string;
  /** Prefix for MCP endpoints (default: '/mcp'). */
  mcpPrefix?: string;
}
