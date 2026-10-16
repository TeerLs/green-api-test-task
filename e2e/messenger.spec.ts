import { expect, test } from '@playwright/test'

import { mockGreenApi, signIn } from './fixtures/green-api-mock'

test.describe('Вход', () => {
  test('показывает ошибки валидации', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Войти' }).click()
    await expect(page.getByText('Укажите idInstance')).toBeVisible()
    await expect(page.getByText('Укажите apiTokenInstance')).toBeVisible()
  })

  test('сообщает о неверных учётных данных', async ({ page }) => {
    await mockGreenApi(page, { status: 401 })
    await signIn(page)
    await expect(page.getByRole('alert')).toHaveText('Неверный idInstance или apiTokenInstance')
  })
})

test.describe('Локализация', () => {
  test('переключает интерфейс на английский и запоминает выбор', async ({ page, isMobile }) => {
    const api = await mockGreenApi(page)
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')

    await page.getByRole('button', { name: 'Switch to English' }).click()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Enter idInstance')).toBeVisible()

    await page.reload()
    await page.getByLabel('idInstance').fill('3100123456')
    await page
      .getByLabel('apiTokenInstance')
      .fill('d75b3a66374942c5b3c019c698abc2067e151558acbd412c9f')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Online')).toBeVisible()

    api.pushIncomingText({ chatId: '20000000', text: 'Hello!', senderName: 'Boris' })
    await page.getByTestId('chat-list-item').filter({ hasText: 'Boris' }).click()
    await expect(page.getByText('Today')).toBeVisible()
    await expect(page.getByLabel('Message text')).toBeVisible()

    if (isMobile) await page.getByRole('button', { name: 'Back to chats' }).click()
    await page.getByRole('button', { name: 'Переключить на русский' }).click()
    await expect(page.getByText('В сети')).toBeVisible()

    if (isMobile) await page.getByTestId('chat-list-item').filter({ hasText: 'Boris' }).click()
    await expect(page.getByText('Сегодня')).toBeVisible()
    await expect(page.getByLabel('Текст сообщения')).toBeVisible()
  })
})

test.describe('Мессенджеры', () => {
  test('WhatsApp: номер проверяется через checkWhatsapp, chatId — номер@c.us', async ({ page }) => {
    const api = await mockGreenApi(page)
    await signIn(page, 'WhatsApp')
    await expect(page.getByTestId('messenger-badge')).toHaveText('WhatsApp')

    await page.getByRole('button', { name: 'Новый чат' }).click()
    await expect(page.getByText('зарегистрированного в WhatsApp')).toBeVisible()
    await page.getByLabel('Номер телефона').fill('+44 7700 900123')
    await page.getByRole('button', { name: 'Создать чат' }).click()

    const composer = page.getByLabel('Текст сообщения')
    await composer.fill('Hello from GREEN-API')
    await composer.press('Enter')
    await expect(page.locator('[data-direction="out"]')).toContainText('Hello from GREEN-API')
    expect(api.sent).toEqual([{ chatId: '447700900123@c.us', message: 'Hello from GREEN-API' }])
  })

  test('WhatsApp: сообщает, если у номера нет WhatsApp', async ({ page }) => {
    await mockGreenApi(page, { checkWhatsapp: { existsWhatsapp: false } })
    await signIn(page, 'WhatsApp')

    await page.getByRole('button', { name: 'Новый чат' }).click()
    await page.getByLabel('Номер телефона').fill('+44 7700 900123')
    await page.getByRole('button', { name: 'Создать чат' }).click()
    await expect(page.getByRole('alert')).toHaveText('На этом номере нет аккаунта WhatsApp')
  })

  test('Telegram: международный номер и chatId из checkAccount', async ({ page }) => {
    const api = await mockGreenApi(page, { checkAccount: { exist: true, chatId: '555000' } })
    await signIn(page, 'Telegram')
    await expect(page.getByTestId('messenger-badge')).toHaveText('Telegram')

    await page.getByRole('button', { name: 'Новый чат' }).click()
    await page.getByLabel('Номер телефона').fill('+44 7700 900123')
    await page.getByRole('button', { name: 'Создать чат' }).click()

    const composer = page.getByLabel('Текст сообщения')
    await composer.fill('Привет из Telegram')
    await composer.press('Enter')
    await expect(page.locator('[data-direction="out"]')).toHaveCount(1)
    expect(api.sent).toEqual([{ chatId: '555000', message: 'Привет из Telegram' }])
  })

  test('MAX: принимает только номера +7 и +375', async ({ page }) => {
    await mockGreenApi(page)
    await signIn(page)

    await page.getByRole('button', { name: 'Новый чат' }).click()
    await page.getByLabel('Номер телефона').fill('+44 7700 900123')
    await page.getByRole('button', { name: 'Создать чат' }).click()
    await expect(page.getByRole('alert')).toHaveText(
      'Для MAX номер должен быть в формате +7XXXXXXXXXX или +375XXXXXXXXX',
    )
  })
})

