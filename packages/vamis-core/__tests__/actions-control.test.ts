import { describe, expect, it, vi } from 'vitest'
import { createVamisEvent, runAction, runActions, type ActionContext } from '../src/actions/run'
import { eventEvalData } from '../src/actions/event'
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

  it('supports silent ajax and validate output variables', async () => {
    const event = createVamisEvent('click', {})
    const scoped = new ScopedContext()
    scoped.register({
      name: 'form',
      validate: () => false,
      getData: () => ({ name: 'Ada' }),
    })
    const context = ctx({ scoped, event })
    await runAction({ actionType: 'ajax', api: { url: '/api/silent', silent: true } }, context)
    expect(context.env.notify).not.toHaveBeenCalled()
    await runAction({ actionType: 'validate', componentName: 'form', outputVar: 'result' }, context)
    expect(event.data.result).toEqual({ error: true, payload: { name: 'Ada' } })
  })

  it('silent ajax still writes responseResult and does not throw on !ok', async () => {
    const event = createVamisEvent('click', {})
    const context = ctx({
      event,
      data: eventEvalData({}, event),
      env: {
        fetcher: vi.fn(async () => ({ status: 404, msg: 'Not Found!', data: {} })),
        notify: vi.fn(),
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm: vi.fn(async () => true),
      },
    })
    await runActions(
      [
        {
          actionType: 'ajax',
          api: {
            url: '/api/amis-mock/initData',
            method: 'post',
            silent: true,
            messages: { success: '成功了！欧耶', failed: '失败了呢。。' },
          },
        },
        {
          actionType: 'toast',
          expression: '${event.data.responseResult.responseStatus === 0}',
          args: { msg: '${event.data.responseResult|json}' },
        },
      ],
      context,
    )
    expect(context.env.notify).not.toHaveBeenCalled()
    expect(event.data.responseResult).toMatchObject({ responseStatus: 404, responseMsg: 'Not Found!' })
  })

  it('treats setState as the component setData alias', async () => {
    const scoped = new ScopedContext()
    const setData = vi.fn()
    scoped.register({ name: 'target', setData })
    await runAction({
      actionType: 'setState',
      componentName: 'target',
      args: { value: { enabled: true } },
    }, ctx({ scoped }))
    expect(setData).toHaveBeenCalledWith({ enabled: true }, false)
  })

  it('logs action args, data and event only when env.debug is enabled', async () => {
    const group = vi.spyOn(console, 'group').mockImplementation(() => undefined)
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    const end = vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined)
    try {
      await runAction({ actionType: 'toast', args: { msg: 'quiet' } }, ctx())
      expect(group).not.toHaveBeenCalled()
      const event = createVamisEvent('click', { name: 'Vamis' })
      await runAction({ actionType: 'toast', args: { msg: 'logged' } }, ctx({ event, env: { ...ctx().env, debug: true } }))
      expect(group).toHaveBeenCalledWith('[vamis] run action toast')
      expect(debug).toHaveBeenCalledWith(
        '[toast] action args, data',
        { msg: 'logged' },
        expect.not.objectContaining({ event: expect.anything(), __super: expect.anything() }),
      )
      expect(debug).toHaveBeenCalledWith('[toast] action end event', event)
      expect(end).toHaveBeenCalledOnce()
      group.mockClear()
      await runAction({ type: 'button', actionType: 'button' }, ctx({ env: { ...ctx().env, debug: true } }))
      expect(group).not.toHaveBeenCalled()
    } finally {
      vi.restoreAllMocks()
    }
  })

  it('supports Amis env, global and URL debug activation', async () => {
    const group = vi.spyOn(console, 'group').mockImplementation(() => undefined)
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    vi.spyOn(console, 'groupEnd').mockImplementation(() => undefined)
    try {
      await runAction({ actionType: 'toast', args: { msg: 'env' } }, ctx({ env: { ...ctx().env, enableVamisDebug: true } }))
      expect(group).toHaveBeenCalledTimes(1)
      vi.stubGlobal('window', { enableVamisDebug: true, location: { search: '' } })
      await runAction({ actionType: 'toast', args: { msg: 'global' } }, ctx())
      expect(group).toHaveBeenCalledTimes(2)
      vi.stubGlobal('window', { enableVamisDebug: false, location: { search: '?vamisDebug=1' } })
      await runAction({ actionType: 'toast', args: { msg: 'url' } }, ctx())
      expect(group).toHaveBeenCalledTimes(3)
    } finally {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    }
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
