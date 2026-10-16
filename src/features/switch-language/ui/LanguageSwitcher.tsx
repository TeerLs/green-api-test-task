import { changeLanguage, useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const current = i18n.resolvedLanguage === 'en' ? 'en' : 'ru'
  const next = current === 'en' ? 'ru' : 'en'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => void changeLanguage(next)}
      aria-label={t('common.switchLanguage')}
      title={t('common.switchLanguage')}
      data-testid="language-switcher"
      className={cn('font-mono text-[0.6875rem] font-semibold tracking-wider uppercase', className)}
    >
      {next}
    </Button>
  )
}
