import { ApiError } from './errors.js';
import type { ClientOptions } from './types.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Isomorphic, minimal HTTP client around fetch with JSON handling and timeouts. */
export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private apiKey?: string;
  private fetchImpl: typeof globalThis.fetch;
  private defaultTimeoutMs: number;
  private restPrefix: string;
  private mcpPrefix: string;

  constructor(opts: ClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? 'http://localhost:8080').replace(/\/$/, '');
    this.defaultHeaders = { 'Content-Type': 'application/json', ...(opts.headers ?? {}) };
    this.apiKey = opts.apiKey;
    this.fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis);
    this.defaultTimeoutMs = opts.timeoutMs ?? 15000;
    this.restPrefix = opts.restPrefix ?? '/v1';
    this.mcpPrefix = opts.mcpPrefix ?? '/mcp';
  }

  /** Update or set the bearer token used for auth. */
  setApiKey(token?: string) {
    this.apiKey = token;
  }

  /** Low-level request method that returns the typed JSON payload. */
  async request<T = unknown>(method: HttpMethod, urlPath: string, options: {
    body?: unknown;
    headers?: Record<string, string>;
    timeoutMs?: number;
  } = {}): Promise<T> {
    const url = this.joinUrl(this.baseUrl, urlPath);
    const headers = this.buildHeaders(options.headers);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? this.defaultTimeoutMs);

    try {
      const resp = await this.fetchImpl(url, {
        method,
        headers,
        body: this.serializeBody(method, options.body),
        signal: controller.signal,
      });

      const isJson = resp.headers.get('content-type')?.includes('application/json');
      if (!resp.ok) {
        let details: unknown = undefined;
        let message = `${method} ${urlPath} failed with status ${resp.status}`;
        try {
          if (isJson) details = await resp.json();
          else details = await resp.text();
          if (typeof details === 'object' && details && 'detail' in (details as any)) {
            message = String((details as any).detail);
          } else if (typeof details === 'string' && details.trim().length) {
            message = details;
          }
        } catch {
          // ignore parse errors, keep default message
        }
        throw new ApiError(message, resp.status, details, method, urlPath);
      }

      if (resp.status === 204) return undefined as unknown as T;
      if (!isJson) {
        // If not JSON, try text and return as any
        const text = await resp.text();
        return text as unknown as T;
      }
      return (await resp.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Helper for REST endpoints under /v1. */
  requestRest<T = unknown>(method: HttpMethod, path: string, options?: { body?: unknown; headers?: Record<string, string>; timeoutMs?: number }) {
    return this.request<T>(method, this.restPrefix + path, options);
  }

  /** Helper for MCP endpoints under /mcp. */
  requestMcp<T = unknown>(method: HttpMethod, path: string, options?: { body?: unknown; headers?: Record<string, string>; timeoutMs?: number }) {
    return this.request<T>(method, this.mcpPrefix + path, options);
  }

  private buildHeaders(perRequest?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders, ...(perRequest ?? {}) };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    return headers;
  }

  private serializeBody(method: HttpMethod, body: unknown): BodyInit | undefined {
    if (method === 'GET' || method === 'DELETE') return body ? JSON.stringify(body) : undefined;
    if (body === undefined || body === null) return undefined;
    if (typeof body === 'string') return body; // assume caller sent JSON string
    return JSON.stringify(body);
  }

  private joinUrl(base: string, path: string): string {
    if (!path.startsWith('/')) return `${base}/${path}`;
    return base + path;
  }
}
