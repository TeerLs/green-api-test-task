import i18n, { type ParseKeys } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { en } from './locales/en'
import { ru } from './locales/ru'

export const LANGUAGES = ['ru', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

export const resources = {
  ru: { translation: ru },
  en: { translation: en },
} as const

export type TranslationKey = ParseKeys

const LANGUAGE_STORAGE_KEY = 'green-max:language'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: LANGUAGES,
    fallbackLng: 'ru',
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    initAsync: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

const syncDocumentLanguage = (language: string) => {
  if (typeof document !== 'undefined') document.documentElement.lang = language
}

syncDocumentLanguage(i18n.resolvedLanguage ?? 'ru')
i18n.on('languageChanged', syncDocumentLanguage)

export const getLanguage = (): Language => (i18n.resolvedLanguage === 'en' ? 'en' : 'ru')

export const changeLanguage = (language: Language) => i18n.changeLanguage(language)

export { i18n }
