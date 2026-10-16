import { activeChatStore, chatStore } from '@/entities/chat'
import { messageStore } from '@/entities/message'
import { sessionStore } from '@/entities/session'

export function bindInstanceStores() {
  const sync = () => {
    const namespace = sessionStore.getState()?.idInstance ?? null
    chatStore.setNamespace(namespace)
    messageStore.setNamespace(namespace)
    if (!namespace) activeChatStore.setState(null)
  }
  sync()
  return sessionStore.subscribe(sync)
}
