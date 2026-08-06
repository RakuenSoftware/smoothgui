// Styles (exported as dist/style.css)
import './lib/styles/base.scss';
import './lib/components/AppShell/AppShell.scss';
import './lib/components/Panel/Panel.scss';
import './lib/components/LoginPage/LoginPage.scss';
import './lib/components/AlertsButton/AlertsButton.scss';
import './lib/components/UserDropdown/UserDropdown.scss';
import './lib/installer/installer.scss';
import './lib/components/SiteHeader/SiteHeader.scss';
import './lib/components/SiteFooter/SiteFooter.scss';
import './lib/components/Hero/Hero.scss';
import './lib/components/Section/Section.scss';
import './lib/components/FeatureGrid/FeatureGrid.scss';
import './lib/components/Card/Card.scss';
import './lib/components/Prose/Prose.scss';
import './lib/components/ArticleCard/ArticleCard.scss';
import './lib/components/CodeBlock/CodeBlock.scss';
import './lib/components/CallToAction/CallToAction.scss';
import './lib/components/DataFigure/DataFigure.scss';
import './lib/components/ThemeToggle/ThemeToggle.scss';

// Components
export { default as AppShell } from './lib/components/AppShell/AppShell';
export type { NavItem, AppShellProps } from './lib/components/AppShell/AppShell';
export { default as DataFigure } from './lib/components/DataFigure/DataFigure';
export type { DataFigureProps } from './lib/components/DataFigure/DataFigure';
export { default as Badge } from './lib/components/Badge/Badge';
export type { BadgeProps, BadgeVariant } from './lib/components/Badge/Badge';
export { default as ConfirmDialog } from './lib/components/ConfirmDialog/ConfirmDialog';
export type { ConfirmDialogProps } from './lib/components/ConfirmDialog/ConfirmDialog';
export { default as Panel } from './lib/components/Panel/Panel';
export type { PanelProps } from './lib/components/Panel/Panel';
export { default as Tabs } from './lib/components/Tabs/Tabs';
export type { TabsProps, TabOption } from './lib/components/Tabs/Tabs';
export { default as Drawer } from './lib/components/Drawer/Drawer';
export type { DrawerProps } from './lib/components/Drawer/Drawer';
export { default as Picker } from './lib/components/Picker/Picker';
export type { PickerProps, PickerOption } from './lib/components/Picker/Picker';
export { default as SettingsMenu } from './lib/components/SettingsMenu/SettingsMenu';
export type { SettingField, SettingsMenuProps } from './lib/components/SettingsMenu/SettingsMenu';
export { default as Spinner } from './lib/components/Spinner/Spinner';
export { default as Toast } from './lib/components/Toast/Toast';
export { default as LoginPage } from './lib/components/LoginPage/LoginPage';
export type { LoginPageProps } from './lib/components/LoginPage/LoginPage';
export { default as ForcedPasswordChange } from './lib/components/ForcedPasswordChange/ForcedPasswordChange';
export type { ForcedPasswordChangeProps } from './lib/components/ForcedPasswordChange/ForcedPasswordChange';
export { default as AlertsButton } from './lib/components/AlertsButton/AlertsButton';
export type { AlertsButtonProps, Alert } from './lib/components/AlertsButton/AlertsButton';
export { default as UserDropdown } from './lib/components/UserDropdown/UserDropdown';
export type { UserDropdownProps, UserMenuItem, UserMenuDivider, UserMenuEntry } from './lib/components/UserDropdown/UserDropdown';

// Contexts
export { AuthProvider, useAuth } from './lib/contexts/AuthContext';
export type { AuthContextValue, LoginResult } from './lib/contexts/AuthContext';
export { I18nProvider, useI18n, englishTranslations, dutchTranslations } from './lib/contexts/I18nContext';
export type {
  I18nContextValue,
  I18nProviderProps,
  LanguageTranslations,
  SmoothGuiTranslationKey,
  TranslationCatalog,
  TranslationKey,
  TranslationValues,
} from './lib/contexts/I18nContext';
export { ToastProvider, useToast } from './lib/contexts/ToastContext';
export type { Toast as ToastItem } from './lib/contexts/ToastContext';

// Utils
export { extractError, useExtractError } from './lib/utils/errors';
export { pollJob } from './lib/utils/poll';
export type { GetJobStatus } from './lib/utils/poll';

// API
export { apiFetch, apiFetchForm } from './lib/api/fetch';
export { ApiError, isApiError } from './lib/api/error';

// Design tokens (for inline styles)
export { tokens } from './lib/tokens';
export type { Tokens } from './lib/tokens';

export type {
  InstallerRequest,
  InstallerRequestKind,
  InstallerOption,
  InstallerRequestPayload,
  InstallerResponse,
} from './lib/installer/types';
export type { InstallerSessionConfig, InstallerSessionState } from './lib/installer/useInstallerSession';
export { useInstallerSession } from './lib/installer/useInstallerSession';
export { default as InstallerRequestRenderer } from './lib/installer/RequestRenderer';
export { default as InstallerFrontend } from './lib/installer/InstallerFrontend';

