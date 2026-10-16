import type { ReactNode } from 'react'

import { useTranslation } from '@/shared/i18n'
import { formatTime } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'

import type { Message } from '../model/message-store'

import { MessageStatusIcon } from './MessageStatusIcon'

interface MessageBubbleProps {
  message: Message
  footer?: ReactNode
}

export function MessageBubble({ message, footer }: MessageBubbleProps) {
  const { t } = useTranslation()
  const outgoing = message.direction === 'out'

  return (
    <div
      className={cn('flex flex-col gap-1', outgoing ? 'items-end' : 'items-start')}
      data-testid="message"
      data-direction={message.direction}
    >
      <div
        className={cn(
          'relative max-w-[min(32rem,85%)] animate-in rounded-2xl px-3.5 py-2 shadow-xs duration-200 fade-in-0 slide-in-from-bottom-1',
          outgoing
            ? 'rounded-br-md bg-bubble-out text-bubble-out-foreground'
            : 'rounded-bl-md border bg-bubble-in text-bubble-in-foreground',
          message.status === 'failed' && 'ring-1 ring-destructive/50',
        )}
      >
        <p
          className={cn(
            'text-[0.9375rem] leading-relaxed break-words whitespace-pre-wrap',
            message.unsupported && 'italic opacity-75',
          )}
        >
          {message.unsupported ? t('message.unsupported') : message.text}
          <span className="inline-block w-16" aria-hidden />
        </p>
        <span
          className={cn(
            'absolute right-3 bottom-1.5 flex items-center gap-1 text-[0.6875rem] tabular-nums',
            outgoing ? 'text-bubble-out-foreground/70' : 'text-muted-foreground',
          )}
        >
          <time dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
          {outgoing && message.status && <MessageStatusIcon status={message.status} />}
        </span>
      </div>
      {footer}
    </div>
  )
}
