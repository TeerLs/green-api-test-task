import { ChatAvatar, type Chat } from '@/entities/chat'
import { MessageStatusIcon, type Message } from '@/entities/message'
import { useTranslation } from '@/shared/i18n'
import { formatListTimestamp } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'

interface ChatListItemProps {
  chat: Chat
  lastMessage?: Message
  active: boolean
  onSelect: (id: string) => void
}

export function ChatListItem({ chat, lastMessage, active, onSelect }: ChatListItemProps) {
  const { t } = useTranslation()
  const timestamp = lastMessage?.timestamp ?? chat.createdAt
  const preview = !lastMessage
    ? t('sidebar.noMessages')
    : lastMessage.unsupported
      ? t('message.unsupported')
      : lastMessage.text

  return (
    <button
      type="button"
      onClick={() => onSelect(chat.id)}
      aria-current={active ? 'true' : undefined}
      data-testid="chat-list-item"
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        'outline-none hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-ring/50',
        active && 'bg-secondary hover:bg-secondary',
      )}
    >
      {active && (
        <span className="absolute top-3 bottom-3 left-0 w-0.5 rounded-full bg-gold" aria-hidden />
      )}
      <ChatAvatar id={chat.id} name={chat.name} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">{chat.name}</span>
          <span className="shrink-0 text-[0.6875rem] text-muted-foreground tabular-nums">
            {formatListTimestamp(timestamp)}
          </span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
            {lastMessage?.direction === 'out' && lastMessage.status && (
              <MessageStatusIcon status={lastMessage.status} />
            )}
            <span className={cn('truncate', (!lastMessage || lastMessage.unsupported) && 'italic')}>
              {preview}
            </span>
          </span>
          {chat.unread > 0 && (
            <span
              className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-primary-foreground tabular-nums"
              aria-label={t('sidebar.unread', { count: chat.unread })}
            >
              {chat.unread > 99 ? '99+' : chat.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}
