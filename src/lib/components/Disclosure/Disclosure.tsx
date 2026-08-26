import type { CSSProperties, ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface DisclosureProps {
  /** The always-visible summary/label (clickable to expand). */
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Left-border accent color (e.g. tokens.primary for tool blocks). */
  accent?: string;
  /** Cap the body height and scroll it — for long logs/output/diffs. */
  maxBodyHeight?: number;
  /** Extra style for the body container. */
  bodyStyle?: CSSProperties;
}

/** An inline collapsible block built on native <details> (keyboard- and
 * find-in-page-friendly). Generic replacement for the many ad-hoc
 * <details>-with-accent-border and "Advanced ▸/▾" toggles. */
export default function Disclosure({
  summary,
  children,
  defaultOpen = false,
  accent = tokens.borderMedium,
  maxBodyHeight,
  bodyStyle,
}: DisclosureProps) {
  return (
    <details
      open={defaultOpen}
      className="sg-disclosure"
      style={{
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <summary className="sg-disclosure__summary">{summary}</summary>
      <div
        className="sg-disclosure__body"
        style={{
          ...(maxBodyHeight !== undefined ? { maxHeight: maxBodyHeight, overflowY: 'auto' } : {}),
          ...bodyStyle,
        }}
      >
        {children}
      </div>
    </details>
  );
}
