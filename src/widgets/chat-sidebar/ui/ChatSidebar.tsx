import { SearchIcon } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'

import { chatActions, useActiveChatId, useChatsMap } from '@/entities/chat'
import { useLastMessages } from '@/entities/message'
import { useRequiredSession } from '@/entities/session'
import { CreateChatDialog } from '@/features/create-chat'
import { ConnectionStatus } from '@/features/receive-messages'
import { LanguageSwitcher } from '@/features/switch-language'
import { ThemeToggle } from '@/features/toggle-theme'
import { MESSENGER_LABELS } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Logo } from '@/shared/ui/Logo'

import { AccountMenu } from './AccountMenu'
import { ChatListItem } from './ChatListItem'

export function ChatSidebar({ className }: { className?: string }) {
  const { t } = useTranslation()
  const chats = useChatsMap()
  const messages = useLastMessages()
  const activeChatId = useActiveChatId()
  const { messenger } = useRequiredSession()
  const [search, setSearch] = useState('')
  const query = useDeferredValue(search.trim().toLowerCase())

  const items = useMemo(() => {
    const digits = query.replace(/\D/g, '')
    return Object.values(chats)
      .map((chat) => ({ chat, lastMessage: messages[chat.id]?.at(-1) }))
      .filter(
        ({ chat }) =>
          !query ||
          chat.name.toLowerCase().includes(query) ||
          Boolean(digits && chat.phone?.includes(digits)),
      )
      .sort(
        (a, b) =>
          (b.lastMessage?.timestamp ?? b.chat.createdAt) -
          (a.lastMessage?.timestamp ?? a.chat.createdAt),
      )
  }, [chats, messages, query])

  const isEmpty = Object.keys(chats).length === 0

  return (
    <aside className={cn('flex h-full min-h-0 flex-col bg-sidebar', className)}>
      <header className="flex flex-col gap-3 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Logo />
          <div className="flex items-center">
            <LanguageSwitcher />
            <ThemeToggle />
            <CreateChatDialog />
            <AccountMenu />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <ConnectionStatus className="pl-0.5" />
          <span
            className="shrink-0 rounded-full border border-gold/40 px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide text-gold"
            data-testid="messenger-badge"
          >
            {MESSENGER_LABELS[messenger]}
          </span>
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('sidebar.search')}
            aria-label={t('sidebar.searchLabel')}
            className="h-10 rounded-full border-transparent bg-muted/70 pl-9"
          />
        </div>
      </header>

      <div className="mx-4 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="font-serif text-xs text-gold italic">{t('sidebar.divider')}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <nav
        className="flex-1 thin-scrollbar overflow-y-auto px-2 py-2"
        aria-label={t('sidebar.chatList')}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
            <p className="font-serif text-lg text-foreground">{t('sidebar.emptyTitle')}</p>
            <p>{t('sidebar.emptyDescription')}</p>
          </div>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {t('sidebar.notFound')}
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {items.map(({ chat, lastMessage }) => (
              <li key={chat.id}>
                <ChatListItem
                  chat={chat}
                  lastMessage={lastMessage}
                  active={chat.id === activeChatId}
                  onSelect={chatActions.open}
                />
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  )
}
