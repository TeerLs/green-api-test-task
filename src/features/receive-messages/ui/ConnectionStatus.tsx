import { useQuery } from '@tanstack/react-query'

import { useRequiredSession } from '@/entities/session'
import { getStateInstance } from '@/shared/api'
import { getErrorMessage, useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

import { useNotificationsPolling } from '../model/use-notifications-polling'

const STATE_REFRESH_MS = 60_000

export function ConnectionStatus({ className }: { className?: string }) {
  const { t } = useTranslation()
  const credentials = useRequiredSession()
  const polling = useNotificationsPolling()
  const instance = useQuery({
    queryKey: ['green-api', credentials.idInstance, 'state'],
    queryFn: ({ signal }) => getStateInstance(credentials, signal),
    refetchInterval: STATE_REFRESH_MS,
  })

  const stateInstance = instance.data?.stateInstance
  const error = polling.error ?? instance.error
  const state = error
    ? 'error'
    : !stateInstance
      ? 'connecting'
      : stateInstance === 'authorized'
        ? 'online'
        : 'warning'

  const label = {
    online: t('connection.online'),
    connecting: t('connection.connecting'),
    warning:
      stateInstance === 'notAuthorized'
        ? t('connection.notAuthorized')
        : t('connection.instanceState', { state: stateInstance ?? '' }),
    error: error ? getErrorMessage(error) : t('connection.offline'),
  }[state]

  return (
    <span
      className={cn('flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground', className)}
      data-state={state}
      title={label}
      aria-live="polite"
    >
      <span
        className={cn(
          'size-2 shrink-0 rounded-full',
          state === 'online' &&
            'bg-[oklch(0.62_0.12_150)] shadow-[0_0_0_3px] shadow-[oklch(0.62_0.12_150)]/20',
          state === 'connecting' && 'animate-pulse bg-gold',
          state === 'warning' && 'bg-gold',
          state === 'error' && 'bg-destructive',
        )}
      />
      <span className="truncate">{label}</span>
    </span>
  )
}
