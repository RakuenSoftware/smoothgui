import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export const englishTranslations = {
  'appShell.toggleSidebar': 'Toggle sidebar',
  'alerts.title': 'Alerts',
  'alerts.close': 'Close',
  'alerts.empty': 'No active alerts.',
  'alerts.dismiss': 'Dismiss',
  'alerts.buttonTitle': 'Alerts',
  'confirm.title': 'Confirm',
  'confirm.message': 'Are you sure?',
  'confirm.confirm': 'Confirm',
  'confirm.cancel': 'Cancel',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.failed': 'Login failed',
  'login.signingIn': 'Signing in...',
  'login.signIn': 'Sign In',
  'toast.close': 'Close notification',
  'userDropdown.account': 'Account',
  'userDropdown.signedInAs': 'Signed in as',
} as const;

// Dutch (nl) translations of every key in englishTranslations.
// Consumers shipping a Dutch UI can spread this into their nl
// catalog instead of overriding chrome strings per-app.
//
// Adding a new chrome key to englishTranslations must add the
// corresponding key here. The TS shape (Record<SmoothGuiTranslationKey, string>)
// enforces parity at build time.
export const dutchTranslations: Record<SmoothGuiTranslationKey, string> = {
  'appShell.toggleSidebar': 'Zijbalk wisselen',
  'alerts.title': 'Meldingen',
  'alerts.close': 'Sluiten',
  'alerts.empty': 'Geen actieve meldingen.',
  'alerts.dismiss': 'Negeren',
  'alerts.buttonTitle': 'Meldingen',
  'confirm.title': 'Bevestigen',
  'confirm.message': 'Weet u het zeker?',
  'confirm.confirm': 'Bevestigen',
  'confirm.cancel': 'Annuleren',
  'login.username': 'Gebruikersnaam',
  'login.password': 'Wachtwoord',
  'login.failed': 'Aanmelden mislukt',
  'login.signingIn': 'Aanmelden...',
  'login.signIn': 'Aanmelden',
  'toast.close': 'Melding sluiten',
  'userDropdown.account': 'Account',
  'userDropdown.signedInAs': 'Aangemeld als',
};

export type SmoothGuiTranslationKey = keyof typeof englishTranslations;
export type TranslationKey = SmoothGuiTranslationKey | (string & {});
export type TranslationValues = Record<string, string | number>;
export type LanguageTranslations = Partial<Record<SmoothGuiTranslationKey, string>> & Record<string, string | undefined>;
export type TranslationCatalog = Record<string, LanguageTranslations>;

export interface I18nContextValue {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: TranslationKey, values?: TranslationValues, fallback?: string) => string;
}

export interface I18nProviderProps {
  children: ReactNode;
  language?: string;
  defaultLanguage?: string;
  translations?: TranslationCatalog;
  onLanguageChange?: (language: string) => void;
}

const FALLBACK_LANGUAGE = 'en';

const defaultContext: I18nContextValue = {
  language: FALLBACK_LANGUAGE,
  setLanguage: () => {},
  t: (key, values, fallback) => interpolate(fallback ?? getEnglishTranslation(key) ?? key, values),
};

const I18nContext = createContext<I18nContextValue>(defaultContext);

function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

function getEnglishTranslation(key: TranslationKey): string | undefined {
  return Object.prototype.hasOwnProperty.call(englishTranslations, key)
    ? englishTranslations[key as SmoothGuiTranslationKey]
    : undefined;
}

export function I18nProvider({
  children,
  language,
  defaultLanguage = FALLBACK_LANGUAGE,
  translations,
  onLanguageChange,
}: I18nProviderProps) {
  const [internalLanguage, setInternalLanguage] = useState(defaultLanguage);
  const activeLanguage = language ?? internalLanguage;

  const catalog = useMemo(() => {
    const merged: TranslationCatalog = {
      [FALLBACK_LANGUAGE]: { ...englishTranslations },
    };

    for (const [lang, langTranslations] of Object.entries(translations ?? {})) {
      merged[lang] = {
        ...(merged[lang] ?? {}),
        ...langTranslations,
      };
    }

    return merged;
  }, [translations]);

  const value = useMemo<I18nContextValue>(() => ({
    language: activeLanguage,
    setLanguage(nextLanguage) {
      if (language === undefined) {
        setInternalLanguage(nextLanguage);
      }
      onLanguageChange?.(nextLanguage);
    },
    t(key, values, fallback) {
      const template =
        catalog[activeLanguage]?.[key] ??
        catalog[defaultLanguage]?.[key] ??
        catalog[FALLBACK_LANGUAGE]?.[key] ??
        fallback ??
        key;
      return interpolate(template, values);
    },
  }), [activeLanguage, catalog, defaultLanguage, language, onLanguageChange]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
