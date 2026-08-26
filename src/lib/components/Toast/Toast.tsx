import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/ToastContext';

export default function Toast() {
  const { toasts, dismiss } = useToast();
  const { t } = useI18n();

  if (toasts.length === 0) return null;

  const icon = (type: string) => {
    if (type === 'success') return '✓';
    if (type === 'error') return '✗';
    if (type === 'warning') return '⚠';
    return 'ℹ';
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`} onClick={() => dismiss(toast.id)}>
          <span className="toast-icon">{icon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            aria-label={t('toast.close')}
            onClick={e => { e.stopPropagation(); dismiss(toast.id); }}
          >
            &times;
          </button>
        </div>
      ))}
      <style>{`
        .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column-reverse; gap: 8px; max-width: 400px; }
        .toast { display: flex; align-items: center; gap: 10px; padding: 13px 15px; border: 1px solid var(--sg-border); border-left-width: 3px; border-radius: var(--sg-radius-sm); background: var(--sg-surface); color: var(--sg-text); font-size: 13px; box-shadow: var(--sg-shadow-float); cursor: pointer; animation: toastIn 0.22s ease-out; }
        .toast.success { border-left-color: var(--sg-success); }
        .toast.error { border-left-color: var(--sg-danger); }
        .toast.warning { border-left-color: var(--sg-warning); }
        .toast.info { border-left-color: var(--sg-info); }
        .toast-icon { color: var(--sg-text-secondary); font-size: 14px; flex-shrink: 0; }
        .toast-message { flex: 1; }
        .toast-close { background: none; border: none; color: var(--sg-text-hint); font-size: 18px; cursor: pointer; padding: 0 4px; }
        .toast-close:hover { color: var(--sg-text); }
        @keyframes toastIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
      `}</style>
    </div>
  );
}
