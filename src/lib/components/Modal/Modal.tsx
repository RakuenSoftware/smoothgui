import { useEffect, type ReactNode } from 'react';
import { tokens } from '../../tokens';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Header title; omit for a chromeless card. */
  title?: ReactNode;
  /** Extra header content beside the title (e.g. a subtitle or Badge). */
  headerExtra?: ReactNode;
  /** Sticky footer content (e.g. action buttons). */
  footer?: ReactNode;
  size?: ModalSize;
  children?: ReactNode;
}

const WIDTH: Record<ModalSize, number> = { sm: 420, md: 560, lg: 720 };

/** A centered overlay dialog hosting arbitrary content, beyond the fixed
 * message/confirm shape of ConfirmDialog. Closes on Escape, backdrop click, or
 * the header × ; locks body scroll while open.
 *
 * Intentionally NOT a focus-trap (matching the library's other dialogs); for
 * stacked overlays, drive them from a single root rather than nesting. */
export default function Modal({ open, onClose, title, headerExtra, footer, size = 'md', children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(24, 22, 17, 0.58)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 24,
        overflow: 'auto',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tokens.surface,
          color: tokens.text,
          borderRadius: tokens.radiusMd,
          border: `1px solid ${tokens.borderMedium}`,
          width: '100%',
          maxWidth: WIDTH[size],
          boxShadow: tokens.shadowFloat,
          fontFamily: tokens.fontSans,
        }}
      >
        {(title !== undefined || headerExtra !== undefined) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderBottom: `1px solid ${tokens.borderLight}`,
              position: 'sticky',
              top: 0,
              background: tokens.surface,
              borderRadius: `${tokens.radiusMd} ${tokens.radiusMd} 0 0`,
            }}
          >
            {title !== undefined && <strong style={{ fontFamily: tokens.fontDisplay, fontSize: 18, fontWeight: 600 }}>{title}</strong>}
            {headerExtra}
            <button
              aria-label="Close"
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: tokens.textHint,
                cursor: 'pointer',
                fontSize: 20,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: 16 }}>{children}</div>
        {footer !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderTop: `1px solid ${tokens.borderLight}`,
              position: 'sticky',
              bottom: 0,
              background: tokens.surface,
              borderRadius: `0 0 ${tokens.radiusMd} ${tokens.radiusMd}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
