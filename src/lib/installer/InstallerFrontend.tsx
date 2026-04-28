import { useInstallerSession } from './useInstallerSession';
import RequestRenderer from './RequestRenderer';
import type { InstallerRequest, InstallerResponse, InstallerStatus } from './types';
import './installer.scss';

export interface InstallerFrontendProps {
  requestUrl: string;
  responseUrl?: string;
  statusUrl?: string;
  pollMs?: number;
}

function StatusPanel({ status }: { status: InstallerStatus }) {
  let percent: number | null = null;
  if (typeof status.percent === 'number' && Number.isFinite(status.percent)) {
    percent = Math.max(0, Math.min(100, status.percent));
  } else if (
    typeof status.current === 'number' &&
    typeof status.total === 'number' &&
    status.total > 0
  ) {
    percent = Math.max(0, Math.min(100, (status.current / status.total) * 100));
  }

  return (
    <section className="sg-installer-shell-status">
      {status.title ? <h2>{status.title}</h2> : null}
      {status.message ? <p>{status.message}</p> : null}
      {percent !== null ? (
        <div
          className="sg-installer-shell-status-bar"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="sg-installer-shell-status-bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}
      {status.detail ? (
        <p className="sg-installer-shell-status-detail">{status.detail}</p>
      ) : null}
    </section>
  );
}

export default function InstallerFrontend({
  requestUrl,
  responseUrl,
  statusUrl,
  pollMs,
}: InstallerFrontendProps) {
  const { request, status, submitting, error, submit } = useInstallerSession({
    requestUrl,
    responseUrl,
    statusUrl,
    pollMs,
  });

  const requestTitle = 'Smooth Installer';

  const handleSubmit = async (value: InstallerResponse) => {
    await submit(value);
  };

  const activeRequest: InstallerRequest | null = request;
  const showStatus = !activeRequest && status !== null;
  const showIdleHint = !activeRequest && !status && !error;

  return (
    <div className="sg-installer-shell">
      <header className="sg-installer-shell-header">
        <h1>{requestTitle}</h1>
      </header>

      {activeRequest ? (
        <RequestRenderer
          request={activeRequest}
          onSubmit={handleSubmit}
          disabled={submitting}
        />
      ) : showStatus ? (
        <StatusPanel status={status!} />
      ) : (
        <div className="sg-installer-shell-idle">
          <p>Waiting for the install process to send a prompt.</p>
          {error ? <p className="sg-installer-shell-error">Error: {error}</p> : null}
        </div>
      )}

      {showIdleHint ? (
        <p className="sg-installer-shell-hint">
          The installer backend has not written a request yet.
        </p>
      ) : null}
    </div>
  );
}
