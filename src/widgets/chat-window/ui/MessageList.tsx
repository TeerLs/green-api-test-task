import { Fragment, useLayoutEffect, useRef } from 'react'

import { MessageBubble, useChatMessages } from '@/entities/message'
import { useChatHistory } from '@/features/load-chat-history'
import { RetryMessageButton } from '@/features/send-message'
import { useTranslation } from '@/shared/i18n'
import { formatDay, isSameDay } from '@/shared/lib/date'
import { Skeleton } from '@/shared/ui/skeleton'

const STICK_THRESHOLD = 120

export function MessageList({ chatId }: { chatId: string }) {
  const { t } = useTranslation()
  const messages = useChatMessages(chatId)
  const history = useChatHistory(chatId)
  const containerRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)

  useLayoutEffect(() => {
    stickToBottom.current = true
  }, [chatId])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (container && stickToBottom.current) container.scrollTop = container.scrollHeight
  }, [messages, chatId])

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight
    stickToBottom.current = distance < STICK_THRESHOLD
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 thin-scrollbar overflow-y-auto chat-pattern"
      role="log"
      aria-label={t('chat.messages')}
      aria-live="polite"
    >
      <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-1.5 px-3 py-4 sm:px-6">
        {history.isLoading && messages.length === 0 && (
          <div className="flex flex-col gap-3" aria-label={t('chat.loadingHistory')}>
            <Skeleton className="h-10 w-2/5 rounded-2xl" />
            <Skeleton className="ml-auto h-10 w-1/3 rounded-2xl" />
            <Skeleton className="h-14 w-1/2 rounded-2xl" />
            <Skeleton className="ml-auto h-10 w-2/5 rounded-2xl" />
          </div>
        )}

        {!history.isLoading && messages.length === 0 && (
          <div className="m-auto flex flex-col items-center gap-2 py-16 text-center">
            <span className="font-serif text-3xl text-gold italic">~</span>
            <p className="font-serif text-xl">{t('chat.startTitle')}</p>
            <p className="max-w-xs text-sm text-muted-foreground">{t('chat.startDescription')}</p>
          </div>
        )}

        {messages.map((message, index) => {
          const previous = messages[index - 1]
          const showDay = !previous || !isSameDay(previous.timestamp, message.timestamp)
          return (
            <Fragment key={message.id}>
              {showDay && <DaySeparator timestamp={message.timestamp} />}
              <MessageBubble
                message={message}
                footer={message.status === 'failed' && <RetryMessageButton message={message} />}
              />
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

function DaySeparator({ timestamp }: { timestamp: number }) {
  return (
    <div className="sticky top-2 z-10 my-2 flex justify-center">
      <span className="rounded-full border bg-background/85 px-3 py-0.5 text-xs text-muted-foreground shadow-xs backdrop-blur">
        {formatDay(timestamp)}
      </span>
    </div>
  )
}
