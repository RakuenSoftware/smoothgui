import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

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
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 16, color: tokens.text }}>{title}</strong>
        {count !== undefined && (
          <span style={{ fontSize: 12, color: tokens.textFaint, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
        )}
        {actions !== undefined && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {actions}
          </span>
        )}
      </div>
      {status !== undefined && <div style={{ marginTop: 4, fontSize: 12, color: tokens.textSecondary }}>{status}</div>}
    </div>
  );
}
