import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { messageActions } from '@/entities/message'
import { useRequiredSession } from '@/entities/session'
import { sendMessage } from '@/shared/api'
import { getErrorMessage, translate } from '@/shared/i18n'

interface SendMessageInput {
  chatId: string
  text: string
  tempId?: string
}

const createTempId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function useSendMessage() {
  const credentials = useRequiredSession()

  const mutation = useMutation({
    mutationKey: ['send-message'],
    mutationFn: ({ chatId, text }: Required<SendMessageInput>) =>
      sendMessage(credentials, { chatId, message: text }),
    onMutate: ({ chatId, text, tempId }) => {
      messageActions.remove(chatId, tempId)
      messageActions.add(chatId, {
        id: tempId,
        chatId,
        text,
        direction: 'out',
        timestamp: Date.now(),
        status: 'pending',
      })
    },
    onSuccess: ({ idMessage }, { chatId, tempId }) => {
      messageActions.confirm(chatId, tempId, idMessage)
    },
    onError: (error, { chatId, tempId }) => {
      messageActions.setStatus(chatId, tempId, 'failed')
      toast.error(translate('message.sendFailed'), { description: getErrorMessage(error) })
    },
  })

  return {
    ...mutation,
    send: ({ chatId, text, tempId = createTempId() }: SendMessageInput) =>
      mutation.mutate({ chatId, text, tempId }),
  }
}
