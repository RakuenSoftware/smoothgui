import type { ReactNode } from 'react';
import { tokens } from '../../tokens';

export type StatusDotStatus = 'ok' | 'warn' | 'down' | 'idle';

export interface StatusDotProps {
  /** Semantic state; ignored when an explicit `color` is given. */
  status?: StatusDotStatus;
  /** Explicit dot color, overriding `status`. */
  color?: string;
  /** Optional text label after the dot. */
  label?: ReactNode;
}

const STATUS_COLOR: Record<StatusDotStatus, string> = {
  ok: tokens.success,
  warn: tokens.warning,
  down: tokens.danger,
  idle: tokens.textPale,
};

/** A small colored dot (+ optional label) signalling health/liveness. Generic
 * form of the several inline "● active" / availability dots. */
export default function StatusDot({ status = 'idle', color, label }: StatusDotProps) {
  const dot = color ?? STATUS_COLOR[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: tokens.textSecondary }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}
