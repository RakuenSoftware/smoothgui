import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export interface KeyValueProps {
  label: ReactNode;
  value: ReactNode;
  /** Render the value in a monospace face (ids, paths, hashes). */
  mono?: boolean;
}

/** A single label — value row (label left, value right). Generic form of the
 * `Field({k,v})` / description-row helper copied across detail panels. */
export default function KeyValue({ label, value, mono }: KeyValueProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '2px 0' }}>
      <span style={{ color: tokens.textFaint }}>{label}</span>
      <span style={{ fontFamily: mono ? 'ui-monospace, monospace' : undefined, color: tokens.text, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}
