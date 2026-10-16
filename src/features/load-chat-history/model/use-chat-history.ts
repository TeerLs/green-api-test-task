import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { fromHistoryItem, messageActions } from '@/entities/message'
import { useRequiredSession } from '@/entities/session'
import { getChatHistory } from '@/shared/api'
import { CHAT_HISTORY_COUNT } from '@/shared/config'

export function useChatHistory(chatId: string) {
  const credentials = useRequiredSession()

  const query = useQuery({
    queryKey: ['green-api', credentials.idInstance, 'chat-history', chatId],
    queryFn: async ({ signal }) => {
      const items = await getChatHistory(credentials, { chatId, count: CHAT_HISTORY_COUNT }, signal)
      return items
        .filter((item) => item.typeMessage !== 'reactionMessage')
        .map((item) => ({ ...fromHistoryItem(item), chatId }))
    },
    staleTime: 5 * 60_000,
    retry: false,
  })

  useEffect(() => {
    if (query.data) messageActions.add(chatId, query.data)
  }, [chatId, query.data])

  return query
}
