import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** The "nothing here yet" message. */
  message: string;
  /** Optional leading glyph/emoji shown above the message. */
  icon?: ReactNode;
  /** Optional call-to-action (e.g. a Button) rendered below the message. */
  action?: ReactNode;
  /** Compact single-line variant for inside panels/tables (default false). */
  inline?: boolean;
}

/** The "No X yet" placeholder, standardised. Generic replacement for the ad-hoc
 * grey empties scattered across pages. */
export default function EmptyState({ message, icon, action, inline = false }: EmptyStateProps) {
  if (inline) {
    return <div className="sg-empty sg-empty--inline">{message}</div>;
  }
  return (
    <div className="sg-empty">
      {icon != null && <div className="sg-empty__icon">{icon}</div>}
      <div className="sg-empty__message">{message}</div>
      {action != null && <div className="sg-empty__action">{action}</div>}
    </div>
  );
}
