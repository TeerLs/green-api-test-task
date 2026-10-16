import { SignInForm } from '@/features/auth'
import { LanguageSwitcher } from '@/features/switch-language'
import { ThemeToggle } from '@/features/toggle-theme'
import { GREEN_API_CONSOLE_URL } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { Logo } from '@/shared/ui/Logo'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-hero hero-pattern p-12 text-hero-foreground lg:flex">
        <Logo inverted />

        <div className="flex max-w-lg flex-col gap-6">
          <span className="text-xs font-medium tracking-[0.3em] text-gold uppercase">
            {t('hero.eyebrow')}
          </span>
          <h1 className="font-serif text-5xl leading-[1.1] font-medium text-balance">
            {t('hero.titleStart')}
            <em className="mt-4 block text-3xl leading-snug text-gold">{t('hero.titleAccent')}</em>
          </h1>
          <div className="h-px w-24 bg-gold/60" />
          <p className="max-w-md text-base leading-relaxed opacity-80">{t('hero.description')}</p>
        </div>

        <p className="text-xs opacity-60">{t('hero.footer')}</p>

        <div
          className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full border border-gold/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -bottom-16 size-96 rounded-full border border-gold/15"
          aria-hidden
        />
      </section>

      <section className="relative flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute top-4 right-4 flex items-center">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="flex w-full max-w-sm flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Logo className="mb-4 lg:hidden" />
            <h2 className="font-serif text-3xl font-medium">{t('auth.title')}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('auth.description')}{' '}
              <a
                href={GREEN_API_CONSOLE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline decoration-gold underline-offset-4"
              >
                {t('auth.consoleLink')}
              </a>
              {t('auth.descriptionSuffix')}
            </p>
          </div>
          <SignInForm />
        </div>
      </section>
    </main>
  )
}
