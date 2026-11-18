import { describe, expect, it, vi } from 'vitest'
import { createEventBus } from '../src/event-bus'
import { runAction, type ActionContext } from '../src/actions/run'

describe('VamisEventBus', () => {
  it('runs listeners by descending weight and unsubscribes', async () => {
    const bus = createEventBus()
    const calls: string[] = []
    bus.on('ready', () => { calls.push('low') }, 1)
    const off = bus.on('ready', () => { calls.push('high') }, 10)
    await bus.emit('ready')
    expect(calls).toEqual(['high', 'low'])
    off()
    await bus.emit('ready')
    expect(calls).toEqual(['high', 'low', 'low'])
  })

  it('broadcast uses the current env bus', async () => {
    const bus = createEventBus()
    const listener = vi.fn()
    bus.on('custom-event', listener)
    const context: ActionContext = {
      env: {
        bus,
        fetcher: vi.fn(),
        notify: vi.fn(),
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm: vi.fn(async () => true),
      },
      data: { name: 'Vamis' },
    }
    await runAction({ actionType: 'broadcast', args: { eventName: 'custom-event' }, data: { answer: 42 } }, context)
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vamis', answer: 42 }))
  })
})
