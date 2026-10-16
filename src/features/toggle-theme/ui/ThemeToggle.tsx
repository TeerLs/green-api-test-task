import { MoonIcon, SunIcon } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { toggleTheme, useTheme } from '@/shared/lib/theme'
import { Button } from '@/shared/ui/button'

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const label = theme === 'dark' ? t('common.themeLight') : t('common.themeDark')

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={className}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
