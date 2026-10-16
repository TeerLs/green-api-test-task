import { z } from 'zod'

import { createStore } from './create-store'

const schema = z.array(z.string())

describe('createStore', () => {
  it('persists state under a namespaced key', () => {
    const store = createStore({
      key: 'items',
      schema,
      namespace: 'a',
      initial: () => [] as string[],
    })
    store.setState(['x'])
    expect(JSON.parse(localStorage.getItem('green-max:items:a')!)).toEqual(['x'])
  })

  it('hydrates from storage and validates with the schema', () => {
    localStorage.setItem('green-max:items:a', JSON.stringify(['saved']))
    localStorage.setItem('green-max:items:b', JSON.stringify({ broken: true }))

    const store = createStore({
      key: 'items',
      schema,
      namespace: 'a',
      initial: () => [] as string[],
    })
    expect(store.getState()).toEqual(['saved'])

    store.setNamespace('b')
    expect(store.getState()).toEqual([])
  })

  it('notifies subscribers and skips identical updates', () => {
    const store = createStore({ initial: () => 1 })
    const listener = jest.fn()
    store.subscribe(listener)

    store.setState((n) => n + 1)
    store.setState(2)

    expect(store.getState()).toBe(2)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('does not persist without a namespace', () => {
    const store = createStore({ key: 'items', schema, initial: () => [] as string[] })
    store.setState(['x'])
    expect(Object.keys(localStorage).filter((key) => key.includes('items'))).toEqual([])
  })
})
