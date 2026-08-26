import { ReactNode } from 'react';

export interface PickerOption {
  value: string;
  label: string;
}

export interface PickerProps {
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  /** Placeholder option shown for the empty value (e.g. "— none —"). */
  emptyLabel?: string;
  /** Extra controls rendered beside the select (e.g. a "+ Clone" button/form). */
  actions?: ReactNode;
  error?: string;
}

/** A labelled select with an optional actions slot. Generic core of a "choose an
 * item (and maybe add one)" control; data + side-actions are injected by the
 * caller, so it carries no app-specific API coupling. */
export default function Picker({
  options,
  value,
  onChange,
  label,
  emptyLabel,
  actions,
  error,
}: PickerProps) {
  return (
    <div className="sg-picker">
      <div className="sg-picker__row">
        {label && <span className="sg-picker__label">{label}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sg-picker__select"
        >
          {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {actions}
        {error && <span className="sg-picker__error">{error}</span>}
      </div>
    </div>
  );
}
