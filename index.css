import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { localesConfig, DEFAULT_LOCALE, LocaleConfig } from '../config/locales';

interface LocaleContextType {
  locale: LocaleConfig;
  formatCurrency: (value: number) => string;
  formatTemperature: (celsiusValue: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState<LocaleConfig>(localesConfig[DEFAULT_LOCALE]);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const languageCode = lng.split('-')[0];
      const newLocale = localesConfig[languageCode] || localesConfig[DEFAULT_LOCALE];
      setLocale(newLocale);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    handleLanguageChanged(i18n.language); // Set initial locale

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const formatCurrency = useCallback((value: number) => {
    if (value === null || typeof value === 'undefined') {
      return '--';
    }
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: locale.currency.code,
    }).format(value);
  }, [i18n.language, locale.currency.code]);

  const formatTemperature = useCallback((celsiusValue: number) => {
    if (celsiusValue === null || typeof celsiusValue === 'undefined') {
      return '--';
    }
    if (locale.temperature.unit === 'F') {
      const fahrenheitValue = (celsiusValue * 9/5) + 32;
      return `${fahrenheitValue.toFixed(1)}${locale.temperature.label}`;
    }
    return `${celsiusValue.toFixed(1)}${locale.temperature.label}`;
  }, [locale.temperature.unit, locale.temperature.label]);

  const value = {
    locale,
    formatCurrency,
    formatTemperature,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
