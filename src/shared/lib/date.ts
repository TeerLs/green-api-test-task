import { getLanguage, translate } from '@/shared/i18n'

const LOCALES = { ru: 'ru-RU', en: 'en-GB' } as const

const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(kind: 'time' | 'day' | 'short') {
  const locale = LOCALES[getLanguage()]
  const cacheKey = `${locale}:${kind}`
  let cached = formatters.get(cacheKey)
  if (!cached) {
    const options: Intl.DateTimeFormatOptions = {
      time: { hour: '2-digit', minute: '2-digit' } as const,
      day: { day: 'numeric', month: 'long' } as const,
      short: { day: '2-digit', month: '2-digit', year: '2-digit' } as const,
    }[kind]
    cached = new Intl.DateTimeFormat(locale, options)
    formatters.set(cacheKey, cached)
  }
  return cached
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

export const isSameDay = (a: number, b: number) =>
  startOfDay(new Date(a)) === startOfDay(new Date(b))

export const formatTime = (timestamp: number) => formatter('time').format(timestamp)

export function formatDay(timestamp: number, now = Date.now()) {
  const diff = (startOfDay(new Date(now)) - startOfDay(new Date(timestamp))) / 86_400_000
  if (diff === 0) return translate('date.today')
  if (diff === 1) return translate('date.yesterday')
  return formatter('day').format(timestamp)
}

export function formatListTimestamp(timestamp: number, now = Date.now()) {
  return isSameDay(timestamp, now) ? formatTime(timestamp) : formatter('short').format(timestamp)
}
