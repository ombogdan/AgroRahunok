import uk from './locales/uk.json';
import en from './locales/en.json';
import pl from './locales/pl.json';
import ro from './locales/ro.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';

export const languages = ['uk', 'en', 'pl', 'ro', 'fr', 'de', 'es'] as const;
export type Language = typeof languages[number];
export const languageNames: Record<Language, string> = {
  uk: 'Українська', en: 'English', pl: 'Polski', ro: 'Română',
  fr: 'Français', de: 'Deutsch', es: 'Español',
};
const resources: Record<Language, Record<string, string>> = {uk, en, pl, ro, fr, de, es};
let activeLanguage: Language = 'uk';
export const getLanguage = () => activeLanguage;
export const setActiveLanguage = (language: Language) => {activeLanguage = language;};
export const isLanguage = (value: string): value is Language =>
  languages.includes(value as Language);
export const deviceLanguage = (): Language => {
  const candidate = Intl.DateTimeFormat().resolvedOptions().locale.split(/[-_]/)[0];
  return isLanguage(candidate) ? candidate : 'en';
};
export const localeTag = () => ({uk: 'uk-UA', en: 'en-GB', pl: 'pl-PL', ro: 'ro-RO',
  fr: 'fr-FR', de: 'de-DE', es: 'es-ES'}[activeLanguage]);

export type TranslationPadding = 'before' | 'after' | 'both';

export function t(key: string, values: Array<string | number> = [], padding?: TranslationPadding): string {
  const text = resources[activeLanguage][key] ?? resources.en[key] ?? resources.uk[key] ?? key;
  const translated = text.replace(/\{\{(\d+)\}\}/g, (_, index: string) =>
    String(values[Number(index)] ?? ''));
  const leading = padding === 'before' || padding === 'both' ? ' ' : '';
  const trailing = padding === 'after' || padding === 'both' ? ' ' : '';
  return leading + translated + trailing;
}
