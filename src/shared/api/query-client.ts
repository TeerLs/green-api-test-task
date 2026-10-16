import { QueryClient } from '@tanstack/react-query'

import { GreenApiError } from './green-api'

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof GreenApiError && [401, 403].includes(error.status)) return false
          return failureCount < 2
        },
      },
      mutations: { retry: false },
    },
  })
