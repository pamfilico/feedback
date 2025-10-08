import enTranslations from './en.json';
import elTranslations from './el.json';

export type Locale = 'en' | 'el';

export type Translations = typeof enTranslations;

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  el: elTranslations,
};

export function getTranslations(locale: Locale = 'en'): Translations {
  return translations[locale] || translations.en;
}

export { enTranslations, elTranslations };
