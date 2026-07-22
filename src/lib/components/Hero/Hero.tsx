import type { ReactNode } from 'react';

export type HeroTone = 'light' | 'dark';

export interface HeroProps {
  /** Small uppercase kicker above the title. */
  eyebrow?: ReactNode;
  /** The headline. Rendered as an <h1>. */
  title: ReactNode;
  /** Supporting copy under the headline. */
  subtitle?: ReactNode;
  /** Buttons/links row rendered under the subtitle. */
  actions?: ReactNode;
  /** Optional visual (screenshot, terminal, diagram) shown beside the copy. */
  media?: ReactNode;
  /** Colour treatment (default `dark`). */
  tone?: HeroTone;
}

/**
 * Top-of-page banner: headline, supporting copy, calls to action and an optional
 * side visual. Collapses to a single column on narrow viewports.
 */
export default function Hero({
  eyebrow,
  title,
  subtitle,
  actions,
  media,
  tone = 'dark',
}: HeroProps) {
  return (
    <header className={`sg-hero sg-hero--${tone}`}>
      <div className={`sg-hero__inner${media != null ? ' sg-hero__inner--split' : ''}`}>
        <div className="sg-hero__copy">
          {eyebrow != null && <p className="sg-hero__eyebrow">{eyebrow}</p>}
          <h1 className="sg-hero__title">{title}</h1>
          {subtitle != null && <p className="sg-hero__subtitle">{subtitle}</p>}
          {actions != null && <div className="sg-hero__actions">{actions}</div>}
        </div>
        {media != null && <div className="sg-hero__media">{media}</div>}
      </div>
    </header>
  );
}
