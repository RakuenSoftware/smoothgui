import { useCallback } from 'react';
import { isApiError } from '../api/error';
import { useI18n } from '../contexts/I18nContext';

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

// useExtractError returns a code-aware extractError bound to the
// active language via the surrounding I18nProvider. When the thrown
// value is an ApiError carrying a stable `code` (e.g.
// "auth.invalid_credentials"), the hook looks the code up under
// `error.<code>` in the active catalog. If no entry exists in any
// language, the server-provided English message wins so consumers
// still see something readable.
//
// This is the recommended path for components that want server-side
// errors localised: they don't need to plumb t() into every catch
// block themselves.
export function useExtractError(): (e: unknown, fallback?: string) => string {
  const { t } = useI18n();
  return useCallback((e, fallback) =>
    extractError(e, fallback, (code) => {
      const key = `error.${code}`;
      const localised = t(key);
      // I18nProvider returns the key itself when the key is missing
      // from every catalog. Treat that as "no localisation".
      return localised === key ? null : localised;
    }),
  [t]);
}
