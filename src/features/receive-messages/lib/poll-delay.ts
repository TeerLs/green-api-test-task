export const POLL_DELAY = {
  immediate: 100,
  emptyVisible: 5_000,
  emptyHidden: 15_000,
  error: 10_000,
} as const

export const LONG_POLL_MIN_HOLD_MS = 5_000

export interface PollOutcome {
  received: boolean
  durationMs: number
}

export function nextPollDelay(
  outcome: PollOutcome | undefined,
  { failed = false, hidden = false }: { failed?: boolean; hidden?: boolean } = {},
) {
  if (failed) return POLL_DELAY.error
  if (!outcome) return POLL_DELAY.immediate
  if (outcome.received) return POLL_DELAY.immediate
  if (outcome.durationMs >= LONG_POLL_MIN_HOLD_MS) return POLL_DELAY.immediate
  return hidden ? POLL_DELAY.emptyHidden : POLL_DELAY.emptyVisible
}
