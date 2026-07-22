import type { ReactNode } from 'react';

export type CallToActionTone = 'default' | 'dark';

export interface CallToActionProps {
  /** The ask, e.g. "Try it on your own hardware". Rendered as an <h2>. */
  title: ReactNode;
  /** Optional supporting sentence. */
  description?: ReactNode;
  /** Buttons/links. */
  actions?: ReactNode;
  /** Colour treatment (default `dark`). */
  tone?: CallToActionTone;
}

/** Full-width closing band that pushes the reader towards a single next step. */
export default function CallToAction({
  title,
  description,
  actions,
  tone = 'dark',
}: CallToActionProps) {
  return (
    <aside className={`sg-cta sg-cta--${tone}`}>
      <div className="sg-cta__inner">
        <div className="sg-cta__copy">
          <h2 className="sg-cta__title">{title}</h2>
          {description != null && <p className="sg-cta__description">{description}</p>}
        </div>
        {actions != null && <div className="sg-cta__actions">{actions}</div>}
      </div>
    </aside>
  );
}
