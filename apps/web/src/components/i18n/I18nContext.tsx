import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  dictionaries,
  FoCientCopywriting,
  formatMinutesLocalized,
  idCopywriting,
  SupportedLocale,
} from './copywriting.js';

export interface FoCientI18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  copywriting: FoCientCopywriting;
  formatMinutes: (minutes: number) => string;
  availableLocales: { code: SupportedLocale; label: string }[];
}

const FoCientI18nContext = createContext<FoCientI18nContextValue>({
  locale: 'id',
  setLocale: () => {},
  copywriting: idCopywriting,
  formatMinutes: (minutes) => formatMinutesLocalized(minutes, idCopywriting),
  availableLocales: [
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'en', label: 'English' },
  ],
});

export interface FoCientI18nProviderProps {
  initialLocale?: SupportedLocale;
  locale?: SupportedLocale;
  onLocaleChange?: (locale: SupportedLocale) => void;
  overrides?: Partial<FoCientCopywriting>;
  children: React.ReactNode;
}

export const FoCientI18nProvider: React.FC<FoCientI18nProviderProps> = ({
  initialLocale = 'id',
  locale: controlledLocale,
  onLocaleChange,
  overrides,
  children,
}) => {
  const [internalLocale, setInternalLocale] = useState<SupportedLocale>(initialLocale);
  const activeLocale = controlledLocale ?? internalLocale;

  const handleSetLocale = (newLocale: SupportedLocale) => {
    setInternalLocale(newLocale);
    onLocaleChange?.(newLocale);
  };

  const copywriting = useMemo(() => {
    const base = dictionaries[activeLocale] || idCopywriting;
    if (!overrides) return base;
    return {
      ...base,
      ...overrides,
      actions: { ...base.actions, ...overrides.actions },
      status: { ...base.status, ...overrides.status },
      adaptive: { ...base.adaptive, ...overrides.adaptive },
      capacity: { ...base.capacity, ...overrides.capacity },
      navigation: { ...base.navigation, ...overrides.navigation },
      cards: { ...base.cards, ...overrides.cards },
      forms: { ...base.forms, ...overrides.forms },
      dialogs: { ...base.dialogs, ...overrides.dialogs },
      toasts: { ...base.toasts, ...overrides.toasts },
      keyboard: { ...base.keyboard, ...overrides.keyboard },
    };
  }, [activeLocale, overrides]);

  const value: FoCientI18nContextValue = useMemo(
    () => ({
      locale: activeLocale,
      setLocale: handleSetLocale,
      copywriting,
      formatMinutes: (minutes: number) => formatMinutesLocalized(minutes, copywriting),
      availableLocales: [
        { code: 'id', label: 'Bahasa Indonesia' },
        { code: 'en', label: 'English' },
      ],
    }),
    [activeLocale, copywriting]
  );

  return (
    <FoCientI18nContext.Provider value={value}>
      {children}
    </FoCientI18nContext.Provider>
  );
};

export const useFoCientI18n = (): FoCientI18nContextValue => {
  return useContext(FoCientI18nContext);
};

export const useTranslation = useFoCientI18n;

/**
 * Accessible Language Switcher Pill / Selector
 */
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { locale, setLocale, availableLocales, copywriting } = useFoCientI18n();

  return (
    <div
      className={['focient-lang-switcher', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={copywriting.navigation.switchLanguage}
    >
      {availableLocales.map((loc) => {
        const isActive = loc.code === locale;
        return (
          <button
            key={loc.code}
            type="button"
            className={[
              'focient-lang-btn',
              isActive ? 'focient-lang-btn--active' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => setLocale(loc.code)}
            aria-pressed={isActive}
            aria-label={`${copywriting.navigation.switchLanguage}: ${loc.label}`}
          >
            {loc.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};