test.describe('Чат', () => {
  test('полный сценарий: вход → новый чат → отправка → ответ получателя', async ({ page }) => {
    const api = await mockGreenApi(page)
    await signIn(page)

    await expect(page.getByText('В сети')).toBeVisible()

    await page.getByRole('button', { name: 'Новый чат' }).click()
    await page.getByLabel('Номер телефона').fill('+7 999 123-45-67')
    await page.getByLabel(/Имя контакта/).fill('Анна')
    await page.getByRole('button', { name: 'Создать чат' }).click()

    await expect(page.getByTestId('chat-title')).toHaveText('Анна')

    const composer = page.getByLabel('Текст сообщения')
    await composer.fill('Добрый день! Это тест GREEN-API')
    await composer.press('Enter')

    const outgoing = page.locator('[data-testid="message"][data-direction="out"]')
    await expect(outgoing).toHaveCount(1)
    await expect(outgoing).toContainText('Добрый день! Это тест GREEN-API')
    await expect(outgoing.getByRole('img', { name: 'Отправлено' })).toBeVisible()
    expect(api.sent).toEqual([{ chatId: '10000000', message: 'Добрый день! Это тест GREEN-API' }])

    api.pushIncomingText({ chatId: '10000000', text: 'Привет! Получила 👋', senderName: 'Анна' })
    const incoming = page.locator('[data-testid="message"][data-direction="in"]')
    await expect(incoming).toContainText('Привет! Получила 👋')

    api.pushNotification({
      typeWebhook: 'outgoingMessageStatus',
      chatId: '10000000',
      idMessage: 'MSG1',
      status: 'read',
      timestamp: Math.floor(Date.now() / 1000),
    })
    await expect(outgoing.getByRole('img', { name: 'Прочитано' })).toBeVisible()
  })

  test('сообщение от нового собеседника создаёт чат с непрочитанным', async ({
    page,
    isMobile,
  }) => {
    const api = await mockGreenApi(page)
    await signIn(page)

    api.pushIncomingText({ chatId: '20000000', text: 'Здравствуйте!', senderName: 'Борис' })

    const item = page.getByTestId('chat-list-item').filter({ hasText: 'Борис' })
    await expect(item).toContainText('Здравствуйте!')
    await expect(item.getByLabel('Непрочитанных: 1')).toBeVisible()

    await item.click()
    await expect(page.getByTestId('chat-title')).toHaveText('Борис')
    if (isMobile) await page.getByRole('button', { name: 'Назад к чатам' }).click()
    await expect(item.getByLabel(/Непрочитанных/)).toHaveCount(0)
  })

  test('сообщает, если у номера нет MAX', async ({ page }) => {
    await mockGreenApi(page, { checkAccount: { exist: false, chatId: '' } })
    await signIn(page)

    await page.getByRole('button', { name: 'Новый чат' }).click()
    await page.getByLabel('Номер телефона').fill('89991234567')
    await page.getByRole('button', { name: 'Создать чат' }).click()

    await expect(page.getByRole('alert')).toHaveText('На этом номере нет аккаунта MAX')
  })

  test('сессия и чаты сохраняются после перезагрузки, выход возвращает на логин', async ({
    page,
  }) => {
    const api = await mockGreenApi(page)
    await signIn(page)
    api.pushIncomingText({ chatId: '30000000', text: 'Не забудь', senderName: 'Вера' })
    await expect(page.getByTestId('chat-list-item').filter({ hasText: 'Вера' })).toBeVisible()

    await page.reload()
    await expect(page.getByTestId('chat-list-item').filter({ hasText: 'Вера' })).toBeVisible()

    await page.getByRole('button', { name: 'Аккаунт' }).click()
    await page.getByRole('menuitem', { name: 'Выйти' }).click()
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
  })
})
