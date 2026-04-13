// Styles (exported as dist/style.css)
import './lib/styles/base.scss';
import './lib/components/AppShell/AppShell.scss';
import './lib/components/Panel/Panel.scss';
import './lib/components/LoginPage/LoginPage.scss';
import './lib/components/AlertsButton/AlertsButton.scss';
import './lib/components/UserDropdown/UserDropdown.scss';

// Components
export { default as AppShell } from './lib/components/AppShell/AppShell';
export type { NavItem, AppShellProps } from './lib/components/AppShell/AppShell';
export { default as Badge } from './lib/components/Badge/Badge';
export type { BadgeProps, BadgeVariant } from './lib/components/Badge/Badge';
export { default as ConfirmDialog } from './lib/components/ConfirmDialog/ConfirmDialog';
export { default as Panel } from './lib/components/Panel/Panel';
export type { PanelProps } from './lib/components/Panel/Panel';
export { default as Spinner } from './lib/components/Spinner/Spinner';
export { default as Toast } from './lib/components/Toast/Toast';
export { default as LoginPage } from './lib/components/LoginPage/LoginPage';
export type { LoginPageProps } from './lib/components/LoginPage/LoginPage';
export { default as AlertsButton } from './lib/components/AlertsButton/AlertsButton';
export type { AlertsButtonProps, Alert } from './lib/components/AlertsButton/AlertsButton';
export { default as UserDropdown } from './lib/components/UserDropdown/UserDropdown';
export type { UserDropdownProps, UserMenuItem, UserMenuDivider, UserMenuEntry } from './lib/components/UserDropdown/UserDropdown';

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

// Design tokens (for inline styles)
export { tokens } from './lib/tokens';
export type { Tokens } from './lib/tokens';
