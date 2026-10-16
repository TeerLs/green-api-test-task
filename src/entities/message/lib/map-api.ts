import type { ChatHistoryItem, MessageNotification } from '@/shared/api'

import type { Message, MessageStatus } from '../model/message-store'

const API_STATUS: Record<string, MessageStatus> = {
  pending: 'pending',
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  noAccount: 'failed',
  notInGroup: 'failed',
  yellowCard: 'failed',
}

export const toMessageStatus = (status: string | undefined): MessageStatus | undefined =>
  status ? API_STATUS[status] : undefined

export function fromNotification(notification: MessageNotification): Message {
  const { messageData, senderData, typeWebhook } = notification
  const text = messageData.textMessageData?.textMessage ?? messageData.extendedTextMessageData?.text
  const direction = typeWebhook === 'incomingMessageReceived' ? 'in' : 'out'

  return {
    id: notification.idMessage,
    chatId: senderData.chatId,
    text: text ?? '',
    unsupported: text === undefined || undefined,
    direction,
    timestamp: notification.timestamp * 1000,
    status: direction === 'out' ? 'sent' : undefined,
    senderName: direction === 'in' ? senderData.senderName : undefined,
  }
}

export function fromHistoryItem(item: ChatHistoryItem): Message {
  const text = item.textMessage ?? item.extendedTextMessage?.text
  const direction = item.type === 'incoming' ? 'in' : 'out'

  return {
    id: item.idMessage,
    chatId: item.chatId,
    text: text ?? '',
    unsupported: text === undefined || undefined,
    direction,
    timestamp: item.timestamp * 1000,
    status: direction === 'out' ? (toMessageStatus(item.statusMessage) ?? 'sent') : undefined,
    senderName: item.senderName,
  }
}
