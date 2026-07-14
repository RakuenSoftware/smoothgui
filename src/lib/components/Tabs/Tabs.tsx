import { tokens } from '../../tokens';

export interface TabOption {
  value: string;
  label: string;
  /** Optional hover/title text. */
  title?: string;
}

export interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  /** "sm" for compact toolbars (default "md"). */
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

/** A segmented control / tab strip. Generic replacement for ad-hoc pill-button
 * rows (prompt tiers, thread switchers, etc.). */
export default function Tabs({ options, value, onChange, size = 'md', ariaLabel }: TabsProps) {
  const pad = size === 'sm' ? '2px 8px' : '4px 12px';
  const fs = size === 'sm' ? 11 : 13;
  return (
    <div role="tablist" aria-label={ariaLabel} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            style={{
              padding: pad,
              fontSize: fs,
              fontFamily: 'system-ui',
              borderRadius: 10,
              cursor: 'pointer',
              background: active ? tokens.primary : 'transparent',
              color: active ? tokens.surface : tokens.textFaint,
              border: `1px solid ${active ? tokens.primary : tokens.borderLight}`,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
