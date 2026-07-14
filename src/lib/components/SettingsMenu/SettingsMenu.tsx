import { useEffect, useRef, useState } from 'react';
import { tokens } from '../../tokens';

export interface SettingField {
  key: string;
  label: string;
  /** "bool" | "int" | "text" | "select" */
  type: string;
  help?: string;
  value: unknown;
  /** Choices for type "select". */
  options?: string[];
}

export interface SettingsMenuProps {
  fields: SettingField[];
  onChange: (key: string, value: unknown) => void;
  title?: string;
  loading?: boolean;
  error?: string;
  /** Key currently being saved (disables that control). */
  busyKey?: string;
  /** Called when the menu first opens (e.g. to lazy-load fields). */
  onOpen?: () => void;
}

/** A gear button that opens a dropdown of settings controls. Closes on outside
 * click / Escape. Field data + persistence are injected (onChange), so it has no
 * app-specific API coupling. */
export default function SettingsMenu({
  fields,
  onChange,
  title = 'Settings',
  loading,
  error,
  busyKey,
  onOpen,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && onOpen) onOpen();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title={title}
        style={{
          background: 'transparent',
          border: 'none',
          color: open ? tokens.primary : tokens.textSecondary,
          cursor: 'pointer',
          fontSize: 18,
          padding: '0 4px',
          lineHeight: 1,
        }}
      >
        ⚙
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 300,
            zIndex: 50,
            background: tokens.surfaceAlt,
            border: `1px solid ${tokens.borderMedium}`,
            borderRadius: 8,
            padding: '12px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: tokens.text }}>
            {title}
          </div>
          {error && <div style={{ color: tokens.danger, fontSize: 12, marginBottom: 6 }}>{error}</div>}
          {loading && <div style={{ color: tokens.textPale, fontSize: 12 }}>Loading…</div>}
          {!loading && fields.length === 0 && (
            <div style={{ color: tokens.textPale, fontSize: 12 }}>No settings available.</div>
          )}
          {fields.map((f) => (
            <label
              key={f.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '5px 0',
                fontSize: 12,
                color: tokens.textSecondary,
              }}
              title={f.help}
            >
              <span>{f.label}</span>
              {f.type === 'bool' ? (
                <input
                  type="checkbox"
                  checked={!!f.value}
                  disabled={busyKey === f.key}
                  onChange={(e) => onChange(f.key, e.target.checked)}
                />
              ) : f.type === 'select' ? (
                <select
                  value={String(f.value ?? '')}
                  disabled={busyKey === f.key}
                  onChange={(e) => onChange(f.key, e.target.value)}
                >
                  {(f.options || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === 'int' ? 'number' : 'text'}
                  value={String(f.value ?? '')}
                  disabled={busyKey === f.key}
                  onChange={(e) =>
                    onChange(f.key, f.type === 'int' ? Number(e.target.value) : e.target.value)
                  }
                  style={{ width: 120 }}
                />
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
