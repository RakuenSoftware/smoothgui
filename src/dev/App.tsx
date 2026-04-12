import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from '../lib/contexts/ToastContext';
import { AuthProvider } from '../lib/contexts/AuthContext';
import Toast from '../lib/components/Toast/Toast';
import AppShell from '../lib/components/AppShell/AppShell';
import ConfirmDialog from '../lib/components/ConfirmDialog/ConfirmDialog';
import Spinner from '../lib/components/Spinner/Spinner';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Overview', icon: '■', route: '/overview', section: 'Main' },
  { label: 'Settings', icon: '⚙', route: '/settings', section: 'Main' },
];

function DemoPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <h1>SmoothGui Dev</h1>
        <p className="subtitle">Component showcase</p>
      </div>
      <div className="cards">
        <div className="card">
          <div className="card-label">Status</div>
          <div className="card-value healthy">Healthy</div>
          <div className="card-detail">All systems operational</div>
        </div>
        <div className="card">
          <div className="card-label">Warnings</div>
          <div className="card-value degraded">2</div>
          <div className="card-detail">Attention needed</div>
        </div>
      </div>
      <div className="section">
        <h2>Components</h2>
        <div className="form-row">
          <button className="btn primary" onClick={() => setShowDialog(true)}>Open Dialog</button>
          <button className="btn secondary" onClick={() => setLoading(v => !v)}>Toggle Spinner</button>
        </div>
        <Spinner loading={loading} text="Loading data..." />
        <ConfirmDialog
          visible={showDialog}
          title="Demo Dialog"
          message="This is a demo confirm dialog."
          onConfirm={() => setShowDialog(false)}
          onCancel={() => setShowDialog(false)}
        />
      </div>
    </div>
  );
}

function Shell() {
  return (
    <AppShell appName="SmoothGui" appNameShort="SG" navItems={NAV_ITEMS}>
      <Outlet />
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider
        storagePrefix="dev"
        onLogin={async () => {}}
        onLogout={async () => {}}
      >
        <ToastProvider>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<DemoPage />} />
              <Route path="/settings" element={<DemoPage />} />
            </Route>
          </Routes>
          <Toast />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
