import { expect, test } from '@playwright/test'

import { mockGreenApi, signIn } from './fixtures/green-api-mock'

test.describe('Опрос уведомлений', () => {
  test('не заваливает сервер запросами, если он сразу отвечает пустой очередью', async ({
    page,
  }) => {
    const api = await mockGreenApi(page, { emptyPollDelayMs: 0 })
    await signIn(page)
    await expect(page.getByText('В сети')).toBeVisible()

    const before = api.stats.receiveCalls
    await page.waitForTimeout(6_000)
    expect(api.stats.receiveCalls - before).toBeLessThanOrEqual(2)
  })

  test('при честном long polling новое сообщение приходит сразу', async ({ page }) => {
    const api = await mockGreenApi(page)
    await signIn(page)
    await expect(page.getByText('В сети').or(page.getByText('Подключение…'))).toBeVisible()

    const before = api.stats.receiveCalls
    api.pushIncomingText({ chatId: '20000000', text: 'Мгновенно', senderName: 'Борис' })
    await expect(page.getByTestId('chat-list-item').filter({ hasText: 'Мгновенно' })).toBeVisible({
      timeout: 2_000,
    })
    expect(api.stats.receiveCalls - before).toBeLessThanOrEqual(2)
  })

  test('показывает, что инстанс не авторизован', async ({ page }) => {
    await mockGreenApi(page, { stateInstance: 'notAuthorized' })
    await signIn(page)
    await expect(page.locator('[data-state="warning"]')).toHaveText('Инстанс не авторизован')
  })
})
