import type { QueryClient } from '@tanstack/react-query'

import { sessionActions } from '@/entities/session'

export function signOut(queryClient: QueryClient) {
  queryClient.cancelQueries()
  queryClient.clear()
  sessionActions.signOut()
}
