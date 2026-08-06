/**
 * Design tokens for React inline styles — e.g. `color: tokens.primary` instead
 * of '#4fc3f7'.
 *
 * Each value is a reference to the custom property of the same name in
 * _tokens.scss, not a copy of its colour. That indirection is what makes
 * inline-styled components theme-aware: the browser resolves the property
 * against whichever palette is active, so a component styled with these tokens
 * follows light and dark without knowing either exists. Hard-coding a hex here
 * would silently opt that component out of theming.
 *
 * These are only valid where the browser resolves custom properties: CSS
 * property values, including inside shorthand strings like
 * `1px solid ${tokens.border}`. They will NOT work in SVG presentation
 * attributes, canvas calls, or anywhere the value is parsed as a colour by
 * something other than the CSS engine.
 */
export const tokens = {
  // Brand / accent
  primary:        'var(--sg-primary)',
  primaryHover:   'var(--sg-primary-hover)',
  /** Foreground for text on a solid accent fill. Fixed on both palettes. */
  onAccent:       'var(--sg-on-accent)',
  sidebarBg:      'var(--sg-sidebar-bg)',
  sidebarHover:   'var(--sg-sidebar-hover)',

  // Text
  text:           'var(--sg-text)',
  textMuted:      'var(--sg-text-muted)',
  textSecondary:  'var(--sg-text-secondary)',
  textFaint:      'var(--sg-text-faint)',
  textHint:       'var(--sg-text-hint)',
  textPale:       'var(--sg-text-pale)',
  textNav:        'var(--sg-text-nav)',

  // Surfaces / backgrounds
  bg:             'var(--sg-bg)',
  surface:        'var(--sg-surface)',
  surfaceAlt:     'var(--sg-surface-alt)',
  surfaceHover:   'var(--sg-surface-hover)',
  surfaceActive:  'var(--sg-surface-active)',
  surfaceSunken:  'var(--sg-surface-sunken)',

  // Borders
  border:         'var(--sg-border)',
  borderLight:    'var(--sg-border-light)',
  borderMedium:   'var(--sg-border-medium)',
  borderSidebar:  'var(--sg-border-sidebar)',
  borderSubtle:   'var(--sg-border-subtle)',

  // Semantic — success
  success:        'var(--sg-success)',
  successDark:    'var(--sg-success-dark)',
  successBg:      'var(--sg-success-bg)',

  // Semantic — warning
  warning:        'var(--sg-warning)',
  warningDark:    'var(--sg-warning-dark)',
  warningBorder:  'var(--sg-warning-border)',
  warningBg:      'var(--sg-warning-bg)',

  // Semantic — danger
  danger:         'var(--sg-danger)',
  dangerDark:     'var(--sg-danger-dark)',
  dangerLight:    'var(--sg-danger-light)',
  dangerBg:       'var(--sg-danger-bg)',

  // Semantic — info
  info:           'var(--sg-info)',
  infoDark:       'var(--sg-info-dark)',
  infoBg:         'var(--sg-info-bg)',
  infoBorder:     'var(--sg-info-border)',

  // Semantic — purple
  purple:         'var(--sg-purple)',
  purpleBg:       'var(--sg-purple-bg)',

  // Misc
  tableWarningBg: 'var(--sg-table-warning-bg)',
  sidebarText:    'var(--sg-sidebar-text)',

  // Dark bands (hero / footer / CTA on marketing + long-form pages, and the
  // login screen). Dark on both palettes by design.
  darkSurface:    'var(--sg-dark-surface)',
  darkSurfaceAlt: 'var(--sg-dark-surface-alt)',
  darkSurfaceRaised: 'var(--sg-dark-surface-raised)',
  onDark:         'var(--sg-on-dark)',
  onDarkMuted:    'var(--sg-on-dark-muted)',
  darkBorder:     'var(--sg-dark-border)',

  // Content layout
  contentMax:     'var(--sg-content-max)',
  contentNarrow:  'var(--sg-content-narrow)',
  // Data visualisation — see the note in _tokens.scss. Not the brand ramp:
  // primary fails the lightness band and the contrast floor for a data mark.
  chart1:         'var(--sg-chart-1)',
  chart2:         'var(--sg-chart-2)',
  chartMuted:     'var(--sg-chart-muted)',
  chartGrid:      'var(--sg-chart-grid)',
  chartRule:      'var(--sg-chart-rule)',

} as const;

export type Tokens = typeof tokens;
