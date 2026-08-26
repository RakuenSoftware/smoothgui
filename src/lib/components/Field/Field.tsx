import type { ReactNode } from 'react';

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
    <label className="sg-field">
      <div className="sg-field__caption">
        <span className="sg-field__label">
          {label}
          {required && <span className="sg-field__required"> *</span>}
        </span>
        {hint && <span className="sg-field__hint">{hint}</span>}
      </div>
      {help && (
        <div className="sg-field__help">{help}</div>
      )}
      {children}
    </label>
  );
}
