interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible, title = 'Confirm', message = 'Are you sure?',
  confirmText = 'Confirm', confirmClass = 'btn danger',
  onConfirm, onCancel,
}: Props) {
  if (!visible) return null;
  return (
    <div className="cd-overlay" onClick={onCancel}>
      <div className="cd-dialog" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="cd-actions">
          <button className="btn secondary" onClick={onCancel}>Cancel</button>
          <button className={confirmClass} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
      <style>{`
        .cd-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .cd-dialog {
          background: #fff; border-radius: 12px; padding: 24px;
          min-width: 360px; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .cd-dialog h3 { margin: 0 0 8px; font-size: 18px; }
        .cd-dialog p { margin: 0 0 20px; color: #666; font-size: 14px; line-height: 1.5; }
        .cd-actions { display: flex; justify-content: flex-end; gap: 8px; }
      `}</style>
    </div>
  );
}
