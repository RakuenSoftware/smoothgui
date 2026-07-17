import { tokens } from '../../tokens';

export interface ChipSelectProps {
  label?: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  /** A special "match everything" option always offered and highlighted
   * distinctly when selected (e.g. "all"). Omit to disable. */
  wildcard?: string;
  /** Hint shown beside the label when nothing is selected. */
  emptyHint?: string;
  /** Render as non-interactive tokens (no toggling). */
  readOnly?: boolean;
}

/** A toggleable multi-select rendered as chips, fully controlled by the parent.
 * Generic form of the per-page role/persona chip pickers. */
export default function ChipSelect({
  label,
  options,
  selected,
  onChange,
  wildcard,
  emptyHint,
  readOnly,
}: ChipSelectProps) {
  // Cheap enough to compute each render; avoids the comma-join memo key that
  // mis-caches when an option/selection value itself contains a comma.
  const all = Array.from(new Set<string>([...(wildcard ? [wildcard] : []), ...options, ...selected]));

  const toggle = (r: string) =>
    onChange(selected.includes(r) ? selected.filter((x) => x !== r) : [...selected, r]);

  return (
    <div style={{ margin: '10px 0 2px' }}>
      {(label || emptyHint) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {label && <span style={{ color: tokens.textFaint, fontSize: 12 }}>{label}</span>}
          {selected.length === 0 && emptyHint && (
            <span style={{ color: tokens.textPale, fontSize: 11 }}>{emptyHint}</span>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
        {all.map((r) => {
          const on = selected.includes(r);
          const isWild = wildcard !== undefined && r === wildcard;
          if (readOnly) {
            return (
              <span
                key={r}
                style={{
                  fontSize: 12,
                  padding: '1px 7px',
                  borderRadius: 4,
                  border: `1px solid ${tokens.border}`,
                  background: tokens.surfaceAlt,
                  color: tokens.textSecondary,
                }}
              >
                {r}
              </span>
            );
          }
          return (
            <button
              key={r}
              type="button"
              onClick={() => toggle(r)}
              style={{
                padding: '1px 7px',
                fontSize: 12,
                borderRadius: 4,
                cursor: 'pointer',
                border: `1px solid ${tokens.borderMedium}`,
                background: on ? (isWild ? tokens.purple : tokens.successDark) : tokens.surface,
                color: on ? tokens.surface : tokens.textMuted,
                fontWeight: isWild ? 600 : 400,
              }}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}