// ── Generic primitives extracted from the aimee webchat (v0.7.0) ─────────────
export { default as Button } from './lib/components/Button/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './lib/components/Button/Button';
export { default as InlineStatus } from './lib/components/InlineStatus/InlineStatus';
export type { InlineStatusProps, InlineStatusKind, InlineStatusMessage } from './lib/components/InlineStatus/InlineStatus';
export { default as EmptyState } from './lib/components/EmptyState/EmptyState';
export type { EmptyStateProps } from './lib/components/EmptyState/EmptyState';
export { default as Field } from './lib/components/Field/Field';
export type { FieldProps } from './lib/components/Field/Field';
export { default as KeyValue } from './lib/components/KeyValue/KeyValue';
export type { KeyValueProps } from './lib/components/KeyValue/KeyValue';
export { default as StatusDot } from './lib/components/StatusDot/StatusDot';
export type { StatusDotProps, StatusDotStatus } from './lib/components/StatusDot/StatusDot';
export { default as Switch } from './lib/components/Switch/Switch';
export type { SwitchProps } from './lib/components/Switch/Switch';
export { default as PageHeader } from './lib/components/PageHeader/PageHeader';
export type { PageHeaderProps } from './lib/components/PageHeader/PageHeader';
export { default as ChipSelect } from './lib/components/ChipSelect/ChipSelect';
export type { ChipSelectProps } from './lib/components/ChipSelect/ChipSelect';
export { default as Disclosure } from './lib/components/Disclosure/Disclosure';
export type { DisclosureProps } from './lib/components/Disclosure/Disclosure';
export { default as DiffViewer } from './lib/components/DiffViewer/DiffViewer';
export type { DiffViewerProps } from './lib/components/DiffViewer/DiffViewer';
export { default as TypingIndicator } from './lib/components/TypingIndicator/TypingIndicator';
export type { TypingIndicatorProps } from './lib/components/TypingIndicator/TypingIndicator';
export { default as AutoGrowTextarea } from './lib/components/AutoGrowTextarea/AutoGrowTextarea';
export type { AutoGrowTextareaProps } from './lib/components/AutoGrowTextarea/AutoGrowTextarea';
export { default as Modal } from './lib/components/Modal/Modal';
export type { ModalProps, ModalSize } from './lib/components/Modal/Modal';
export { default as DataTable } from './lib/components/DataTable/DataTable';
export type { DataTableProps, Column } from './lib/components/DataTable/DataTable';
export { default as ErrorBoundary } from './lib/components/ErrorBoundary/ErrorBoundary';
export type { ErrorBoundaryProps } from './lib/components/ErrorBoundary/ErrorBoundary';
export { default as CoachMark } from './lib/components/CoachMark/CoachMark';
export type { CoachMarkProps, CoachContent } from './lib/components/CoachMark/CoachMark';
export { useSeenState, parseSeen, withSeen } from './lib/components/CoachMark/useSeenState';
export type { SeenState } from './lib/components/CoachMark/useSeenState';
export { default as Wizard } from './lib/components/Wizard/Wizard';
export type { WizardProps, WizardStep, WizardStepControls, WizardSummaryControls } from './lib/components/Wizard/Wizard';

// ── Site and long-form content primitives (v0.9.0) ───────────────────────────
// Public, content-led pages: marketing, docs, changelogs, blogs. These pair with
// the console primitives above rather than replacing them.
export type { LinkComponent, LinkRenderProps } from './lib/components/linkTypes';
export { default as SiteHeader } from './lib/components/SiteHeader/SiteHeader';
export type { SiteHeaderProps, SiteNavItem } from './lib/components/SiteHeader/SiteHeader';
export { default as SiteFooter } from './lib/components/SiteFooter/SiteFooter';
export type { SiteFooterProps, SiteFooterGroup, SiteFooterLink } from './lib/components/SiteFooter/SiteFooter';
export { default as Hero } from './lib/components/Hero/Hero';
export type { HeroProps, HeroTone } from './lib/components/Hero/Hero';
export { default as Section } from './lib/components/Section/Section';
export type { SectionProps, SectionTone, SectionWidth } from './lib/components/Section/Section';
export { default as FeatureGrid } from './lib/components/FeatureGrid/FeatureGrid';
export type { FeatureGridProps } from './lib/components/FeatureGrid/FeatureGrid';
export { default as FeatureCard } from './lib/components/FeatureGrid/FeatureCard';
export type { FeatureCardProps } from './lib/components/FeatureGrid/FeatureCard';
export { default as Card } from './lib/components/Card/Card';
export type { CardProps } from './lib/components/Card/Card';
export { default as Prose } from './lib/components/Prose/Prose';
export type { ProseProps } from './lib/components/Prose/Prose';
export { default as ArticleCard } from './lib/components/ArticleCard/ArticleCard';
export type { ArticleCardProps } from './lib/components/ArticleCard/ArticleCard';
export { default as CodeBlock } from './lib/components/CodeBlock/CodeBlock';
export type { CodeBlockProps } from './lib/components/CodeBlock/CodeBlock';
export { default as CallToAction } from './lib/components/CallToAction/CallToAction';
export type { CallToActionProps, CallToActionTone } from './lib/components/CallToAction/CallToAction';
export { default as ThemeToggle } from './lib/components/ThemeToggle/ThemeToggle';
export type { ThemeToggleProps } from './lib/components/ThemeToggle/ThemeToggle';

// Theming
export {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  activeTheme,
  applyTheme,
  clearStoredTheme,
  storeTheme,
  storedTheme,
  systemTheme,
  themePreloadScript,
} from './lib/theme';
export type { Theme } from './lib/theme';
