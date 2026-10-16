import { expect, test } from '@playwright/test'

import { mockGreenApi, signIn } from './fixtures/green-api-mock'

test.skip(!process.env.SCREENSHOTS, 'set SCREENSHOTS=1 to regenerate screenshots')
test.use({ viewport: { width: 1360, height: 820 } })

for (const theme of ['light', 'dark'] as const) {
  test(`screenshots ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    const api = await mockGreenApi(page)

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
    await page.screenshot({ path: `docs/screenshots/login-${theme}.png` })

    await signIn(page)
    await page.getByRole('button', { name: 'Новый чат' }).click()
    await page.getByLabel('Номер телефона').fill('+7 999 123-45-67')
    await page.getByLabel(/Имя контакта/).fill('Анна Петрова')
    await page.getByRole('button', { name: 'Создать чат' }).click()

    api.pushIncomingText({
      chatId: '20000000',
      text: 'Добрый вечер! Документы готовы',
      senderName: 'Борис Иванов',
    })
    api.pushIncomingText({
      chatId: '30000000',
      text: 'Встречаемся в клубе в 19:00',
      senderName: 'Вера',
    })

    const composer = page.getByLabel('Текст сообщения')
    await composer.fill('Добрый день! Пишу через GREEN-API 🌿')
    await composer.press('Enter')
    api.pushIncomingText({
      chatId: '10000000',
      text: 'Здравствуйте! Сообщение получила, всё работает 👌',
      senderName: 'Анна Петрова',
    })
    await expect(page.locator('[data-direction="in"]')).toHaveCount(1)
    api.pushNotification({
      typeWebhook: 'outgoingMessageStatus',
      chatId: '10000000',
      idMessage: 'MSG1',
      status: 'read',
      timestamp: 1,
    })
    await composer.fill('Отлично, спасибо!')
    await composer.press('Enter')
    await page
      .locator('[data-sonner-toast]')
      .evaluateAll((toasts) => toasts.forEach((t) => t.remove()))
    await page.waitForTimeout(800)
    await page.screenshot({ path: `docs/screenshots/chat-${theme}.png` })

    if (theme === 'light') {
      await page.getByRole('button', { name: 'Switch to English' }).click()
      await page.getByTestId('chat-list-item').filter({ hasText: 'Борис' }).click()
      await page.waitForTimeout(400)
      await page.screenshot({ path: 'docs/screenshots/chat-en.png' })
    }
  })
}
