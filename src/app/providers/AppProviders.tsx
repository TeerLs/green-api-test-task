import { QueryClientProvider } from '@tanstack/react-query'
import { useLayoutEffect, useState, type ReactNode } from 'react'

import { createQueryClient } from '@/shared/api'
import { useTheme } from '@/shared/lib/theme'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'

function ThemeSync() {
  const theme = useTheme()
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])
  return null
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ThemeSync />
        {children}
        <Toaster position="top-right" richColors={false} closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
