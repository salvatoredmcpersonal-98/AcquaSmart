export interface LocaleConfig {
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
    currency: { code: 'EUR', symbol: '€' },
    temperature: { unit: 'C', label: '°C' },
  },
  en: {
    currency: { code: 'USD', symbol: '$' },
    temperature: { unit: 'F', label: '°F' },
  },
  fr: {
    currency: { code: 'EUR', symbol: '€' },
    temperature: { unit: 'C', label: '°C' },
  },
  es: {
    currency: { code: 'EUR', symbol: '€' },
    temperature: { unit: 'C', label: '°C' },
  },
  zh: {
    currency: { code: 'CNY', symbol: '¥' },
    temperature: { unit: 'C', label: '°C' },
  },
};

export const DEFAULT_LOCALE = 'it';
