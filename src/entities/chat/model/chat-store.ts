import { z } from 'zod'

import { createStore, useStore } from '@/shared/lib/store'

export const chatSchema = z.object({
  id: z.string(),
  phone: z.string().optional(),
  name: z.string(),
  createdAt: z.number(),
  unread: z.number().default(0),
})

export type Chat = z.infer<typeof chatSchema>

type ChatsState = Record<string, Chat>

export const chatStore = createStore<ChatsState>({
  key: 'chats',
  schema: z.record(z.string(), chatSchema),
  initial: () => ({}),
})

export const activeChatStore = createStore<string | null>({ initial: () => null })

export const useChatsMap = () => useStore(chatStore, (chats) => chats)
export const useChat = (id: string | null) =>
  useStore(chatStore, (chats) => (id ? chats[id] : undefined))
export const useActiveChatId = () => useStore(activeChatStore, (id) => id)

export function findChat(chats: ChatsState, { id, phone }: { id: string; phone?: string }) {
  if (chats[id]) return chats[id]
  if (!phone) return undefined
  return Object.values(chats).find((chat) => chat.phone === phone)
}

export const chatActions = {
  upsert(chat: Pick<Chat, 'id' | 'name'> & Partial<Chat>) {
    chatStore.setState((chats) => {
      const base: Chat = chats[chat.id] ?? { ...chat, createdAt: Date.now(), unread: 0 }
      return { ...chats, [chat.id]: { ...base, ...chat } }
    })
  },

  rename(fromId: string, toId: string) {
    if (fromId === toId) return
    chatStore.setState((chats) => {
      const { [fromId]: chat, ...rest } = chats
      if (!chat) return chats
      return { ...rest, [toId]: { ...chat, ...rest[toId], id: toId } }
    })
    if (activeChatStore.getState() === fromId) activeChatStore.setState(toId)
  },

  remove(id: string) {
    chatStore.setState((chats) => {
      const { [id]: _removed, ...rest } = chats
      return rest
    })
    if (activeChatStore.getState() === id) activeChatStore.setState(null)
  },

  incrementUnread(id: string) {
    chatStore.setState((chats) =>
      chats[id] ? { ...chats, [id]: { ...chats[id], unread: chats[id].unread + 1 } } : chats,
    )
  },

  open(id: string | null) {
    activeChatStore.setState(id)
    if (!id) return
    chatStore.setState((chats) =>
      chats[id]?.unread ? { ...chats, [id]: { ...chats[id], unread: 0 } } : chats,
    )
  },
}
