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
