import { isApiError } from '../api/error';

// extractError converts an unknown thrown value into a string suitable
// for display. The optional translator argument enables code-based
// localisation: when the value is an ApiError carrying a stable `code`
// (e.g. "auth.invalid_credentials") and the translator returns a
// non-null string for that code, the localised string wins over the
// server-provided message.
//
// Backwards compatible: with two arguments, behaviour is unchanged —
// `.message` is still preferred, then the fallback. The translator is
// only consulted when both a code and a translator are present, so
// existing callers that only catch plain Errors keep working.
export function extractError(
  e: unknown,
  fallback = 'An unexpected error occurred',
  translator?: (code: string) => string | null | undefined,
): string {
  if (isApiError(e)) {
    if (e.code && translator) {
      const localised = translator(e.code);
      if (localised) return localised;
    }
    return e.message || fallback;
  }
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}
