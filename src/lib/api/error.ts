// ApiError — Error subclass thrown by apiFetch / apiFetchForm when
// the server returns a non-2xx response.
//
// Carries the structured pieces the bare `Error.message` would lose:
//
//   - status   the HTTP status code (200, 400, 500, ...).
//   - code     an optional stable error code from the response body
//              (e.g. "auth.invalid_credentials"). Consumers can map
//              this to a localised message via their i18n catalog.
//   - body     the parsed JSON body (if any), preserved so consumers
//              can pull additional fields (validation details, etc.).
//
// Backwards-compatible: catch sites that only inspect `.message`
// continue to work — apiFetch sets `.message` from `body.error` /
// `body.message` / status text, exactly as before.
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body?: unknown;

  constructor(message: string, init: { status: number; code?: string; body?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.body = init.body;
  }
}

// isApiError narrows an unknown to ApiError. Useful in catch blocks
// that need to inspect `code` without a hard `instanceof` check
// (which can fail across module-boundary identity issues).
export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError ||
    (typeof e === 'object' && e !== null && 'name' in e && (e as { name: unknown }).name === 'ApiError');
}
