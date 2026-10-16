import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'

import { getInitials } from '../lib/initials'

const TONES = [
  'bg-[oklch(0.42_0.06_160)] text-[oklch(0.97_0.014_88)]',
  'bg-[oklch(0.42_0.1_22)] text-[oklch(0.97_0.014_88)]',
  'bg-[oklch(0.38_0.06_255)] text-[oklch(0.97_0.014_88)]',
  'bg-[oklch(0.7_0.08_70)] text-[oklch(0.25_0.03_60)]',
  'bg-[oklch(0.55_0.07_120)] text-[oklch(0.98_0.01_100)]',
  'bg-[oklch(0.45_0.025_230)] text-[oklch(0.97_0.014_88)]',
]

function hash(value: string) {
  let result = 0
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0
  return result
}

interface ChatAvatarProps {
  id: string
  name: string
  className?: string
}

export function ChatAvatar({ id, name, className }: ChatAvatarProps) {
  return (
    <Avatar
      className={cn('size-11 ring-1 ring-gold/40 ring-offset-2 ring-offset-background', className)}
    >
      <AvatarFallback
        className={cn('font-serif text-sm font-semibold', TONES[hash(id) % TONES.length])}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
