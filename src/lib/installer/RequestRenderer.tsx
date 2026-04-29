import { FormEvent, useMemo, useState } from 'react';
import type { InstallerOption, InstallerRequest, InstallerResponse } from './types';
import './installer.scss';

export interface RequestRendererProps {
  request: InstallerRequest;
  onSubmit: (response: InstallerResponse) => void;
  disabled?: boolean;
}

const parseSelectedFromInput = (values: string[]) =>
  values.filter((entry) => typeof entry === 'string' && entry.trim().length > 0);

export default function RequestRenderer({
  request,
  onSubmit,
  disabled = false,
}: RequestRendererProps) {
  const options: InstallerOption[] = useMemo(() => request.payload?.options ?? [], [request.payload?.options]);
  const multiple = request.payload?.multiple !== false;
  const defaultText = request.payload?.default ?? '';
  const placeholder = request.payload?.placeholder ?? '';

  const [text, setText] = useState(defaultText);
  const [selection, setSelection] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (submitted || disabled) {
      return;
    }
    setSubmitted(true);

    const response: InstallerResponse = {
      id: request.id,
      ok: true,
    };

    switch (request.kind) {
      case 'text':
      case 'password':
        response.value = text;
        break;
      case 'checklist':
        response.selected = parseSelectedFromInput(selection);
        break;
      case 'confirm':
      case 'notice':
      default:
        break;
    }

    onSubmit(response);
  };

  const onCheckboxChange = (value: string, enabled: boolean) => {
    if (!multiple) {
      setSelection(enabled ? [value] : []);
      return;
    }

    if (enabled) {
      setSelection([...selection, value]);
      return;
    }

    setSelection(selection.filter((entry) => entry !== value));
  };

  if (request.kind === 'notice') {
    return (
      <form className="sg-installer-form" onSubmit={submit}>
        <header className="sg-installer-header">
          <h1>{request.title}</h1>
        </header>
        <p className="sg-installer-message">{request.message}</p>
        <div className="sg-installer-actions">
          <button className="btn primary" type="submit" disabled={disabled || submitted}>
            Continue
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="sg-installer-form" onSubmit={submit}>
      <header className="sg-installer-header">
        <h1>{request.title}</h1>
      </header>
      <p className="sg-installer-message">{request.message}</p>

      {(request.kind === 'text' || request.kind === 'password') && (
        <label className="sg-installer-field">
          <input
            type={request.kind === 'password' ? 'password' : 'text'}
            value={text}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(event) => setText(event.currentTarget.value)}
          />
        </label>
      )}

      {request.kind === 'checklist' && options.length > 0 && (
        <fieldset className="sg-installer-field">
          {options.map((option) => (
            <label className="sg-installer-checkbox" key={option.value}>
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name="installer-checklist"
                value={option.value}
                disabled={disabled || option.disabled}
                onChange={(event) => onCheckboxChange(option.value, event.currentTarget.checked)}
              />
              <div>
                <div className="sg-installer-option-title">{option.label}</div>
                {option.description && (
                  <div className="sg-installer-option-description">
                    {option.description}
                  </div>
                )}
              </div>
            </label>
          ))}
        </fieldset>
      )}

      <div className="sg-installer-actions">
        <button className="btn primary" type="submit" disabled={disabled || submitted}>
          Continue
        </button>
        {request.kind === 'confirm' && (
          <button
            className="btn secondary"
            type="button"
            disabled={disabled || submitted}
            onClick={() =>
              onSubmit({
                id: request.id,
                ok: false,
                error: 'Cancelled by user',
              })
            }
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
