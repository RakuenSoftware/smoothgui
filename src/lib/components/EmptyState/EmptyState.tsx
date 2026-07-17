import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

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
    return <div style={{ padding: 12, color: tokens.textPale, fontSize: 12 }}>{message}</div>;
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '32px 16px',
        color: tokens.textHint,
        fontSize: 13,
        textAlign: 'center',
      }}
    >
      {icon != null && <div style={{ fontSize: 28, lineHeight: 1 }}>{icon}</div>}
      <div>{message}</div>
      {action}
    </div>
  );
}
