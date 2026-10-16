import { Loader2Icon, MessageSquarePlusIcon } from 'lucide-react'
import { useId, useMemo, useState, type SubmitEvent } from 'react'
import { z } from 'zod'

import { createPhoneSchema } from '@/entities/chat'
import { useRequiredSession } from '@/entities/session'
import { MESSENGER_LABELS, type Messenger } from '@/shared/config'
import { getErrorMessage, translate, useTranslation, type TranslationKey } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import { useCreateChat } from '../model/use-create-chat'

const NAME_TOO_LONG: TranslationKey = 'validation.nameTooLong'

const createFormSchema = (messenger: Messenger) =>
  z.object({
    phone: createPhoneSchema(messenger),
    name: z.string().trim().max(64, NAME_TOO_LONG).optional(),
  })

export function CreateChatDialog() {
  const id = useId()
  const { t } = useTranslation()
  const { messenger } = useRequiredSession()
  const formSchema = useMemo(() => createFormSchema(messenger), [messenger])
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [errorKey, setErrorKey] = useState<string>()

  const createChat = useCreateChat({ onCreated: () => handleOpenChange(false) })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setPhone('')
      setName('')
      setErrorKey(undefined)
      createChat.reset()
    }
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = formSchema.safeParse({ phone, name })
    if (!parsed.success) {
      setErrorKey(parsed.error.issues[0]?.message)
      return
    }
    createChat.mutate(parsed.data)
  }

  const message = errorKey
    ? translate(errorKey)
    : createChat.error
      ? getErrorMessage(createChat.error)
      : undefined

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={t('createChat.trigger')}
          title={t('createChat.trigger')}
        >
          <MessageSquarePlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium">
              {t('createChat.title')}
            </DialogTitle>
            <DialogDescription>
              {t('createChat.description', { messenger: MESSENGER_LABELS[messenger] })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-phone`}>{t('createChat.phone')}</Label>
            <Input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 999 123-45-67"
              value={phone}
              autoFocus
              onChange={(event) => {
                setPhone(event.target.value)
                setErrorKey(undefined)
              }}
              aria-invalid={Boolean(message)}
              className="h-11 text-base tabular-nums"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-name`}>
              {t('createChat.name')}{' '}
              <span className="font-normal text-muted-foreground">{t('createChat.optional')}</span>
            </Label>
            <Input
              id={`${id}-name`}
              placeholder={t('createChat.namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11"
            />
          </div>

          {message && (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" size="lg" className="h-10" disabled={createChat.isPending}>
              {createChat.isPending && <Loader2Icon className="animate-spin" />}
              {t('createChat.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
