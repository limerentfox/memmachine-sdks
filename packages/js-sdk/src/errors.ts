/**
 * A typed error for all non-2xx API responses. Includes status code and parsed details.
 */
export class ApiError extends Error {
  /** HTTP status code */
  readonly status: number;
  /** Parsed error details (e.g., FastAPI { detail: string } or arbitrary body) */
  readonly details?: unknown;
  /** HTTP method used */
  readonly method?: string;
  /** Request path */
  readonly path?: string;

  constructor(message: string, status: number, details?: unknown, method?: string, path?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.method = method;
    this.path = path;
  }
}
