import { createStore, useStore } from '@/shared/lib/store'

import { credentialsSchema, type Credentials } from './schema'

export const sessionStore = createStore<Credentials | null>({
  key: 'session',
  namespace: 'app',
  schema: credentialsSchema.nullable(),
  initial: () => null,
})

export const useSession = () => useStore(sessionStore, (session) => session)

export function useRequiredSession(): Credentials {
  const session = useSession()
  if (!session) throw new Error('useRequiredSession must be used inside an authenticated area')
  return session
}

export const sessionActions = {
  signIn: (credentials: Credentials) => sessionStore.setState(credentials),
  signOut: () => sessionStore.reset(),
}
