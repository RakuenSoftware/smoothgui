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
  return (
    <div role="tablist" aria-label={ariaLabel} className={`sg-tabs sg-tabs--${size}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className="sg-tabs__tab"
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
