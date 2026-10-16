import { z } from 'zod'

export const getStateInstanceResponseSchema = z.object({
  stateInstance: z.string(),
})

export const sendMessageResponseSchema = z.object({
  idMessage: z.string(),
})

export const checkAccountResponseSchema = z.object({
  exist: z.boolean(),
  chatId: z.string().optional().default(''),
})

export const checkWhatsappResponseSchema = z.object({
  existsWhatsapp: z.boolean(),
})

export const deleteNotificationResponseSchema = z.object({
  result: z.boolean(),
})

export const receiveNotificationResponseSchema = z
  .object({
    receiptId: z.number(),
    body: z.unknown(),
  })
  .nullable()

const senderDataSchema = z.object({
  chatId: z.string(),
  sender: z.string().optional(),
  chatName: z.string().optional(),
  senderName: z.string().optional(),
  senderContactName: z.string().optional(),
  senderPhoneNumber: z.union([z.number(), z.string()]).optional(),
})

const messageDataSchema = z.object({
  typeMessage: z.string(),
  textMessageData: z.object({ textMessage: z.string() }).optional(),
  extendedTextMessageData: z.object({ text: z.string() }).optional(),
})

export const messageNotificationSchema = z.object({
  typeWebhook: z.enum([
    'incomingMessageReceived',
    'outgoingMessageReceived',
    'outgoingAPIMessageReceived',
  ]),
  idMessage: z.string(),
  timestamp: z.number(),
  senderData: senderDataSchema,
  messageData: messageDataSchema,
})

export const statusNotificationSchema = z.object({
  typeWebhook: z.literal('outgoingMessageStatus'),
  idMessage: z.string(),
  chatId: z.string(),
  timestamp: z.number(),
  status: z.string(),
})

export const notificationSchema = z.discriminatedUnion('typeWebhook', [
  messageNotificationSchema,
  statusNotificationSchema,
])

export const chatHistoryItemSchema = z.object({
  type: z.enum(['incoming', 'outgoing']),
  idMessage: z.string(),
  timestamp: z.number(),
  typeMessage: z.string(),
  chatId: z.string(),
  textMessage: z.string().optional(),
  extendedTextMessage: z.object({ text: z.string() }).partial().optional(),
  senderName: z.string().optional(),
  statusMessage: z.string().optional(),
})

export const getChatHistoryResponseSchema = z.array(chatHistoryItemSchema)

export type MessageNotification = z.infer<typeof messageNotificationSchema>
export type StatusNotification = z.infer<typeof statusNotificationSchema>
export type Notification = z.infer<typeof notificationSchema>
export type ChatHistoryItem = z.infer<typeof chatHistoryItemSchema>
