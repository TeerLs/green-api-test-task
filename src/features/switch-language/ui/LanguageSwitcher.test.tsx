import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { i18n, useTranslation } from '@/shared/i18n'

import { LanguageSwitcher } from './LanguageSwitcher'

function Greeting() {
  const { t } = useTranslation()
  return <p>{t('auth.title')}</p>
}

describe('LanguageSwitcher', () => {
  it('toggles between Russian and English and remembers the choice', async () => {
    render(
      <>
        <LanguageSwitcher />
        <Greeting />
      </>,
    )

    expect(screen.getByText('Вход')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Switch to English' }))

    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(i18n.resolvedLanguage).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('green-max:language')).toBe('en')

    await userEvent.click(screen.getByRole('button', { name: 'Переключить на русский' }))
    expect(screen.getByText('Вход')).toBeInTheDocument()
  })
})
