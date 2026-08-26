export type BadgeVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'running'
  | 'info'
  | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return <span className={`sg-badge sg-badge--${variant}`}>{label}</span>;
}
