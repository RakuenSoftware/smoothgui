import { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { useExtractError } from '../../utils/errors';
// Reuses the login card styling (.sg-login-*) imported globally via index.ts.

export interface ForcedPasswordChangeProps {
  appName: string;
  /** Performs the actual password change against the product's API. */
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  /** Called once the password has been changed successfully. */
  onComplete: () => void;
}

/**
 * Full-screen, blocking password-change form shown when an authenticated
 * session is flagged must-change (admin-forced expiry on first login). The
 * user cannot reach the rest of the app until the change succeeds.
 */
export default function ForcedPasswordChange({
  appName,
  onChangePassword,
  onComplete,
}: ForcedPasswordChangeProps) {
  const { t } = useI18n();
  const extractError = useExtractError();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (next.length < 8) {
      setError(t('passwordChange.tooShort'));
      return;
    }
    if (next !== confirm) {
      setError(t('passwordChange.mismatch'));
      return;
    }
    setLoading(true);
    try {
      await onChangePassword(current, next);
      onComplete();
    } catch (err) {
      setError(extractError(err, t('passwordChange.failed')));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sg-login-container">
      <div className="sg-login-card">
        <h1>{appName}</h1>
        <p className="sg-login-subtitle">{t('passwordChange.subtitle')}</p>
        <form onSubmit={onSubmit}>
          <div className="sg-login-field">
            <label htmlFor="sg-current-password">{t('passwordChange.current')}</label>
            <input
              id="sg-current-password"
              type="password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
              autoFocus
            />
          </div>
          <div className="sg-login-field">
            <label htmlFor="sg-new-password">{t('passwordChange.new')}</label>
            <input
              id="sg-new-password"
              type="password"
              value={next}
              onChange={e => setNext(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="sg-login-field">
            <label htmlFor="sg-confirm-password">{t('passwordChange.confirm')}</label>
            <input
              id="sg-confirm-password"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {error && <div className="sg-login-error">{error}</div>}
          <button type="submit" disabled={loading || !current || !next || !confirm}>
            {loading ? t('passwordChange.submitting') : t('passwordChange.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
