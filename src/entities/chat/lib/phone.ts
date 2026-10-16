import { z } from 'zod'

import type { Messenger } from '@/shared/config'
import type { TranslationKey } from '@/shared/i18n'

const message = (key: TranslationKey) => key

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`
  return digits
}

const isMaxPhone = (value: string) => /^7\d{10}$/.test(value) || /^375\d{9}$/.test(value)
const isInternationalPhone = (value: string) => /^[1-9]\d{10,14}$/.test(value)

export const createPhoneSchema = (messenger: Messenger) =>
  z
    .string()
    .transform(normalizePhone)
    .pipe(
      z
        .string()
        .min(1, message('validation.phoneRequired'))
        .refine(
          messenger === 'max' ? isMaxPhone : isInternationalPhone,
          message(messenger === 'max' ? 'validation.phoneInvalidMax' : 'validation.phoneInvalid'),
        ),
    )

export function formatPhone(phone: string) {
  const ru = phone.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/)
  if (ru) return `+7 ${ru[1]} ${ru[2]}-${ru[3]}-${ru[4]}`
  const by = phone.match(/^375(\d{2})(\d{3})(\d{2})(\d{2})$/)
  if (by) return `+375 ${by[1]} ${by[2]}-${by[3]}-${by[4]}`
  return phone ? `+${phone}` : ''
}
