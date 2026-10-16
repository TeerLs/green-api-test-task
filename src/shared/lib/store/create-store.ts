import { useSyncExternalStore } from 'react'
import type { z } from 'zod'

type Listener = () => void
type Updater<T> = T | ((prev: T) => T)

export interface Store<T> {
  getState: () => T
  setState: (updater: Updater<T>) => void
  subscribe: (listener: Listener) => () => void
  setNamespace: (namespace: string | null) => void
  reset: () => void
}

interface StoreOptions<T> {
  initial: () => T
  key?: string
  schema?: z.ZodType<T>
  namespace?: string | null
}

const STORAGE_PREFIX = 'green-max'

function readStorage(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch {
    return undefined
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    if (value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

export function createStore<T>({
  initial,
  key,
  schema,
  namespace = null,
}: StoreOptions<T>): Store<T> {
  let currentNamespace = namespace
  const listeners = new Set<Listener>()

  const storageKey = () =>
    key && currentNamespace !== null ? `${STORAGE_PREFIX}:${key}:${currentNamespace}` : null

  const load = (): T => {
    const sk = storageKey()
    if (!sk || !schema) return initial()
    const parsed = schema.safeParse(readStorage(sk))
    return parsed.success ? parsed.data : initial()
  }

  let state = load()
  const emit = () => listeners.forEach((listener) => listener())

  return {
    getState: () => state,
    setState(updater) {
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(state) : updater
      if (Object.is(next, state)) return
      state = next
      const sk = storageKey()
      if (sk) writeStorage(sk, state)
      emit()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setNamespace(nextNamespace) {
      if (nextNamespace === currentNamespace) return
      currentNamespace = nextNamespace
      state = load()
      emit()
    },
    reset() {
      const sk = storageKey()
      if (sk) writeStorage(sk, undefined)
      state = initial()
      emit()
    },
  }
}

export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()))
}
