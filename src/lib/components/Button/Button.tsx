import type { ButtonHTMLAttributes } from 'react';
import { tokens } from '../../tokens';

export type ButtonVariant = 'default' | 'primary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Dims + disables the button while an action is in flight. */
  loading?: boolean;
  /** Marks the button busy (sets aria-busy) WITHOUT disabling it — for actions
   * that must stay interactive while in flight (e.g. click-to-cancel/steer). */
  busy?: boolean;
}

const PALETTE: Record<ButtonVariant, { bg: string; color: string; border: string }> = {
  default: { bg: tokens.surface, color: tokens.textMuted, border: tokens.borderMedium },
  primary: { bg: tokens.primary, color: tokens.surface, border: tokens.primary },
  danger: { bg: tokens.dangerBg, color: tokens.dangerDark, border: tokens.danger },
  ghost: { bg: 'transparent', color: tokens.textSecondary, border: tokens.borderLight },
};

/** A design-token button with semantic variants. Generic replacement for the
 * inline `btn` style constant re-declared on nearly every page; carries no
 * app-specific coupling. */
export default function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  busy = false,
  disabled,
  style,
  children,
  'aria-busy': ariaBusy,
  ...rest
}: ButtonProps) {
  const p = PALETTE[variant];
  const pad = size === 'sm' ? '2px 8px' : '5px 12px';
  const fs = size === 'sm' ? 12 : 13;
  const isDisabled = disabled || loading;  // `busy` intentionally does not disable
  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      disabled={isDisabled}
      aria-busy={loading || busy || ariaBusy || undefined}
      style={{
        padding: pad,
        fontSize: fs,
        fontFamily: 'system-ui',
        borderRadius: 6,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        background: p.bg,
        color: p.color,
        border: `1px solid ${p.border}`,
        opacity: isDisabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
