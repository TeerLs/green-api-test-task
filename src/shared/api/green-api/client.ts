import type { z } from 'zod'

import { LocalizedError, type TranslationKey } from '@/shared/i18n'

export interface GreenApiCredentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export class GreenApiError extends LocalizedError {
  readonly status: number

  constructor(key: TranslationKey, status: number) {
    super(key, { status })
    this.name = 'GreenApiError'
    this.status = status
  }
}

const STATUS_KEYS: Record<number, TranslationKey> = {
  400: 'errors.api.badRequest',
  401: 'errors.api.unauthorized',
  403: 'errors.api.forbidden',
  404: 'errors.api.notFound',
  429: 'errors.api.tooManyRequests',
  466: 'errors.api.quotaExceeded',
}

export function statusErrorKey(status: number): TranslationKey {
  if (STATUS_KEYS[status]) return STATUS_KEYS[status]
  if (status >= 500) return 'errors.api.server'
  return 'errors.api.unknown'
}

interface RequestOptions<S extends z.ZodType> {
  method: 'GET' | 'POST' | 'DELETE'
  apiMethod: string
  schema: S
  body?: unknown
  query?: Record<string, string | number>
  pathSuffix?: string
  signal?: AbortSignal
}

export function buildUrl(
  { apiUrl, idInstance, apiTokenInstance }: GreenApiCredentials,
  apiMethod: string,
  pathSuffix?: string,
  query?: Record<string, string | number>,
) {
  const base = apiUrl.trim().replace(/\/+$/, '')
  const suffix = pathSuffix ? `/${encodeURIComponent(pathSuffix)}` : ''
  const url = new URL(`${base}/waInstance${idInstance}/${apiMethod}/${apiTokenInstance}${suffix}`)
  Object.entries(query ?? {}).forEach(([key, value]) => url.searchParams.set(key, String(value)))
  return url.toString()
}

const isAbortError = (error: unknown) => error instanceof Error && error.name === 'AbortError'

export async function request<S extends z.ZodType>(
  credentials: GreenApiCredentials,
  { method, apiMethod, schema, body, query, pathSuffix, signal }: RequestOptions<S>,
): Promise<z.infer<S>> {
  let response: Response
  try {
    response = await fetch(buildUrl(credentials, apiMethod, pathSuffix, query), {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new GreenApiError('errors.api.network', 0)
  }

  if (!response.ok) throw new GreenApiError(statusErrorKey(response.status), response.status)

  const text = await response.text()
  let json: unknown
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    throw new GreenApiError('errors.api.invalidJson', response.status)
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) throw new GreenApiError('errors.api.invalidResponse', response.status)
  return parsed.data
}
