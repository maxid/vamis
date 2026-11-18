import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEventDebounce } from '../src/event-debounce'

afterEach(() => vi.useRealTimers())

describe('event debounce', () => {
  it('uses trailing delivery by default and only keeps the latest callback', async () => {
    vi.useFakeTimers()
    const calls: string[] = []
    const handler = createEventDebounce({ wait: 100 })
    await handler.run(async () => { calls.push('first') })
    await handler.run(async () => { calls.push('latest') })
    expect(calls).toEqual([])
    await vi.advanceTimersByTimeAsync(100)
    expect(calls).toEqual(['latest'])
  })

  it('supports leading plus trailing without duplicating a single call', async () => {
    vi.useFakeTimers()
    const callback = vi.fn(async () => undefined)
    const handler = createEventDebounce({ wait: 100, leading: true, trailing: true })
    await handler.run(callback)
    expect(callback).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(100)
    expect(callback).toHaveBeenCalledOnce()
    await handler.run(callback)
    await handler.run(callback)
    await vi.advanceTimersByTimeAsync(100)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('forces the latest callback at maxWait and supports cancel', async () => {
    vi.useFakeTimers()
    const callback = vi.fn(async () => undefined)
    const handler = createEventDebounce({ wait: 100, maxWait: 120 })
    await handler.run(callback)
    await vi.advanceTimersByTimeAsync(60)
    await handler.run(callback)
    await vi.advanceTimersByTimeAsync(60)
    expect(callback).toHaveBeenCalledOnce()
    handler.cancel()
    await vi.advanceTimersByTimeAsync(1000)
    expect(callback).toHaveBeenCalledOnce()
  })
})
