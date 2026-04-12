/**
 * Design tokens mirroring the CSS custom properties in _tokens.scss.
 * Use these in React inline styles to stay consistent with the shared
 * smoothgui look-and-feel — e.g. `color: tokens.primary` instead of '#4fc3f7'.
 */
export const tokens = {
  // Brand / accent
  primary:        '#4fc3f7',
  sidebarBg:      '#1a1a2e',
  sidebarHover:   '#2a2a4a',

  // Text
  text:           '#333',
  textMuted:      '#555',
  textSecondary:  '#666',
  textFaint:      '#888',
  textHint:       '#999',
  textPale:       '#aaa',
  textNav:        '#b0b0b0',

  // Surfaces / backgrounds
  bg:             '#f5f5f5',
  surface:        '#fff',
  surfaceAlt:     '#fafafa',
  surfaceHover:   '#f8f8f8',
  surfaceSunken:  '#f9f9f9',

  // Borders
  border:         '#e0e0e0',
  borderLight:    '#eee',
  borderMedium:   '#ddd',
  borderSidebar:  '#2a2a4a',
  borderSubtle:   '#f5f5f5',

  // Semantic — success
  success:        '#4caf50',
  successDark:    '#2e7d32',
  successBg:      '#e8f5e9',

  // Semantic — warning
  warning:        '#ff9800',
  warningDark:    '#e65100',
  warningBorder:  '#ffb74d',
  warningBg:      '#fff3e0',

  // Semantic — danger
  danger:         '#f44336',
  dangerDark:     '#c62828',
  dangerBg:       '#ffebee',

  // Semantic — info
  info:           '#1e88e5',
  infoDark:       '#1565c0',
  infoBg:         '#e3f2fd',
  infoBorder:     '#90caf9',

  // Semantic — purple
  purple:         '#6a1b9a',
  purpleBg:       '#f3e5f5',

  // Misc
  tableWarningBg: '#fff8e1',
  sidebarText:    '#e0e0e0',
} as const;

export type Tokens = typeof tokens;
