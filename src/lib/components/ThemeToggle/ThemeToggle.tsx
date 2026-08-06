import { useEffect, useState } from 'react';
import { activeTheme, applyTheme, storeTheme, storedTheme, systemTheme } from '../../theme';
import type { Theme } from '../../theme';
import './ThemeToggle.scss';

export interface ThemeToggleProps {
  /** Accessible label. Receives the theme a click would switch TO. */
  label?: (next: Theme) => string;
}

const defaultLabel = (next: Theme) => `Switch to ${next} theme`;

/**
 * Switches the document between the light and dark palettes.
 *
 * Until the visitor clicks, the document follows the OS — and keeps following
 * it if the OS changes mid-visit. The first click makes the choice explicit and
 * persists it, from which point the OS is ignored.
 *
 * Styled from currentColor rather than the palette tokens so it reads correctly
 * both on a light console bar and on the dark band of a SiteHeader.
 */
export default function ThemeToggle({ label = defaultLabel }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(activeTheme);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (storedTheme() == null) setTheme(systemTheme());
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="sg-theme-toggle"
      onClick={() => {
        storeTheme(next);
        setTheme(next);
      }}
      aria-label={label(next)}
      title={label(next)}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
