'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt';

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

export const supportedLocales: LocaleInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

type TranslationMap = Record<string, Record<string, string>>;

const translations: Record<Locale, TranslationMap> = {
  en: en as TranslationMap,
  es: es as TranslationMap,
  fr: fr as TranslationMap,
  de: de as TranslationMap,
  pt: pt as TranslationMap,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

function getTranslation(locale: Locale, key: string): string {
  const [section, ...rest] = key.split('.');
  const translationKey = rest.join('.');
  const sectionData = translations[locale]?.[section];
  if (sectionData && translationKey in sectionData) {
    return sectionData[translationKey];
  }
  // Fallback to English
  const enSection = translations.en?.[section];
  if (enSection && translationKey in enSection) {
    return enSection[translationKey];
  }
  return key;
}

const LOCALE_STORAGE_KEY = 'cardcrafter_locale';

function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && saved in translations) return saved as Locale;
    // Try browser language
    const browserLang = navigator.language.split('-')[0] as Locale;
    if (browserLang in translations) return browserLang;
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string) => getTranslation(locale, key),
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
