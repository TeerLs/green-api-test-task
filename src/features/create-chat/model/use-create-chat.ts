import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { chatActions, chatStore, findChat, formatPhone } from '@/entities/chat'
import { useRequiredSession, type Credentials } from '@/entities/session'
import { checkAccount, checkWhatsapp, GreenApiError } from '@/shared/api'
import { MESSENGER_LABELS, type Messenger } from '@/shared/config'
import { LocalizedError, translate } from '@/shared/i18n'

interface CreateChatInput {
  phone: string
  name?: string
}

export class NoAccountError extends LocalizedError {
  constructor(messenger: Messenger) {
    super('errors.noAccount', { messenger: MESSENGER_LABELS[messenger] })
    this.name = 'NoAccountError'
  }
}

const phoneChatId = (phone: string) => `${phone}@c.us`

async function lookupChatId(credentials: Credentials, phone: string) {
  if (credentials.messenger === 'whatsapp') {
    const { existsWhatsapp } = await checkWhatsapp(credentials, phone)
    return existsWhatsapp ? phoneChatId(phone) : null
  }
  const { exist, chatId } = await checkAccount(credentials, phone)
  return exist ? chatId || phoneChatId(phone) : null
}

async function resolveChatId(
  credentials: Credentials,
  phone: string,
): Promise<{ chatId: string; verified: boolean }> {
  let chatId: string | null
  try {
    chatId = await lookupChatId(credentials, phone)
  } catch (error) {
    if (error instanceof GreenApiError && [401, 403].includes(error.status)) throw error
    return { chatId: phoneChatId(phone), verified: false }
  }
  if (!chatId) throw new NoAccountError(credentials.messenger)
  return { chatId, verified: true }
}

export function useCreateChat({ onCreated }: { onCreated?: (chatId: string) => void } = {}) {
  const credentials = useRequiredSession()

  return useMutation({
    mutationKey: ['create-chat'],
    mutationFn: async ({ phone, name }: CreateChatInput) => {
      const existing = findChat(chatStore.getState(), { id: phoneChatId(phone), phone })
      if (existing) return { chatId: existing.id, existed: true, verified: true }

      const { chatId, verified } = await resolveChatId(credentials, phone)
      chatActions.upsert({ id: chatId, phone, name: name?.trim() || formatPhone(phone) })
      return { chatId, existed: false, verified }
    },
    onSuccess: ({ chatId, verified }) => {
      if (!verified) {
        toast.warning(translate('createChat.unverifiedTitle'), {
          description: translate('createChat.unverifiedDescription', {
            messenger: MESSENGER_LABELS[credentials.messenger],
          }),
        })
      }
      chatActions.open(chatId)
      onCreated?.(chatId)
    },
  })
}
