// Styles (exported as dist/style.css)
import './lib/styles/base.scss';
import './lib/components/AppShell/AppShell.scss';

// Components
export { default as AppShell } from './lib/components/AppShell/AppShell';
export type { NavItem, AppShellProps } from './lib/components/AppShell/AppShell';
export { default as ConfirmDialog } from './lib/components/ConfirmDialog/ConfirmDialog';
export { default as Spinner } from './lib/components/Spinner/Spinner';
export { default as Toast } from './lib/components/Toast/Toast';

// Contexts
export { AuthProvider, useAuth } from './lib/contexts/AuthContext';
export type { AuthContextValue } from './lib/contexts/AuthContext';
export { ToastProvider, useToast } from './lib/contexts/ToastContext';
export type { Toast as ToastItem } from './lib/contexts/ToastContext';

// Utils
export { extractError } from './lib/utils/errors';
export { pollJob } from './lib/utils/poll';
export type { GetJobStatus } from './lib/utils/poll';

// API
export { apiFetch, apiFetchForm } from './lib/api/fetch';
