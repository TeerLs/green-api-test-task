import { useQuery } from '@tanstack/react-query'

import { useRequiredSession } from '@/entities/session'
import { deleteNotification, receiveNotification } from '@/shared/api'
import { RECEIVE_TIMEOUT_SECONDS } from '@/shared/config'

import { handleNotification, type HandleResult } from '../lib/handle-notification'
import { nextPollDelay, type PollOutcome } from '../lib/poll-delay'

interface PollResult extends PollOutcome {
  result: HandleResult | null
}

const isHidden = () => typeof document !== 'undefined' && document.visibilityState === 'hidden'

export function useNotificationsPolling({ enabled = true }: { enabled?: boolean } = {}) {
  const credentials = useRequiredSession()

  return useQuery({
    queryKey: ['green-api', credentials.idInstance, 'notifications'],
    queryFn: async ({ signal }): Promise<PollResult> => {
      const startedAt = Date.now()
      const notification = await receiveNotification(credentials, {
        receiveTimeout: RECEIVE_TIMEOUT_SECONDS,
        signal,
      })
      if (!notification) {
        return { received: false, durationMs: Date.now() - startedAt, result: null }
      }

      const result = handleNotification(notification.body)
      await deleteNotification(credentials, notification.receiptId)
      return { received: true, durationMs: Date.now() - startedAt, result }
    },
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnMount: false,
    refetchInterval: (query) =>
      nextPollDelay(query.state.data, {
        failed: query.state.status === 'error',
        hidden: isHidden(),
      }),
    refetchIntervalInBackground: true,
    retryDelay: (attempt) => Math.min(2_000 * 2 ** attempt, 30_000),
  })
}
