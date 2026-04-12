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

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: '#e8f5e9', color: '#2e7d32' },
  error:   { background: '#ffebee', color: '#c62828' },
  warning: { background: '#fff3e0', color: '#e65100' },
  running: { background: '#e3f2fd', color: '#1565c0' },
  info:    { background: '#e3f2fd', color: '#1565c0' },
  neutral: { background: '#f5f5f5', color: '#555' },
};

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: 600,
        ...VARIANT_STYLES[variant],
      }}
    >
      {label}
    </span>
  );
}
