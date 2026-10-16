import { useQueryClient } from '@tanstack/react-query'
import { ExternalLinkIcon, LogOutIcon, SettingsIcon } from 'lucide-react'

import { useRequiredSession } from '@/entities/session'
import { signOut } from '@/features/auth'
import { GREEN_API_CONSOLE_URL, MESSENGER_LABELS } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function AccountMenu() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { idInstance, messenger } = useRequiredSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('account.menu')}>
          <SettingsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-xs font-normal text-muted-foreground">{t('account.instance')}</span>
          <span className="font-mono text-sm">{idInstance}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {t('account.messenger')}: {MESSENGER_LABELS[messenger]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={GREEN_API_CONSOLE_URL} target="_blank" rel="noreferrer">
            <ExternalLinkIcon />
            {t('account.console')}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={() => signOut(queryClient)}>
          <LogOutIcon />
          {t('account.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
