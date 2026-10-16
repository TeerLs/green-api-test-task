import { ArrowLeftIcon, EllipsisVerticalIcon, Trash2Icon } from 'lucide-react'

import { ChatAvatar, chatActions, formatPhone, type Chat } from '@/entities/chat'
import { messageActions } from '@/entities/message'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function ChatHeader({ chat }: { chat: Chat }) {
  const { t } = useTranslation()
  const subtitle = chat.phone ? formatPhone(chat.phone) : `ID ${chat.id}`

  const deleteChat = () => {
    chatActions.remove(chat.id)
    messageActions.clearChat(chat.id)
  }

  return (
    <header className="flex items-center gap-3 border-b bg-sidebar/95 px-3 py-2.5 backdrop-blur sm:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => chatActions.open(null)}
        aria-label={t('chat.back')}
      >
        <ArrowLeftIcon />
      </Button>
      <ChatAvatar id={chat.id} name={chat.name} className="size-10" />
      <div className="flex min-w-0 flex-1 flex-col">
        <h2
          className="truncate font-serif text-lg leading-tight font-semibold"
          data-testid="chat-title"
        >
          {chat.name}
        </h2>
        <p className="truncate text-xs text-muted-foreground tabular-nums">{subtitle}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('chat.actions')}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onSelect={deleteChat}>
            <Trash2Icon />
            {t('chat.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
