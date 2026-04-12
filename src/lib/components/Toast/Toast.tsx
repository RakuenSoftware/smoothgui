import { useToast } from '../../contexts/ToastContext';

export default function Toast() {
  const { toasts, dismiss } = useToast();

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
          <button className="toast-close" onClick={e => { e.stopPropagation(); dismiss(toast.id); }}>&times;</button>
        </div>
      ))}
      <style>{`
        .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column-reverse; gap: 8px; max-width: 400px; }
        .toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; color: #fff; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; animation: toastIn 0.3s ease; }
        .toast.success { background: #43a047; }
        .toast.error { background: #e53935; }
        .toast.warning { background: #fb8c00; }
        .toast.info { background: #1e88e5; }
        .toast-icon { font-size: 18px; flex-shrink: 0; }
        .toast-message { flex: 1; }
        .toast-close { background: none; border: none; color: rgba(255,255,255,0.7); font-size: 18px; cursor: pointer; padding: 0 4px; }
        .toast-close:hover { color: #fff; }
        @keyframes toastIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
