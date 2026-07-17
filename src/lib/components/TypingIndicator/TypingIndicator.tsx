import { tokens } from '../../tokens';

export interface TypingIndicatorProps {
  /** Text after the dots (default "Working"). */
  label?: string;
  /** Dot + text color (default tokens.primary). */
  color?: string;
}

/** Three pulsing dots + a label — the "agent is working" affordance, distinct
 * from the blocking Spinner. Self-contained keyframes. */
export default function TypingIndicator({ label = 'Working', color = tokens.primary }: TypingIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', color, fontSize: 13 }}>
      <span style={{ display: 'inline-flex', gap: 4 }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: color,
              animation: `sg-typing-pulse 1.4s ${delay}s infinite ease-in-out`,
            }}
          />
        ))}
      </span>
      {label}
      <style>{`@keyframes sg-typing-pulse {
        0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
        40% { opacity: 1; transform: scale(1); }
      }`}</style>
    </div>
  );
}
