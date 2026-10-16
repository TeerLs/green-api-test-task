import { CheckCheckIcon, CheckIcon, CircleAlertIcon, ClockIcon } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

import type { MessageStatus } from '../model/message-store'

export function MessageStatusIcon({ status }: { status: MessageStatus }) {
  const { t } = useTranslation()
  const label = t(`message.status.${status}`)
  const className = 'size-3.5 shrink-0'
  const icon = {
    pending: <ClockIcon className={className} />,
    sent: <CheckIcon className={className} />,
    delivered: <CheckCheckIcon className={className} />,
    read: <CheckCheckIcon className={cn(className, 'text-gold')} />,
    failed: <CircleAlertIcon className={cn(className, 'text-destructive')} />,
  }[status]

  return (
    <span role="img" aria-label={label} title={label} data-status={status}>
      {icon}
    </span>
  )
}
