import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Optional text shown after the toggle. */
  label?: ReactNode;
  /** Accessible name when there is no visible `label`. */
  ariaLabel?: string;
}

/** A sliding on/off toggle. Generic replacement for the hand-rolled 52×26
 * switch built inline in the pipeline/settings pages. */
export default function Switch({ checked, onChange, disabled, label, ariaLabel }: SwitchProps) {
  const track = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 52,
        height: 26,
        borderRadius: 13,
        border: `1px solid ${tokens.borderMedium}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? tokens.success : tokens.borderMedium,
        position: 'relative',
        transition: 'background .15s',
        opacity: disabled ? 0.6 : 1,
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 28 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: tokens.surface,
          transition: 'left .15s',
        }}
      />
    </button>
  );
  if (label == null) return track;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: tokens.textMuted }}>
      {track}
      {label}
    </span>
  );
}
