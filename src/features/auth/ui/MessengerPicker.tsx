import { useId } from 'react'

import { MESSENGER_LABELS, MESSENGERS, type Messenger } from '@/shared/config'
import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

interface MessengerPickerProps {
  value: Messenger
  onChange: (messenger: Messenger) => void
}

export function MessengerPicker({ value, onChange }: MessengerPickerProps) {
  const { t } = useTranslation()
  const labelId = useId()

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-sm font-medium">
        {t('auth.messenger')}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="grid grid-cols-3 gap-1 rounded-xl border bg-muted/60 p-1"
      >
        {MESSENGERS.map((messenger) => {
          const selected = messenger === value
          return (
            <button
              key={messenger}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(messenger)}
              className={cn(
                'h-9 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                selected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/70 hover:text-foreground',
              )}
            >
              {MESSENGER_LABELS[messenger]}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t('auth.messengerHint')}</p>
    </div>
  )
}
