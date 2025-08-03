import { en } from './en'
import { ru } from './ru'

export const locales = {
  en,
  ru,
} as const

export type Locale = keyof typeof locales
export type Messages = typeof locales[Locale]

// Пример: функция для получения перевода с типизацией
export function t<K extends keyof Messages>(locale: Locale, key: K): Messages[K] {
  return locales[locale][key]
}

/*
  Пример использования:

  import { t } from './i18n'

  const msg = t('ru', 'inviteMessage') 
  console.log(msg) // "Вы приглашены в мобильное приложение Wazzup https://m.wazzup24.com"

*/