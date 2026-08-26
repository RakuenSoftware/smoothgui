import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: ReactNode;
  /** Optional count shown next to the title (e.g. a row total). */
  count?: number;
  /** Right-aligned action controls (buttons, etc.). */
  actions?: ReactNode;
  /** Optional status/hint line rendered under the title row. */
  status?: ReactNode;
}

/** A page-top bar: title (+ optional count) on the left, action controls on the
 * right, with an optional status line below. Standardises the header row that
 * nearly every page hand-assembles. */
export default function PageHeader({ title, count, actions, status }: PageHeaderProps) {
  return (
    <div className="sg-page-title">
      <div className="sg-page-title__row">
        <strong className="sg-page-title__heading">{title}</strong>
        {count !== undefined && (
          <span className="sg-page-title__count">{count}</span>
        )}
        {actions !== undefined && (
          <span className="sg-page-title__actions">
            {actions}
          </span>
        )}
      </div>
      {status !== undefined && <div className="sg-page-title__status">{status}</div>}
    </div>
  );
}
