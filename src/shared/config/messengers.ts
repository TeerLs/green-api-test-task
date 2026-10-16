export const MESSENGERS = ['whatsapp', 'telegram', 'max'] as const

export type Messenger = (typeof MESSENGERS)[number]

export const DEFAULT_MESSENGER: Messenger = 'max'

export const MESSENGER_LABELS: Record<Messenger, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  max: 'MAX',
}
