import { useI18n } from '../../contexts/I18nContext';

export interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible, title, message,
  confirmText, confirmClass = 'btn danger',
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  const { t } = useI18n();

  if (!visible) return null;
  return (
    <div className="cd-overlay" onClick={onCancel}>
      <div className="cd-dialog" onClick={e => e.stopPropagation()}>
        <h3>{title ?? t('confirm.title')}</h3>
        <p>{message ?? t('confirm.message')}</p>
        <div className="cd-actions">
          <button className="btn secondary" onClick={onCancel}>{t('confirm.cancel')}</button>
          <button className={confirmClass} onClick={onConfirm}>{confirmText ?? t('confirm.confirm')}</button>
        </div>
      </div>
      <style>{`
        .cd-overlay {
          position: fixed; inset: 0; background: rgba(24,22,17,0.58);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 20px;
        }
        .cd-dialog {
          background: var(--sg-surface); color: var(--sg-text); border: 1px solid var(--sg-border-medium);
          border-top: 3px solid var(--sg-danger); border-radius: var(--sg-radius-md); padding: 24px;
          width: min(440px, 100%); box-shadow: var(--sg-shadow-float);
        }
        .cd-dialog h3 { margin: 0 0 8px; font-family: var(--sg-font-display); font-size: 21px; font-weight: 600; }
        .cd-dialog p { margin: 0 0 24px; color: var(--sg-text-secondary); font-size: 14px; line-height: 1.55; }
        .cd-actions { display: flex; justify-content: flex-end; gap: 8px; }
      `}</style>
    </div>
  );
}
