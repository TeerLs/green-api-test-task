import { z } from 'zod'

import { createStore, useStore } from '../store'

export type Theme = 'light' | 'dark'

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches

export const themeStore = createStore<Theme>({
  key: 'theme',
  namespace: 'app',
  schema: z.enum(['light', 'dark']),
  initial: () => (prefersDark() ? 'dark' : 'light'),
})

export const useTheme = () => useStore(themeStore, (theme) => theme)

export const toggleTheme = () =>
  themeStore.setState((theme) => (theme === 'dark' ? 'light' : 'dark'))
