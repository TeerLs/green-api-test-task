import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'
import { useId, useState, type SubmitEvent, type ReactNode } from 'react'
import { z } from 'zod'

import { credentialsSchema, type CredentialsInput } from '@/entities/session'
import { DEFAULT_API_URL, DEFAULT_MESSENGER, type Messenger } from '@/shared/config'
import { getErrorMessage, translate, useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import { useSignIn } from '../model/use-sign-in'

import { MessengerPicker } from './MessengerPicker'

type TextField = 'apiUrl' | 'idInstance' | 'apiTokenInstance'
type FieldErrors = Partial<Record<TextField, string>>

export function SignInForm() {
  const id = useId()
  const { t } = useTranslation()
  const signIn = useSignIn()
  const [values, setValues] = useState<CredentialsInput & { messenger: Messenger }>({
    messenger: DEFAULT_MESSENGER,
    apiUrl: DEFAULT_API_URL,
    idInstance: '',
    apiTokenInstance: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [tokenVisible, setTokenVisible] = useState(false)

  const setField = (field: TextField) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = credentialsSchema.safeParse(values)
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error)
      setErrors({
        apiUrl: fieldErrors.apiUrl?.[0],
        idInstance: fieldErrors.idInstance?.[0],
        apiTokenInstance: fieldErrors.apiTokenInstance?.[0],
      })
      return
    }
    signIn.mutate(parsed.data)
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
      aria-label={t('auth.formLabel')}
    >
      <MessengerPicker
        value={values.messenger}
        onChange={(messenger) => setValues((prev) => ({ ...prev, messenger }))}
      />

      <Field id={`${id}-instance`} label="idInstance" error={errors.idInstance}>
        <Input
          id={`${id}-instance`}
          inputMode="numeric"
          autoComplete="username"
          placeholder="3100123456"
          value={values.idInstance}
          onChange={(event) => setField('idInstance')(event.target.value)}
          aria-invalid={Boolean(errors.idInstance)}
          className="h-11"
        />
      </Field>

      <Field id={`${id}-token`} label="apiTokenInstance" error={errors.apiTokenInstance}>
        <div className="relative">
          <Input
            id={`${id}-token`}
            type={tokenVisible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd412c9f"
            value={values.apiTokenInstance}
            onChange={(event) => setField('apiTokenInstance')(event.target.value)}
            aria-invalid={Boolean(errors.apiTokenInstance)}
            className="h-11 pr-11 font-mono text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setTokenVisible((visible) => !visible)}
            aria-label={tokenVisible ? t('auth.hideToken') : t('auth.showToken')}
          >
            {tokenVisible ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>
      </Field>

      <Field id={`${id}-url`} label="apiUrl" hint={t('auth.apiUrlHint')} error={errors.apiUrl}>
        <Input
          id={`${id}-url`}
          type="url"
          value={values.apiUrl}
          onChange={(event) => setField('apiUrl')(event.target.value)}
          aria-invalid={Boolean(errors.apiUrl)}
          className="h-11 font-mono text-sm"
        />
      </Field>

      {signIn.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {getErrorMessage(signIn.error)}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-1 h-11 text-base" disabled={signIn.isPending}>
        {signIn.isPending && <Loader2Icon className="animate-spin" />}
        {t('auth.submit')}
      </Button>
    </form>
  )
}

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-mono text-xs tracking-wide text-foreground/80">
        {label}
      </Label>
      {children}
      {(error || hint) && (
        <p className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
          {error ? translate(error) : hint}
        </p>
      )}
    </div>
  )
}
