import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface FieldProps {
  label: string;
  /** Longer explanatory text under the label. */
  help?: string;
  /** Short trailing hint beside the label (e.g. "(optional)"). */
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

/** A form-field wrapper: caption label (+ optional help/hint) above a control.
 * Generic replacement for the per-page `L` / `lbl` label helpers. Wraps its
 * control in a <label> so clicking the caption focuses the input. */
export default function Field({ label, help, hint, required, children }: FieldProps) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: tokens.textMuted }}>
          {label}
          {required && <span style={{ color: tokens.danger }}> *</span>}
        </span>
        {hint && <span style={{ fontSize: 11, color: tokens.textPale }}>{hint}</span>}
      </div>
      {help && (
        <div style={{ fontSize: 11.5, color: tokens.textFaint, marginBottom: 4, lineHeight: 1.4 }}>
          {help}
        </div>
      )}
      {children}
    </label>
  );
}
