export interface LocaleConfig {
  id: string;
  currency: {
    code: string;
    symbol: string;
  };
  temperature: {
    unit: 'C' | 'F';
    label: string;
  };
}

export const localesConfig: Record<string, LocaleConfig> = {
  it: {
    id: 'it',
    currency: { code: 'EUR', symbol: '€' },
    temperature: { unit: 'C', label: '°C' },
  },
  en: {
    id: 'en',
    currency: { code: 'USD', symbol: '$' },
    temperature: { unit: 'F', label: '°F' },
  },
  fr: {
    id: 'fr',
    currency: { code: 'EUR', symbol: '€' },
    temperature: { unit: 'C', label: '°C' },
  },
  es: {
    id: 'es',
    currency: { code: 'EUR', symbol: '€' },
    temperature: { unit: 'C', label: '°C' },
  },
  zh: {
    id: 'zh',
    currency: { code: 'CNY', symbol: '¥' },
    temperature: { unit: 'C', label: '°C' },
  },
};

export const DEFAULT_LOCALE = 'it';
