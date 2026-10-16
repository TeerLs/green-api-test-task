import { request, type GreenApiCredentials } from './client'
import {
  checkAccountResponseSchema,
  checkWhatsappResponseSchema,
  deleteNotificationResponseSchema,
  getChatHistoryResponseSchema,
  getStateInstanceResponseSchema,
  receiveNotificationResponseSchema,
  sendMessageResponseSchema,
} from './schemas'

export const getStateInstance = (credentials: GreenApiCredentials, signal?: AbortSignal) =>
  request(credentials, {
    method: 'GET',
    apiMethod: 'getStateInstance',
    schema: getStateInstanceResponseSchema,
    signal,
  })

export const sendMessage = (
  credentials: GreenApiCredentials,
  payload: { chatId: string; message: string },
) =>
  request(credentials, {
    method: 'POST',
    apiMethod: 'sendMessage',
    schema: sendMessageResponseSchema,
    body: payload,
  })

export const checkAccount = (credentials: GreenApiCredentials, phoneNumber: string) =>
  request(credentials, {
    method: 'POST',
    apiMethod: 'checkAccount',
    schema: checkAccountResponseSchema,
    body: { phoneNumber: Number(phoneNumber) },
  })

export const checkWhatsapp = (credentials: GreenApiCredentials, phoneNumber: string) =>
  request(credentials, {
    method: 'POST',
    apiMethod: 'checkWhatsapp',
    schema: checkWhatsappResponseSchema,
    body: { phoneNumber: Number(phoneNumber) },
  })

export const getChatHistory = (
  credentials: GreenApiCredentials,
  payload: { chatId: string; count?: number },
  signal?: AbortSignal,
) =>
  request(credentials, {
    method: 'POST',
    apiMethod: 'getChatHistory',
    schema: getChatHistoryResponseSchema,
    body: payload,
    signal,
  })

export const receiveNotification = (
  credentials: GreenApiCredentials,
  { receiveTimeout, signal }: { receiveTimeout?: number; signal?: AbortSignal } = {},
) =>
  request(credentials, {
    method: 'GET',
    apiMethod: 'receiveNotification',
    schema: receiveNotificationResponseSchema,
    query: receiveTimeout ? { receiveTimeout } : undefined,
    signal,
  })

export const deleteNotification = (credentials: GreenApiCredentials, receiptId: number) =>
  request(credentials, {
    method: 'DELETE',
    apiMethod: 'deleteNotification',
    schema: deleteNotificationResponseSchema,
    pathSuffix: String(receiptId),
  })
