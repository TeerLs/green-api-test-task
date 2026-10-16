import { getErrorMessage, i18n } from '@/shared/i18n'

import { buildUrl, GreenApiError } from './client'
import { receiveNotification, sendMessage } from './methods'

const credentials = {
  apiUrl: 'https://3100.api.green-api.com/',
  idInstance: '3100123456',
  apiTokenInstance: 'token1234567890abcdef',
}

function mockFetch(status: number, body: string) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  })
  globalThis.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

describe('buildUrl', () => {
  it('builds a GREEN-API method url and trims trailing slashes', () => {
    expect(buildUrl(credentials, 'sendMessage')).toBe(
      'https://3100.api.green-api.com/waInstance3100123456/sendMessage/token1234567890abcdef',
    )
  })

  it('appends path suffix and query params', () => {
    expect(buildUrl(credentials, 'deleteNotification', '42')).toMatch(
      /\/deleteNotification\/token1234567890abcdef\/42$/,
    )
    expect(buildUrl(credentials, 'receiveNotification', undefined, { receiveTimeout: 20 })).toMatch(
      /\?receiveTimeout=20$/,
    )
  })
})

describe('request', () => {
  it('sends JSON body and validates the response with zod', async () => {
    const fetchMock = mockFetch(200, JSON.stringify({ idMessage: 'BAE5F4886F6F2D05' }))

    await expect(
      sendMessage(credentials, { chatId: '10000000', message: 'Привет' }),
    ).resolves.toEqual({ idMessage: 'BAE5F4886F6F2D05' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ chatId: '10000000', message: 'Привет' })
  })

  it('treats an empty receiveNotification body as "no notifications"', async () => {
    mockFetch(200, '')
    await expect(receiveNotification(credentials)).resolves.toBeNull()
  })

  it('maps HTTP errors to localized GreenApiError', async () => {
    mockFetch(401, 'Unauthorized')
    const error = await sendMessage(credentials, { chatId: '1', message: 'x' }).catch((e) => e)
    expect(error).toBeInstanceOf(GreenApiError)
    expect(error).toMatchObject({ status: 401, key: 'errors.api.unauthorized' })
    expect(getErrorMessage(error)).toBe('Неверный idInstance или apiTokenInstance')

    await i18n.changeLanguage('en')
    expect(getErrorMessage(error)).toBe('Wrong idInstance or apiTokenInstance')
  })

  it('rejects responses that do not match the schema', async () => {
    mockFetch(200, JSON.stringify({ unexpected: true }))
    await expect(sendMessage(credentials, { chatId: '1', message: 'x' })).rejects.toMatchObject({
      key: 'errors.api.invalidResponse',
    })
  })

  it('wraps network failures', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(sendMessage(credentials, { chatId: '1', message: 'x' })).rejects.toMatchObject({
      status: 0,
    })
  })
})
