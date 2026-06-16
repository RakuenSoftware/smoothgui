import { ApiError } from './error';

// Code returned by the backend (and middleware) when an authenticated session
// is valid but the account must change its password before doing anything else.
export const PASSWORD_CHANGE_REQUIRED_CODE = 'auth.password_change_required';

let passwordChangeRequiredHandler: (() => void) | null = null;

// setPasswordChangeRequiredHandler registers a callback invoked whenever any
// request is rejected with 403 auth.password_change_required. AuthProvider uses
// this to raise the forced password-change gate even when the condition is
// discovered mid-session (e.g. after a page reload) rather than at login.
export function setPasswordChangeRequiredHandler(cb: (() => void) | null): void {
  passwordChangeRequiredHandler = cb;
}

function notifyIfPasswordChangeRequired(err: ApiError): void {
  if (err.status === 403 && err.code === PASSWORD_CHANGE_REQUIRED_CODE) {
    passwordChangeRequiredHandler?.();
  }
}

export async function apiFetch<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = { method, headers: {} };
  if (body !== undefined) {
    (opts.headers as Record<string, string>)['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await buildApiError(res);
    notifyIfPasswordChangeRequired(err);
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json() as Promise<T>;
  return undefined as T;
}

export async function apiFetchForm<T = unknown>(method: string, path: string, form: FormData): Promise<T> {
  const res = await fetch(path, { method, body: form });
  if (!res.ok) {
    const err = await buildApiError(res);
    notifyIfPasswordChangeRequired(err);
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json() as Promise<T>;
  return undefined as T;
}

// buildApiError parses the error response body and constructs an
// ApiError carrying status, code, and the parsed body. If the body
// isn't JSON or has no recognised fields, the message falls back
// to "<status> <statusText>".
//
// Backward compatibility: callers that only inspect `.message`
// continue to see the same string they did before — the
// preference order (`error` → `message` → status text) hasn't
// changed. New code can additionally inspect `.code` for stable
// error identifiers and `.body` for structured detail.
async function buildApiError(res: Response): Promise<ApiError> {
  let msg = `${res.status} ${res.statusText}`;
  let code: string | undefined;
  let body: unknown;
  try {
    const j = await res.json();
    body = j;
    if (j && typeof j === 'object') {
      const obj = j as Record<string, unknown>;
      if (typeof obj.error === 'string') msg = obj.error;
      else if (typeof obj.message === 'string') msg = obj.message;
      if (typeof obj.code === 'string') code = obj.code;
    }
  } catch {
    // Body wasn't JSON; keep the status-text message.
  }
  return new ApiError(msg, { status: res.status, code, body });
}
