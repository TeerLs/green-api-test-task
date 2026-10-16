import { nextPollDelay, POLL_DELAY } from './poll-delay'

describe('nextPollDelay', () => {
  it('drains the queue right away after a notification', () => {
    expect(nextPollDelay({ received: true, durationMs: 50 })).toBe(POLL_DELAY.immediate)
  })

  it('re-polls immediately when the server really held the long poll', () => {
    expect(nextPollDelay({ received: false, durationMs: 20_000 })).toBe(POLL_DELAY.immediate)
  })

  it('backs off when the server answers an empty queue instantly', () => {
    expect(nextPollDelay({ received: false, durationMs: 300 })).toBe(POLL_DELAY.emptyVisible)
    expect(nextPollDelay({ received: false, durationMs: 300 }, { hidden: true })).toBe(
      POLL_DELAY.emptyHidden,
    )
  })

  it('waits longer after an error', () => {
    expect(nextPollDelay(undefined, { failed: true })).toBe(POLL_DELAY.error)
  })
})
