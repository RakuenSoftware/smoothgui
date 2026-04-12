import { ReactNode } from 'react';
import './Panel.scss';

export interface PanelProps {
  title: string;
  /** Optional count shown as a muted tag next to the title */
  count?: number;
  children?: ReactNode;
}

export default function Panel({ title, count, children }: PanelProps) {
  return (
    <div className="sg-panel">
      <div className="sg-panel-header">
        <span className="sg-panel-title">{title}</span>
        {count !== undefined && (
          <span className="sg-panel-count">({count})</span>
        )}
      </div>
      <div className="sg-panel-body">
        {children}
      </div>
    </div>
  );
}
