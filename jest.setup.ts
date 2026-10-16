import '@testing-library/jest-dom'

import { i18n } from '@/shared/i18n'

beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage('ru')
})
