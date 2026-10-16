import { z } from 'zod'

import { DEFAULT_MESSENGER, MESSENGERS } from '@/shared/config'
import type { TranslationKey } from '@/shared/i18n'

const message = (key: TranslationKey) => key

export const credentialsSchema = z.object({
  messenger: z.enum(MESSENGERS).default(DEFAULT_MESSENGER),
  apiUrl: z
    .string()
    .trim()
    .min(1, message('validation.apiUrlRequired'))
    .pipe(z.url({ protocol: /^https?$/, error: message('validation.apiUrlInvalid') })),
  idInstance: z
    .string()
    .trim()
    .min(1, message('validation.idInstanceRequired'))
    .regex(/^\d+$/, message('validation.idInstanceDigits')),
  apiTokenInstance: z
    .string()
    .trim()
    .min(1, message('validation.tokenRequired'))
    .regex(/^[A-Za-z0-9]{16,}$/, message('validation.tokenInvalid')),
})

export type Credentials = z.infer<typeof credentialsSchema>
export type CredentialsInput = z.input<typeof credentialsSchema>
