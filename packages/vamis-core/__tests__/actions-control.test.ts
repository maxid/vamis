import { describe, expect, it, vi } from 'vitest'
import { createVamisEvent, runAction, type ActionContext } from '../src/actions/run'
import { ScopedContext } from '../src/scoped'

function ctx(partial: Partial<ActionContext> = {}): ActionContext {
  return {
    env: {
      fetcher: vi.fn(async () => ({ status: 0, msg: 'ok', data: {} })),
      notify: vi.fn(),
      jumpTo: vi.fn(),
      alert: vi.fn(),
      confirm: vi.fn(async () => true),
    },
    data: {},
    ...partial,
  }
}

describe('control flow and browser actions', () => {
  it('runs loop children with item data and supports continue', async () => {
    const context = ctx({ data: { items: [{ name: 'a' }, { name: 'b' }] } })
    context.event = createVamisEvent('click', {})
    await runAction({
      actionType: 'loop',
      args: { loopName: '${items}' },
      children: [
        { actionType: 'toast', args: { msg: '${name}' } },
        { actionType: 'continue' },
        { actionType: 'toast', args: { msg: 'unreachable' } },
      ],
    }, context)
    expect(context.env.notify).toHaveBeenCalledTimes(2)
    expect(context.env.notify).toHaveBeenNthCalledWith(1, 'info', 'a', expect.any(Object))
    expect(context.env.notify).toHaveBeenNthCalledWith(2, 'info', 'b', expect.any(Object))
  })

  it('break stops the current loop and restores event data', async () => {
    const event = createVamisEvent('click', { original: true })
    const context = ctx({ data: { items: [1, 2] }, event })
    await runAction({
      actionType: 'loop',
      args: { loopName: '${items}' },
      children: [
        { actionType: 'toast', args: { msg: '${item}' } },
        { actionType: 'break' },
      ],
    }, context)
    expect(context.env.notify).toHaveBeenCalledTimes(1)
    expect(event.data).toEqual({ original: true })
    expect(event.stopped).toBe(true)
  })

  it('switch runs only the first matching branch', async () => {
    const context = ctx({ data: { score: 18 } })
    await runAction({
      actionType: 'switch',
      children: [
        { actionType: 'toast', args: { msg: 'high' }, expression: 'this.score > 19' },
        { actionType: 'toast', args: { msg: 'middle' }, expression: 'this.score > 17' },
        { actionType: 'toast', args: { msg: 'low' }, expression: 'this.score > 16' },
      ],
    }, context)
    expect(context.env.notify).toHaveBeenCalledTimes(1)
    expect(context.env.notify).toHaveBeenCalledWith('info', 'middle', expect.any(Object))
  })

  it('parallel starts every child and shares output through the event', async () => {
    const event = createVamisEvent('click', {})
    const context = ctx({
      event,
      env: {
        fetcher: vi.fn(async () => ({ status: 0, msg: 'ok', data: { answer: 42 } })),
        notify: vi.fn(),
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm: vi.fn(async () => true),
      },
    })
    await runAction({
      actionType: 'parallel',
      children: [
        { actionType: 'ajax', args: { api: '/api/a' }, outputVar: 'first' },
        { actionType: 'ajax', args: { api: '/api/b' }, outputVar: 'second' },
      ],
    }, context)
    expect(context.env.fetcher).toHaveBeenCalledTimes(2)
    expect(event.data.first.responseData).toEqual({ answer: 42 })
    expect(event.data.second.responseStatus).toBe(0)
  })

  it('runs trusted custom JS and lets it dispatch another action', async () => {
    const event = createVamisEvent('click', {})
    const context = ctx({ event, env: { ...ctx().env, trusted: true } })
    await runAction({
      actionType: 'custom',
      script: "event.setData({name: 'Vamis'}); await doAction({actionType: 'toast', args: {msg: event.data.name}})",
    }, context)
    expect(context.env.notify).toHaveBeenCalledWith('info', 'Vamis', expect.any(Object))
  })

  it('does not execute custom script outside trusted mode', async () => {
    const context = ctx()
    await runAction({ actionType: 'custom', script: "throw new Error('must not run')" }, context)
    expect(context.env.notify).not.toHaveBeenCalled()
  })

  it('maps dynamic data for reload and setValue', async () => {
    const scoped = new ScopedContext()
    const reload = vi.fn()
    const setData = vi.fn()
    scoped.register({ name: 'target', reload, setData })
    const context = ctx({ scoped, data: { name: 'Vamis' } })
    await runAction({ actionType: 'reload', target: 'target', data: { name: '${name}' } }, context)
    await runAction({ actionType: 'setValue', componentName: 'target', args: { value: '${name}' } }, context)
    expect(reload).toHaveBeenCalledWith({ name: 'Vamis' }, false)
    expect(setData).toHaveBeenCalledWith({ value: 'Vamis' }, false)
  })

  it('calls browser history and refresh APIs', async () => {
    const back = vi.fn()
    const go = vi.fn()
    const reload = vi.fn()
    vi.stubGlobal('window', { history: { back, go }, location: { reload } })
    const context = ctx()
    await runAction({ actionType: 'goBack' }, context)
    await runAction({ actionType: 'goPage', args: { delta: -2 } }, context)
    await runAction({ actionType: 'refresh' }, context)
    expect(back).toHaveBeenCalledOnce()
    expect(go).toHaveBeenCalledWith(-2)
    expect(reload).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
  })
})
