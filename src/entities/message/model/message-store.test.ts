import { mergeStatus, messageActions, messageStore, type Message } from './message-store'

const message = (overrides: Partial<Message> = {}): Message => ({
  id: 'm1',
  chatId: 'chat',
  text: 'Привет',
  direction: 'out',
  timestamp: 1_000,
  status: 'sent',
  ...overrides,
})

const messagesOf = (chatId = 'chat') => messageStore.getState()[chatId] ?? []

beforeEach(() => messageStore.setState({}))

describe('mergeStatus', () => {
  it('only moves forward', () => {
    expect(mergeStatus('read', 'delivered')).toBe('read')
    expect(mergeStatus('sent', 'delivered')).toBe('delivered')
    expect(mergeStatus(undefined, 'sent')).toBe('sent')
  })

  it('always applies failures', () => {
    expect(mergeStatus('sent', 'failed')).toBe('failed')
  })
})

describe('messageActions', () => {
  it('adds messages sorted by time and ignores duplicates', () => {
    messageActions.add('chat', [message({ id: 'b', timestamp: 2_000 }), message({ id: 'a' })])
    messageActions.add('chat', message({ id: 'a' }))
    expect(messagesOf().map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('does not change state when nothing new is added', () => {
    messageActions.add('chat', message())
    const before = messageStore.getState()
    messageActions.add('chat', message())
    expect(messageStore.getState()).toBe(before)
  })

  it('confirms an optimistic message with the real id', () => {
    messageActions.add('chat', message({ id: 'local-1', status: 'pending' }))
    messageActions.confirm('chat', 'local-1', 'real-1')
    expect(messagesOf()).toEqual([expect.objectContaining({ id: 'real-1', status: 'sent' })])
  })

  it('drops the optimistic copy if the webhook arrived first', () => {
    messageActions.add('chat', message({ id: 'local-1', status: 'pending' }))
    messageActions.add('chat', message({ id: 'real-1', timestamp: 1_001 }))
    messageActions.confirm('chat', 'local-1', 'real-1')
    expect(messagesOf().map((m) => m.id)).toEqual(['real-1'])
  })

  it('updates status without downgrading it', () => {
    messageActions.add('chat', message())
    messageActions.setStatus('chat', 'm1', 'read')
    messageActions.setStatus('chat', 'm1', 'delivered')
    expect(messagesOf()[0]?.status).toBe('read')
  })

  it('moves messages to another chat id', () => {
    messageActions.add('79991234567@c.us', message({ chatId: '79991234567@c.us' }))
    messageActions.add('10000000', message({ id: 'm2', chatId: '10000000', timestamp: 2_000 }))
    messageActions.moveChat('79991234567@c.us', '10000000')

    expect(messageStore.getState()['79991234567@c.us']).toBeUndefined()
    expect(messagesOf('10000000').map((m) => [m.id, m.chatId])).toEqual([
      ['m1', '10000000'],
      ['m2', '10000000'],
    ])
  })
})
