import type { ReactNode } from 'react';

export interface FeatureGridProps {
  /** Target column count on wide viewports (default 3). Always 1 on mobile. */
  columns?: 2 | 3 | 4;
  /** Open cells with whitespace (default), or a contiguous ruled grid. */
  variant?: 'open' | 'ruled';
  /** Usually a list of {@link FeatureCard}, but any nodes are allowed. */
  children: ReactNode;
}

/** Responsive grid that lays out feature cells and collapses on narrow screens. */
export default function FeatureGrid({ columns = 3, variant = 'open', children }: FeatureGridProps) {
  return (
    <div className={`sg-feature-grid sg-feature-grid--${columns} sg-feature-grid--${variant}`}>
      {children}
    </div>
  );
}
