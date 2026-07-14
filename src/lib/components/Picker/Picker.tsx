import { ReactNode } from 'react';
import { tokens } from '../../tokens';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {label && <span style={{ fontSize: 13, color: tokens.textSecondary }}>{label}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: '5px 8px',
            borderRadius: 4,
            border: `1px solid ${tokens.borderMedium}`,
            fontSize: 13,
            minWidth: 180,
            background: tokens.surface,
            color: tokens.text,
          }}
        >
          {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {actions}
        {error && <span style={{ color: tokens.danger, fontSize: 12 }}>{error}</span>}
      </div>
    </div>
  );
}
