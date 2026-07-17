import { tokens } from '../../tokens';

export type InlineStatusKind = 'ok' | 'err' | 'info';

export interface InlineStatusMessage {
  kind: InlineStatusKind;
  msg: string;
}

export interface InlineStatusProps {
  /** The status to render; `null`/`undefined` renders nothing. */
  status?: InlineStatusMessage | null;
  /** Overrides the default per-kind color. */
  color?: string;
}

const COLORS: Record<InlineStatusKind, string> = {
  ok: tokens.successDark,
  err: tokens.dangerDark,
  info: tokens.textSecondary,
};

/** A persistent inline status line for form/action feedback (the red/green
 * "saved" / "failed" text duplicated across mutating pages). Distinct from the
 * transient Toast: this stays put next to the control it reports on. */
export default function InlineStatus({ status, color }: InlineStatusProps) {
  if (!status || !status.msg) return null;
  return <span style={{ fontSize: 12, color: color ?? COLORS[status.kind] }}>{status.msg}</span>;
}
