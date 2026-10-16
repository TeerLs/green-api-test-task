import type { Page, Route } from '@playwright/test'

export const API_URL = 'https://api.green-api.com'
export const ID_INSTANCE = '3100123456'
export const TOKEN = 'd75b3a66374942c5b3c019c698abc2067e151558acbd412c9f'

interface MockOptions {
  stateInstance?: string
  status?: number
  checkAccount?: { exist: boolean; chatId: string }
  checkWhatsapp?: { existsWhatsapp: boolean }
  emptyPollDelayMs?: number
}

export async function mockGreenApi(page: Page, options: MockOptions = {}) {
  const queue: { receiptId: number; body: unknown }[] = []
  const sent: { chatId: string; message: string }[] = []
  let receiptId = 0
  let messageId = 0
  const stats = { receiveCalls: 0 }
  const waiters = new Set<() => void>()

  const waitForNotification = (ms: number) =>
    new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer)
        waiters.delete(done)
        resolve()
      }
      const timer = setTimeout(done, ms)
      waiters.add(done)
    })

  const json = (route: Route, body: unknown) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(body),
    })

  await page.route(`${API_URL}/waInstance*/**`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    if (options.status && options.status !== 200) {
      return route.fulfill({
        status: options.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: '',
      })
    }

    const method = new URL(route.request().url()).pathname.split('/')[2]
    switch (method) {
      case 'getStateInstance':
        return json(route, { stateInstance: options.stateInstance ?? 'authorized' })
      case 'checkAccount':
        return json(route, options.checkAccount ?? { exist: true, chatId: '10000000' })
      case 'checkWhatsapp':
        return json(route, options.checkWhatsapp ?? { existsWhatsapp: true })
      case 'getChatHistory':
        return json(route, [])
      case 'sendMessage': {
        sent.push(route.request().postDataJSON())
        return json(route, { idMessage: `MSG${++messageId}` })
      }
      case 'receiveNotification': {
        stats.receiveCalls += 1
        if (!queue[0]) await waitForNotification(options.emptyPollDelayMs ?? 20_000)
        const next = queue[0]
        if (!next) {
          return route.fulfill({
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: '',
          })
        }
        return json(route, next)
      }
      case 'deleteNotification': {
        const id = Number(new URL(route.request().url()).pathname.split('/').at(-1))
        const index = queue.findIndex((item) => item.receiptId === id)
        if (index !== -1) queue.splice(index, 1)
        return json(route, { result: index !== -1 })
      }
      default:
        return route.fulfill({ status: 404, headers: { 'Access-Control-Allow-Origin': '*' } })
    }
  })

  return {
    sent,
    stats,
    pushNotification(body: unknown) {
      queue.push({ receiptId: ++receiptId, body })
      waiters.forEach((wake) => wake())
    },
    pushIncomingText({
      chatId,
      text,
      senderName,
    }: {
      chatId: string
      text: string
      senderName: string
    }) {
      this.pushNotification({
        typeWebhook: 'incomingMessageReceived',
        instanceData: {
          idInstance: Number(ID_INSTANCE),
          wid: '79990000000@c.us',
          typeInstance: 'v3',
        },
        timestamp: Math.ceil(Date.now() / 1000),
        idMessage: `IN${receiptId + 1}`,
        senderData: {
          chatId,
          chatName: senderName,
          sender: chatId,
          senderName,
          senderPhoneNumber: 0,
        },
        messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
      })
    },
  }
}

export async function signIn(page: Page, messenger?: 'WhatsApp' | 'Telegram' | 'MAX') {
  await page.goto('/')
  if (messenger) await page.getByRole('radio', { name: messenger }).click()
  await page.getByLabel('idInstance').fill(ID_INSTANCE)
  await page.getByLabel('apiTokenInstance').fill(TOKEN)
  await page.getByRole('button', { name: 'Войти' }).click()
}
