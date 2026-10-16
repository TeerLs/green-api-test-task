import { i18n, type TranslationKey } from './config'

export class LocalizedError extends Error {
  readonly key: TranslationKey
  readonly params?: Record<string, unknown>

  constructor(key: TranslationKey, params?: Record<string, unknown>) {
    super(key)
    this.name = 'LocalizedError'
    this.key = key
    this.params = params
  }
}

export const translate = (key: string, params?: Record<string, unknown>): string =>
  String(i18n.t(key as TranslationKey, params as never))

export function getErrorMessage(error: unknown) {
  if (error instanceof LocalizedError) return translate(error.key, error.params)
  if (error instanceof Error && error.message) return error.message
  return translate('errors.unexpected')
}
