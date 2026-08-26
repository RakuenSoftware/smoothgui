import type { ReactNode } from 'react';

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
      className="sg-switch__track"
    >
      <span className="sg-switch__thumb" />
    </button>
  );
  if (label == null) return track;
  return (
    <span className="sg-switch">
      {track}
      {label}
    </span>
  );
}
