import { describe, expect, it, vi } from 'vitest'
import { runAction, runOnEvent, withNativeEvent } from '../src/actions/run'
import type { ActionContext } from '../src/actions/run'
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
    data: { name: 'Ada' },
    ...partial,
  }
}

describe('onEvent actions', () => {
  it('runs toast with interpolated msg', async () => {
    const context = ctx()
    await runAction({ actionType: 'toast', msg: 'hi ${name}' }, context)
    expect(context.env.notify).toHaveBeenCalledWith('info', 'hi Ada')
  })

  it('setValue writes into the form', async () => {
    const setData = vi.fn()
    const context = ctx({ form: { setData } })
    await runAction({ actionType: 'setValue', value: { name: 'Bob' } }, context)
    expect(setData).toHaveBeenCalledWith({ name: 'Bob' })
  })

  it('reload targets a scoped component', async () => {
    const reload = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'list', reload })
    const context = ctx({ scoped })
    await runAction({ actionType: 'reload', target: 'list' }, context)
    expect(reload).toHaveBeenCalled()
  })

  it('ajax posts then notifies', async () => {
    const context = ctx()
    await runAction({ actionType: 'ajax', api: '/api/mock2/form/saveForm' }, context)
    expect(context.env.fetcher).toHaveBeenCalled()
    expect(context.env.notify).toHaveBeenCalledWith('success', 'ok')
  })

  it('opens dialog overlay from onEvent click', async () => {
    const openDialog = vi.fn()
    const context = ctx({
      overlay: {
        state: { dialog: null, drawer: null, data: {} },
        openDialog,
        openDrawer: vi.fn(),
        closeDialog: vi.fn(),
        closeDrawer: vi.fn(),
        close: vi.fn(),
      },
    })
    await runOnEvent(
      {
        type: 'button',
        onEvent: {
          click: { actions: [{ actionType: 'dialog', dialog: { title: 'X', body: { type: 'tpl', tpl: 'hi' } } }] },
        },
      },
      'click',
      context,
    )
    expect(openDialog).toHaveBeenCalled()
  })

  it('interpolates nativeEvent.type from the D4 event subset', async () => {
    const context = ctx({
      data: withNativeEvent({ name: 'Ada' }, { type: 'click' }),
    })
    await runOnEvent(
      {
        type: 'container',
        onEvent: {
          click: {
            actions: [{ actionType: 'toast', args: { msgType: 'info', msg: '${event.context.nativeEvent.type}' } }],
          },
        },
      },
      'click',
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('info', 'click')
  })

  it('runs mouseenter the same way as click', async () => {
    const context = ctx({
      data: withNativeEvent({}, { type: 'mouseenter' }),
    })
    await runOnEvent(
      {
        type: 'container',
        onEvent: {
          mouseenter: {
            actions: [{ actionType: 'toast', args: { msg: '${event.context.nativeEvent.type}' } }],
          },
        },
      },
      'mouseenter',
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('info', 'mouseenter')
  })

  it('toast reads Amis args.msgType as level', async () => {
    const context = ctx()
    await runAction({ actionType: 'toast', args: { msgType: 'warning', msg: 'careful' } }, context)
    expect(context.env.notify).toHaveBeenCalledWith('warning', 'careful')
  })
})
