import { useState, useEffect, useRef } from 'react';
import './AlertsButton.scss';

export interface Alert {
  id: string;
  severity: string;
  message: string;
  source: string;
  device: string;
  timestamp: string;
}

export interface AlertsButtonProps {
  getAlertCount: () => Promise<{ count: number }>;
  getAlerts: () => Promise<Alert[]>;
  clearAlert: (id: string) => Promise<void>;
  pollIntervalMs?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export default function AlertsButton({
  getAlertCount,
  getAlerts,
  clearAlert,
  pollIntervalMs = 30000,
  onOpen,
  onClose,
}: AlertsButtonProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    pollAlerts();
    pollRef.current = setInterval(pollAlerts, pollIntervalMs);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pollIntervalMs]);

  function pollAlerts() {
    getAlertCount().then(res => setAlertCount(res.count || 0)).catch(() => {});
  }

  function loadAlerts() {
    getAlerts().then(setAlerts).catch(() => {});
  }

  function toggle() {
    const next = !showAlerts;
    if (next) {
      loadAlerts();
      onOpen?.();
    } else {
      onClose?.();
    }
    setShowAlerts(next);
  }

  function dismiss(id: string) {
    clearAlert(id).then(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
      setAlertCount(prev => Math.max(0, prev - 1));
    }).catch(() => {});
  }

  return (
    <>
      <button
        className={`sg-icon-btn sg-alerts-btn${alertCount > 0 ? ' has-alerts' : ''}`}
        onClick={toggle}
        title="Alerts"
      >
        <span className="sg-bell-icon">{'\u{1F514}'}</span>
        {alertCount > 0 && <span className="sg-alert-badge">{alertCount}</span>}
      </button>

      {showAlerts && (
        <div className="sg-alerts-panel">
          <div className="sg-alerts-header">
            <h3>Alerts</h3>
            <button className="btn secondary" onClick={() => { setShowAlerts(false); onClose?.(); }}>Close</button>
          </div>
          <div className="sg-alerts-list">
            {alerts.length === 0 && <div className="empty-state">No active alerts.</div>}
            {alerts.map(alert => (
              <div key={alert.id} className={`sg-alert-item ${alert.severity}`}>
                <div className="sg-alert-severity">{alert.severity}</div>
                <div className="sg-alert-body">
                  <div className="sg-alert-message">{alert.message}</div>
                  <div className="sg-alert-meta">{alert.source} / {alert.device} / {alert.timestamp}</div>
                </div>
                <button className="btn secondary" onClick={() => dismiss(alert.id)}>Dismiss</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
