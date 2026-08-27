import { useEffect, useState } from 'react';
import {
  THEME_STORAGE_KEY,
  activeTheme,
  applyTheme,
  storeTheme,
  storedTheme,
  systemTheme,
} from '../../theme';
import type { Theme, ThemeDefault } from '../../theme';
import './ThemeToggle.scss';

export interface ThemeToggleProps {
  /** Accessible label. Receives the theme a click would switch TO. */
  label?: (next: Theme) => string;
  /** Theme used when the visitor has no stored choice (default `system`). */
  defaultTheme?: ThemeDefault;
  /** Storage key for the explicit choice (default `sg-theme`). */
  storageKey?: string;
}

const defaultLabel = (next: Theme) => `Switch to ${next} theme`;

/**
 * Switches the document between the light and dark palettes.
 *
 * Until the visitor clicks, the document uses `defaultTheme` (`system` unless
 * configured otherwise). The first click makes the choice explicit and
 * persists it under `storageKey`.
 *
 * Styled from currentColor rather than the palette tokens so it reads correctly
 * both on a light console bar and on the dark band of a SiteHeader.
 */
export default function ThemeToggle({
  label = defaultLabel,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => activeTheme(defaultTheme, storageKey));

  useEffect(() => {
    if (defaultTheme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (storedTheme(storageKey) == null) setTheme(systemTheme());
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="sg-theme-toggle"
      onClick={() => {
        storeTheme(next, storageKey);
        setTheme(next);
      }}
      aria-label={label(next)}
      title={label(next)}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
          </>
        ) : (
          <path d="M20.5 15.4A8.5 8.5 0 0 1 8.6 3.5 8.5 8.5 0 1 0 20.5 15.4Z" />
        )}
      </svg>
    </button>
  );
}
