import { useActiveChatId } from '@/entities/chat'
import { useNotificationsPolling } from '@/features/receive-messages'
import { cn } from '@/shared/lib/utils'
import { ChatSidebar } from '@/widgets/chat-sidebar'
import { ChatWindow } from '@/widgets/chat-window'

export function MessengerPage() {
  const activeChatId = useActiveChatId()
  useNotificationsPolling()

  return (
    <main className="flex h-svh overflow-hidden bg-background">
      <ChatSidebar
        className={cn(
          'w-full border-r md:flex md:w-[22rem] md:shrink-0 lg:w-[24rem]',
          activeChatId ? 'hidden' : 'flex',
        )}
      />
      <ChatWindow className={cn('min-w-0 flex-1 md:flex', activeChatId ? 'flex' : 'hidden')} />
    </main>
  )
}
