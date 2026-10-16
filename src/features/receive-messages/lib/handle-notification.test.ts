import { activeChatStore, chatActions, chatStore } from '@/entities/chat'
import { messageActions, messageStore } from '@/entities/message'

import { handleNotification } from './handle-notification'

const incoming = (overrides: Record<string, unknown> = {}) => ({
  typeWebhook: 'incomingMessageReceived',
  instanceData: { idInstance: 3100000000, wid: '79991234567@c.us', typeInstance: 'v3' },
  timestamp: 1763115112,
  idMessage: '1763115112345',
  senderData: {
    chatId: '10000000',
    chatName: 'Анна',
    chatType: 'user',
    sender: '10000000',
    senderName: 'Анна',
    senderPhoneNumber: 79876543210,
  },
  messageData: {
    typeMessage: 'textMessage',
    textMessageData: { textMessage: 'Добрый день!' },
  },
  ...overrides,
})

beforeEach(() => {
  chatStore.setState({})
  messageStore.setState({})
  activeChatStore.setState(null)
})

describe('handleNotification', () => {
  it('creates a chat for an unknown sender and stores the message', () => {
    expect(handleNotification(incoming())).toEqual({
      kind: 'message',
      chatId: '10000000',
      messageId: '1763115112345',
    })

    expect(chatStore.getState()['10000000']).toMatchObject({
      name: 'Анна',
      phone: '79876543210',
      unread: 1,
    })
    expect(messageStore.getState()['10000000']).toEqual([
      expect.objectContaining({
        text: 'Добрый день!',
        direction: 'in',
        timestamp: 1763115112000,
      }),
    ])
  })

  it('does not count unread messages for the open chat', () => {
    chatActions.upsert({ id: '10000000', name: 'Анна' })
    chatActions.open('10000000')
    handleNotification(incoming())
    expect(chatStore.getState()['10000000']?.unread).toBe(0)
  })

  it('re-keys a chat created by phone number to the real MAX chatId', () => {
    chatActions.upsert({ id: '79876543210@c.us', phone: '79876543210', name: 'Мама' })
    messageActions.add('79876543210@c.us', {
      id: 'out-1',
      chatId: '79876543210@c.us',
      text: 'Привет',
      direction: 'out',
      timestamp: 1,
      status: 'sent',
    })

    handleNotification(incoming())

    const chats = chatStore.getState()
    expect(chats['79876543210@c.us']).toBeUndefined()
    expect(chats['10000000']).toMatchObject({ name: 'Мама', phone: '79876543210' })
    expect(messageStore.getState()['10000000']?.map((m) => m.id)).toEqual([
      'out-1',
      '1763115112345',
    ])
  })

  it('takes the phone from a WhatsApp sender id', () => {
    handleNotification(
      incoming({
        senderData: {
          chatId: '79876543210@c.us',
          sender: '79876543210@c.us',
          senderName: 'Anna',
        },
      }),
    )
    expect(chatStore.getState()['79876543210@c.us']).toMatchObject({
      name: 'Anna',
      phone: '79876543210',
    })
  })

  it('reads extended text messages', () => {
    handleNotification(
      incoming({
        messageData: {
          typeMessage: 'extendedTextMessage',
          extendedTextMessageData: { text: 'https://green-api.com' },
        },
      }),
    )
    expect(messageStore.getState()['10000000']?.[0]?.text).toBe('https://green-api.com')
  })

  it('marks non-text messages as unsupported', () => {
    handleNotification(incoming({ messageData: { typeMessage: 'imageMessage' } }))
    expect(messageStore.getState()['10000000']?.[0]?.unsupported).toBe(true)
  })

  it('stores messages sent from the phone as outgoing', () => {
    handleNotification(incoming({ typeWebhook: 'outgoingMessageReceived' }))
    expect(messageStore.getState()['10000000']?.[0]).toMatchObject({
      direction: 'out',
      status: 'sent',
    })
    expect(chatStore.getState()['10000000']?.unread).toBe(0)
  })

  it('applies outgoing message statuses', () => {
    messageActions.add('10000000', {
      id: 'out-1',
      chatId: '10000000',
      text: 'Привет',
      direction: 'out',
      timestamp: 1,
      status: 'sent',
    })
    handleNotification({
      typeWebhook: 'outgoingMessageStatus',
      chatId: '10000000',
      idMessage: 'out-1',
      status: 'read',
      timestamp: 2,
    })
    expect(messageStore.getState()['10000000']?.[0]?.status).toBe('read')
  })

  it('ignores unknown notification types', () => {
    expect(handleNotification({ typeWebhook: 'stateInstanceChanged' })).toEqual({
      kind: 'ignored',
      typeWebhook: 'stateInstanceChanged',
    })
    expect(chatStore.getState()).toEqual({})
  })
})
