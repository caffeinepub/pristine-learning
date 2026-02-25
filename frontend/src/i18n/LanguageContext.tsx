import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { en, ta } from './index';
import type { TranslationKeys } from './index';

export type Language = 'en' | 'ta';

const translations: Record<Language, TranslationKeys> = { en, ta };

const STORAGE_KEY = 'pristine-language';

interface LanguageContextValue {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === 'string') return current;
  return undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'ta') return stored;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const activeTranslations = translations[currentLanguage] as unknown as Record<string, unknown>;
      const result = getNestedValue(activeTranslations, key);
      if (result !== undefined) return result;

      // Fallback to English
      const fallback = getNestedValue(translations['en'] as unknown as Record<string, unknown>, key);
      if (fallback !== undefined) return fallback;

      // Last resort: return the key itself
      return key;
    },
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
