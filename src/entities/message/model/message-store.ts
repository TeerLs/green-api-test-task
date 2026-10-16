import { z } from 'zod'

import { createStore, useStore } from '@/shared/lib/store'

export const messageStatusSchema = z.enum(['pending', 'sent', 'delivered', 'read', 'failed'])

export const messageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  text: z.string(),
  direction: z.enum(['in', 'out']),
  timestamp: z.number(),
  status: messageStatusSchema.optional(),
  senderName: z.string().optional(),
  unsupported: z.boolean().optional(),
})

export type Message = z.infer<typeof messageSchema>
export type MessageStatus = z.infer<typeof messageStatusSchema>

type MessagesState = Record<string, Message[]>

export const messageStore = createStore<MessagesState>({
  key: 'messages',
  schema: z.record(z.string(), z.array(messageSchema)),
  initial: () => ({}),
})

const EMPTY: Message[] = []

export const useChatMessages = (chatId: string | null) =>
  useStore(messageStore, (state) => (chatId ? (state[chatId] ?? EMPTY) : EMPTY))

export const useLastMessages = () => useStore(messageStore, (state) => state)

const byTimestamp = (a: Message, b: Message) => a.timestamp - b.timestamp

const STATUS_RANK: Record<MessageStatus, number> = {
  failed: -1,
  pending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
}

export function mergeStatus(current: MessageStatus | undefined, next: MessageStatus) {
  if (!current || next === 'failed' || current === 'failed') return next
  return STATUS_RANK[next] > STATUS_RANK[current] ? next : current
}

function updateChat(chatId: string, update: (messages: Message[]) => Message[]) {
  messageStore.setState((state) => {
    const current = state[chatId] ?? EMPTY
    const next = update(current)
    return next === current ? state : { ...state, [chatId]: next }
  })
}

export const messageActions = {
  add(chatId: string, incoming: Message | Message[]) {
    const list = Array.isArray(incoming) ? incoming : [incoming]
    updateChat(chatId, (messages) => {
      const known = new Map(messages.map((message) => [message.id, message]))
      let changed = false
      for (const message of list) {
        const existing = known.get(message.id)
        if (existing) {
          const status = message.status && mergeStatus(existing.status, message.status)
          if (status && status !== existing.status) {
            known.set(message.id, { ...existing, status })
            changed = true
          }
          continue
        }
        known.set(message.id, message)
        changed = true
      }
      return changed ? [...known.values()].sort(byTimestamp) : messages
    })
  },

  confirm(chatId: string, tempId: string, idMessage: string) {
    updateChat(chatId, (messages) => {
      const alreadyReceived = messages.some((message) => message.id === idMessage)
      if (alreadyReceived) return messages.filter((message) => message.id !== tempId)
      return messages.map((message) =>
        message.id === tempId
          ? { ...message, id: idMessage, status: mergeStatus(message.status, 'sent') }
          : message,
      )
    })
  },

  setStatus(chatId: string, id: string, status: MessageStatus) {
    updateChat(chatId, (messages) => {
      const index = messages.findIndex((message) => message.id === id)
      if (index === -1) return messages
      const next = status === 'pending' ? status : mergeStatus(messages[index]!.status, status)
      if (next === messages[index]!.status) return messages
      const copy = [...messages]
      copy[index] = { ...copy[index]!, status: next }
      return copy
    })
  },

  remove(chatId: string, id: string) {
    updateChat(chatId, (messages) => messages.filter((message) => message.id !== id))
  },

  moveChat(fromId: string, toId: string) {
    if (fromId === toId) return
    messageStore.setState((state) => {
      const { [fromId]: moved = EMPTY, ...rest } = state
      const merged = [...(rest[toId] ?? EMPTY), ...moved.map((m) => ({ ...m, chatId: toId }))]
      return { ...rest, [toId]: merged.sort(byTimestamp) }
    })
  },

  clearChat(chatId: string) {
    messageStore.setState((state) => {
      const { [chatId]: _removed, ...rest } = state
      return rest
    })
  },
}
