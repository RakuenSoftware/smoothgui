export type Theme = 'light' | 'dark';
export type ThemeDefault = Theme | 'system';

/**
 * The document attribute the palettes in _tokens.scss key off. Present only
 * once a choice has been made or applied — its absence means "follow the OS",
 * which the stylesheet already handles via prefers-color-scheme.
 */
export const THEME_ATTRIBUTE = 'data-theme';

/** Storage key for the visitor's explicit choice. */
export const THEME_STORAGE_KEY = 'sg-theme';

/**
 * The visitor's explicit choice, or null while they are using the consumer's
 * configured default.
 *
 * Storage throws rather than returning null when it is blocked (Safari private
 * browsing, some embedded webviews). Treating that as "no choice recorded" is
 * correct: the configured default still applies and the toggle still works for
 * the lifetime of the page.
 */
export function storedTheme(storageKey = THEME_STORAGE_KEY): Theme | null {
  let value: string | null;
  try {
    value = localStorage.getItem(storageKey);
  } catch {
    return null;
  }
  return value === 'light' || value === 'dark' ? value : null;
}

export function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** The theme currently in effect: an explicit choice, then the configured default. */
export function activeTheme(
  defaultTheme: ThemeDefault = 'system',
  storageKey = THEME_STORAGE_KEY,
): Theme {
  return storedTheme(storageKey) ?? (defaultTheme === 'system' ? systemTheme() : defaultTheme);
}

/** Persists a choice. Returns false when storage is unavailable. */
export function storeTheme(theme: Theme, storageKey = THEME_STORAGE_KEY): boolean {
  try {
    localStorage.setItem(storageKey, theme);
    return true;
  } catch {
    return false;
  }
}

/** Clears the explicit choice, returning the document to following the OS. */
export function clearStoredTheme(storageKey = THEME_STORAGE_KEY): boolean {
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
}

/**
 * Inline script source that applies a stored choice or non-system default
 * before first paint, so the visitor never sees the other palette flash first.
 *
 * A consumer using the default `system` policy only needs this for stored
 * overrides; prefers-color-scheme handles everyone else without JavaScript.
 *
 * Inject the return value as the body of a <script> in <head>, ahead of the
 * bundle. It is a constant built from this module's own key and attribute, so
 * it cannot drift out of step with them.
 */
export function themePreloadScript(
  defaultTheme: ThemeDefault = 'system',
  storageKey = THEME_STORAGE_KEY,
): string {
  return (
    `(function(){var t=null;try{t=localStorage.getItem(${JSON.stringify(storageKey)})}catch(e){}` +
    `var d=${JSON.stringify(defaultTheme)};if(t==="light"||t==="dark")d=t;` +
    `if(d!=="system")document.documentElement.setAttribute(` +
    `${JSON.stringify(THEME_ATTRIBUTE)},d)})()`
  );
}
