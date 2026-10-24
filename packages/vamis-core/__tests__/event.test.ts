import { describe, expect, it, vi } from 'vitest'
import { createVamisEvent, eventEvalData } from '../src/actions/event'
import { runActions, runOnEvent } from '../src/actions/run'
import type { ActionContext } from '../src/actions/run'
import { createScope } from '../src/scope'

function ctx(partial: Partial<ActionContext> = {}): ActionContext {
  return {
    env: {
      fetcher: vi.fn(async () => ({ status: 0, msg: 'ok', data: {} })),
      notify: vi.fn(),
      jumpTo: vi.fn(),
      alert: vi.fn(),
      confirm: vi.fn(async () => true),
    },
    data: { name: 'Ada' },
    ...partial,
  }
}

describe('VamisEvent', () => {
  it('builds event.data from payload and keeps __rendererData on the eval bag', () => {
    const scope = createScope({ name: 'Ada', hidden: 1 })
    const event = createVamisEvent('click', { name: 'Ada', extra: 2 }, { type: 'click' })
    const bag = eventEvalData(scope.resolved(), event)
    expect(bag.event.data.extra).toBe(2)
    expect(bag.__rendererData.name).toBe('Ada')
    expect(bag.event.context.nativeEvent.type).toBe('click')
    expect(typeof bag.event.preventDefault).toBe('function')
    expect(typeof bag.event.stopPropagation).toBe('function')
    expect(typeof bag.event.setData).toBe('function')
  })

  it('setData patches event.data for later actions', () => {
    const event = createVamisEvent('inited', { date: 'old' })
    event.setData({ date: 'now' })
    expect(event.data.date).toBe('now')
  })

  it('preventDefault on an action stops the host default and stopPropagation skips later actions', async () => {
    const event = createVamisEvent('click', { name: 'Ada' })
    const context = ctx({ event, data: eventEvalData({ name: 'Ada' }, event) })
    await runActions(
      [
        { actionType: 'toast', msg: 'first', preventDefault: true, stopPropagation: true },
        { actionType: 'toast', msg: 'second' },
      ],
      context,
    )
    expect(event.prevented).toBe(true)
    expect(event.stopped).toBe(true)
    expect(context.env.notify).toHaveBeenCalledTimes(1)
    expect(context.env.notify).toHaveBeenCalledWith('info', 'first', expect.any(Object))
  })

  it('ignoreError keeps the chain going after a failed ajax', async () => {
    const context = ctx()
    context.env.fetcher = vi.fn(async () => ({ status: 500, msg: 'boom', data: {} }))
    await runActions(
      [
        { actionType: 'ajax', api: '/fail', ignoreError: true },
        { actionType: 'toast', msg: 'after' },
      ],
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('info', 'after', expect.any(Object))
  })

  it('exposes __rendererData to onEvent formulas', async () => {
    const event = createVamisEvent('click', { name: 'Ada' })
    const context = ctx({
      event,
      data: eventEvalData({ name: 'Ada', role: 'dev' }, event),
    })
    await runOnEvent(
      {
        type: 'container',
        onEvent: {
          click: { actions: [{ actionType: 'toast', msg: '${__rendererData.role}' }] },
        },
      },
      'click',
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('info', 'dev', expect.any(Object))
  })
})
