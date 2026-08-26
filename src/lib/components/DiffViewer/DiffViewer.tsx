import { useMemo } from 'react';
import { tokens } from '../../tokens';

export interface DiffViewerProps {
  /** A unified diff (git-style) as a single string. */
  diff: string;
  /** Cap the height and scroll (default 300px). */
  maxHeight?: number;
}

// GitHub-dark diff palette; deliberately fixed (a diff reads best on a dark
// gutter regardless of the surrounding theme).
const ADD = '#4ec94e';
const DEL = '#f87171';
const HUNK = '#60a5fa';
const CTX = '#ccc';

function lineColor(line: string): string {
  if (line.startsWith('+') && !line.startsWith('+++')) return ADD;
  if (line.startsWith('-') && !line.startsWith('---')) return DEL;
  if (line.startsWith('@@')) return HUNK;
  return CTX;
}

/** Colorizes a unified diff, one row per line. Zero app coupling. */
export default function DiffViewer({ diff, maxHeight = 300 }: DiffViewerProps) {
  const lines = useMemo(() => diff.split('\n'), [diff]);
  return (
    <pre
      style={{
        margin: 0,
        padding: '8px 10px',
        background: '#1d1e1b',
        borderRadius: tokens.radiusSm,
        fontSize: 11,
        fontFamily: tokens.fontMono,
        lineHeight: 1.4,
        overflow: 'auto',
        maxHeight,
      }}
    >
      {lines.map((line, i) => (
        <span key={i} style={{ color: lineColor(line), display: 'block' }}>
          {line}
        </span>
      ))}
    </pre>
  );
}
