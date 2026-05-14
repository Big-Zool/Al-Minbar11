import { z } from "zod";

export const languages = ['ar', 'en', 'tr', 'fr', 'ur', 'fa'] as const;
export type Language = typeof languages[number];

export const languageNames: Record<Language, string> = {
  ar: 'العربية',
  en: 'English',
  tr: 'Türkçe',
  fr: 'Français',
  ur: 'اردو',
  fa: 'فارسی'
};

export const rtlLanguages = ['ar', 'ur', 'fa'];

export function isRTL(lang: Language) {
  return rtlLanguages.includes(lang);
}

export function getLocale(lang: Language) {
  const locales: Record<Language, string> = {
    ar: 'ar-SA',
    en: 'en-US',
    tr: 'tr-TR',
    fr: 'fr-FR',
    ur: 'ur-PK',
    fa: 'fa-IR'
  };
  return locales[lang];
}

export function formatDate(dateString: string, lang: Language) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(getLocale(lang), {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}
