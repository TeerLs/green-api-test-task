import { activeChatStore, chatActions, chatStore, findChat, formatPhone } from '@/entities/chat'
import { fromNotification, messageActions, toMessageStatus } from '@/entities/message'
import { notificationSchema, type MessageNotification } from '@/shared/api'

export type HandleResult =
  | { kind: 'message'; chatId: string; messageId: string }
  | { kind: 'status'; chatId: string; messageId: string }
  | { kind: 'ignored'; typeWebhook?: string }

function normalizeSenderPhone(value: string | number | undefined) {
  const phone = value === undefined ? '' : String(value).replace(/\D/g, '')
  return phone && phone !== '0' ? phone : undefined
}

function phoneFromChatId(value: string | undefined) {
  const match = value?.match(/^(\d{10,15})@c\.us$/)
  return match?.[1]
}

function resolveChat(notification: MessageNotification) {
  const { senderData, typeWebhook } = notification
  const chatId = senderData.chatId
  const incoming = typeWebhook === 'incomingMessageReceived'
  const phone = incoming
    ? (normalizeSenderPhone(senderData.senderPhoneNumber) ?? phoneFromChatId(senderData.sender))
    : phoneFromChatId(chatId)

  const existing = findChat(chatStore.getState(), { id: chatId, phone })
  if (existing && existing.id !== chatId) {
    chatActions.rename(existing.id, chatId)
    messageActions.moveChat(existing.id, chatId)
  }

  if (!existing) {
    const name =
      senderData.chatName ||
      senderData.senderContactName ||
      senderData.senderName ||
      (phone ? formatPhone(phone) : chatId)
    chatActions.upsert({ id: chatId, name, phone })
  }

  return chatId
}

export function handleNotification(body: unknown): HandleResult {
  const parsed = notificationSchema.safeParse(body)
  if (!parsed.success) {
    const typeWebhook =
      typeof body === 'object' && body !== null && 'typeWebhook' in body
        ? String(body.typeWebhook)
        : undefined
    return { kind: 'ignored', typeWebhook }
  }

  const notification = parsed.data

  if (notification.typeWebhook === 'outgoingMessageStatus') {
    const status = toMessageStatus(notification.status)
    if (status) messageActions.setStatus(notification.chatId, notification.idMessage, status)
    return { kind: 'status', chatId: notification.chatId, messageId: notification.idMessage }
  }

  const chatId = resolveChat(notification)
  const message = fromNotification(notification)
  messageActions.add(chatId, message)

  if (message.direction === 'in' && activeChatStore.getState() !== chatId) {
    chatActions.incrementUnread(chatId)
  }

  return { kind: 'message', chatId, messageId: message.id }
}
