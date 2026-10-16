import { RotateCcwIcon } from 'lucide-react'

import type { Message } from '@/entities/message'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'

import { useSendMessage } from '../model/use-send-message'

export function RetryMessageButton({ message }: { message: Message }) {
  const { t } = useTranslation()
  const { send } = useSendMessage()

  return (
    <Button
      variant="link"
      size="xs"
      className="h-auto px-1 text-destructive"
      onClick={() => send({ chatId: message.chatId, text: message.text, tempId: message.id })}
    >
      <RotateCcwIcon />
      {t('message.retry')}
    </Button>
  )
}
