import { SendHorizontalIcon } from 'lucide-react'
import { useRef, useState, type SubmitEvent, type KeyboardEvent } from 'react'

import { MESSAGE_MAX_LENGTH } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'

import { useSendMessage } from '../model/use-send-message'

export function MessageComposer({ chatId }: { chatId: string }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { send } = useSendMessage()

  const trimmed = text.trim()
  const tooLong = text.length > MESSAGE_MAX_LENGTH

  const submit = () => {
    if (!trimmed || tooLong) return
    send({ chatId, text: trimmed })
    setText('')
    textareaRef.current?.focus()
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t bg-sidebar/95 px-3 py-3 backdrop-blur sm:px-5"
    >
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('message.placeholder')}
          aria-label={t('message.inputLabel')}
          rows={1}
          autoFocus
          className={cn(
            'max-h-40 min-h-11 resize-none thin-scrollbar rounded-2xl bg-background px-4 py-2.5 text-[0.9375rem] leading-relaxed',
            tooLong && 'border-destructive',
          )}
        />
        {text.length > MESSAGE_MAX_LENGTH * 0.9 && (
          <span
            className={cn(
              'absolute -top-5 right-3 text-[0.6875rem] tabular-nums',
              tooLong ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {text.length}/{MESSAGE_MAX_LENGTH}
          </span>
        )}
      </div>
      <Button
        type="submit"
        size="icon-lg"
        className="size-11 shrink-0 rounded-full shadow-sm"
        disabled={!trimmed || tooLong}
        aria-label={t('message.send')}
      >
        <SendHorizontalIcon className="size-5" />
      </Button>
    </form>
  )
}
