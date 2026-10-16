import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { sessionStore } from '@/entities/session'

import { SignInForm } from './SignInForm'

jest.mock('sonner', () => ({ toast: { success: jest.fn(), warning: jest.fn(), error: jest.fn() } }))

const TOKEN = 'd75b3a66374942c5b3c019c698abc2067e151558acbd412c9f'

function renderForm() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <SignInForm />
    </QueryClientProvider>,
  )
}

function mockFetch(status: number, body: unknown) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: status === 200,
    status,
    text: async () => JSON.stringify(body),
  })
  globalThis.fetch = fetchMock as unknown as typeof fetch
  return fetchMock
}

beforeEach(() => sessionStore.setState(null))

describe('SignInForm', () => {
  it('validates fields with zod before calling the API', async () => {
    const fetchMock = mockFetch(200, {})
    renderForm()

    await userEvent.type(screen.getByLabelText('idInstance'), 'abc')
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByText('idInstance состоит только из цифр')).toBeInTheDocument()
    expect(screen.getByText('Укажите apiTokenInstance')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('checks the instance state and saves the session', async () => {
    const fetchMock = mockFetch(200, { stateInstance: 'authorized' })
    renderForm()

    expect(screen.getByRole('radio', { name: 'MAX' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'WhatsApp' }))
    await userEvent.type(screen.getByLabelText('idInstance'), '3100123456')
    await userEvent.type(screen.getByLabelText('apiTokenInstance'), TOKEN)
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))

    await waitFor(() =>
      expect(sessionStore.getState()).toEqual({
        messenger: 'whatsapp',
        apiUrl: 'https://api.green-api.com',
        idInstance: '3100123456',
        apiTokenInstance: TOKEN,
      }),
    )
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `https://api.green-api.com/waInstance3100123456/getStateInstance/${TOKEN}`,
    )
  })

  it('shows API errors', async () => {
    mockFetch(401, {})
    renderForm()

    await userEvent.type(screen.getByLabelText('idInstance'), '3100123456')
    await userEvent.type(screen.getByLabelText('apiTokenInstance'), TOKEN)
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Неверный idInstance или apiTokenInstance',
    )
    expect(sessionStore.getState()).toBeNull()
  })
})
