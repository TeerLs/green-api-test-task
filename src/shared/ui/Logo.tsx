import { cn } from '@/shared/lib/utils'

interface LogoProps {
  className?: string
  inverted?: boolean
}

export function Logo({ className, inverted = false }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full font-serif text-lg italic ring-1 ring-gold/70 ring-offset-2',
          inverted
            ? 'bg-hero-foreground text-hero ring-offset-hero'
            : 'bg-primary text-primary-foreground ring-offset-background',
        )}
      >
        G
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-lg font-semibold tracking-tight">Green Chat</span>
        <span className="text-[0.625rem] font-medium tracking-[0.25em] text-gold uppercase">
          GREEN-API
        </span>
      </span>
    </span>
  )
}
