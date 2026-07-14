import { ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface DrawerProps {
  open: boolean;
  onToggle: () => void;
  /** Header title when open, and default toggle-button label when closed. */
  title: string;
  /** Toggle-button label when closed (defaults to `title`). */
  closedLabel?: string;
  /** Optional badge on the toggle button (e.g. an item count). */
  badge?: number | string;
  /** Which edge the drawer docks to (default "right"). */
  side?: 'left' | 'right';
  width?: number;
  children?: ReactNode;
}

/** A collapsible side panel: a docked toggle button when closed, a fixed-width
 * scrollable panel with a header + close control when open. Generic replacement
 * for the per-feature collapsible panels (rules, context, plugins, …). The
 * caller positions this inside a `position: relative` container. */
export default function Drawer({
  open,
  onToggle,
  title,
  closedLabel,
  badge,
  side = 'right',
  width = 320,
  children,
}: DrawerProps) {
  const edge = side === 'right' ? { right: 8 } : { left: 8 };
  if (!open) {
    return (
      <button
        onClick={onToggle}
        title={title}
        style={{
          position: 'absolute',
          top: 8,
          ...edge,
          zIndex: 10,
          padding: '4px 10px',
          fontSize: 12,
          borderRadius: 4,
          cursor: 'pointer',
          border: `1px solid ${tokens.borderMedium}`,
          background: tokens.surfaceAlt,
          color: tokens.textSecondary,
        }}
      >
        {closedLabel ?? title}
        {badge !== undefined && badge !== '' && (
          <span style={{ marginLeft: 4, color: tokens.textPale }}>({badge})</span>
        )}
      </button>
    );
  }
  const dock = side === 'right' ? { right: 0 } : { left: 0 };
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        ...dock,
        width,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        background: tokens.surface,
        [side === 'right' ? 'borderLeft' : 'borderRight']: `1px solid ${tokens.borderMedium}`,
        boxShadow: '0 0 24px rgba(0,0,0,0.18)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: `1px solid ${tokens.borderLight}`,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13, color: tokens.text }}>{title}</span>
        <button
          onClick={onToggle}
          title="Close"
          style={{
            background: 'transparent',
            border: 'none',
            color: tokens.textSecondary,
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>{children}</div>
    </div>
  );
}
