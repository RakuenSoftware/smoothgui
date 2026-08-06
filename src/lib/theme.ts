export type Theme = 'light' | 'dark';

/**
 * The document attribute the palettes in _tokens.scss key off. Present only
 * once a choice has been made or applied — its absence means "follow the OS",
 * which the stylesheet already handles via prefers-color-scheme.
 */
export const THEME_ATTRIBUTE = 'data-theme';

/** Storage key for the visitor's explicit choice. */
export const THEME_STORAGE_KEY = 'sg-theme';

/**
 * The visitor's explicit choice, or null while they are following the OS.
 *
 * Storage throws rather than returning null when it is blocked (Safari private
 * browsing, some embedded webviews). Treating that as "no choice recorded" is
 * correct: the OS preference still applies and the toggle still works for the
 * lifetime of the page.
 */
export function storedTheme(): Theme | null {
  let value: string | null;
  try {
    value = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
  return value === 'light' || value === 'dark' ? value : null;
}

export function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** The theme currently in effect: the explicit choice if there is one, else the OS. */
export function activeTheme(): Theme {
  return storedTheme() ?? systemTheme();
}

/** Persists a choice. Returns false when storage is unavailable. */
export function storeTheme(theme: Theme): boolean {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

/** Clears the explicit choice, returning the document to following the OS. */
export function clearStoredTheme(): boolean {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
}

/**
 * Inline script source that applies a stored choice before first paint, so a
 * visitor who has overridden the OS never sees the other palette flash first.
 *
 * Only needed for the override case — a visitor who follows the OS is already
 * handled by prefers-color-scheme in the stylesheet, with no JavaScript.
 *
 * Inject the return value as the body of a <script> in <head>, ahead of the
 * bundle. It is a constant built from this module's own key and attribute, so
 * it cannot drift out of step with them.
 */
export function themePreloadScript(): string {
  return (
    `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});` +
    `if(t==="light"||t==="dark")document.documentElement.setAttribute(` +
    `${JSON.stringify(THEME_ATTRIBUTE)},t)}catch(e){}})()`
  );
}
