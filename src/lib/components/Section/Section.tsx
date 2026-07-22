import type { ReactNode } from 'react';

export type SectionTone = 'default' | 'muted' | 'dark';
export type SectionWidth = 'wide' | 'narrow';

export interface SectionProps {
  /** Small uppercase kicker rendered above the title. */
  eyebrow?: ReactNode;
  /** Section heading. Rendered as an <h2>. */
  title?: ReactNode;
  /** Supporting copy rendered under the title. */
  description?: ReactNode;
  /** Background treatment. `dark` flips text to the on-dark palette. */
  tone?: SectionTone;
  /** Content column width: `wide` (default) or `narrow` for long-form text. */
  width?: SectionWidth;
  /** Centre the section header text (default false). */
  centered?: boolean;
  /** Optional element id, for in-page anchors. */
  id?: string;
  children?: ReactNode;
}

/**
 * A page section with consistent vertical rhythm, an optional header block and a
 * constrained content column. The basic building block for long-form and
 * marketing pages, the way `Panel` is for console pages.
 */
export default function Section({
  eyebrow,
  title,
  description,
  tone = 'default',
  width = 'wide',
  centered = false,
  id,
  children,
}: SectionProps) {
  const hasHeader = eyebrow != null || title != null || description != null;
  return (
    <section id={id} className={`sg-section sg-section--${tone}`}>
      <div className={`sg-section__inner sg-section__inner--${width}`}>
        {hasHeader && (
          <header className={`sg-section__header${centered ? ' sg-section__header--centered' : ''}`}>
            {eyebrow != null && <p className="sg-section__eyebrow">{eyebrow}</p>}
            {title != null && <h2 className="sg-section__title">{title}</h2>}
            {description != null && <p className="sg-section__description">{description}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
