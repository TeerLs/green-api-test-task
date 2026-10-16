import { useActiveChatId, useChat } from '@/entities/chat'
import { useRequiredSession } from '@/entities/session'
import { MessageComposer } from '@/features/send-message'
import { MESSENGER_LABELS } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'

export function ChatWindow({ className }: { className?: string }) {
  const { t } = useTranslation()
  const activeChatId = useActiveChatId()
  const chat = useChat(activeChatId)

  if (!chat) return <EmptyState className={className} />

  return (
    <section
      className={cn('flex h-full min-h-0 flex-col', className)}
      aria-label={t('chat.label', { name: chat.name })}
    >
      <ChatHeader chat={chat} />
      <MessageList key={chat.id} chatId={chat.id} />
      <MessageComposer key={`composer-${chat.id}`} chatId={chat.id} />
    </section>
  )
}

function EmptyState({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { messenger } = useRequiredSession()

  return (
    <section
      className={cn('flex h-full flex-col items-center justify-center chat-pattern p-8', className)}
    >
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-3xl border bg-card/80 px-10 py-10 text-center shadow-sm backdrop-blur">
        <span className="font-serif text-4xl text-gold italic">❦</span>
        <h2 className="font-serif text-2xl">{t('chat.selectTitle')}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('chat.selectDescription', { messenger: MESSENGER_LABELS[messenger] })}
        </p>
      </div>
    </section>
  )
}
