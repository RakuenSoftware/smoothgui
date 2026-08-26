import type { ButtonHTMLAttributes } from 'react';

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
  className,
  children,
  'aria-busy': ariaBusy,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;  // `busy` intentionally does not disable
  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      disabled={isDisabled}
      aria-busy={loading || busy || ariaBusy || undefined}
      className={`sg-button sg-button--${variant} sg-button--${size}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </button>
  );
}
