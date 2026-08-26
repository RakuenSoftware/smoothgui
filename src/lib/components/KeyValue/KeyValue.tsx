import type { ReactNode } from 'react';

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
    <div className="sg-key-value">
      <span className="sg-key-value__label">{label}</span>
      <span className={`sg-key-value__value${mono ? ' sg-key-value__value--mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
