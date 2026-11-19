import { describe, expect, it, vi } from 'vitest'
import { createVamisEvent, eventEvalData, runAction, runActions, runOnEvent, withNativeEvent } from '../src/actions/run'
import type { ActionContext } from '../src/actions/run'
import { ScopedContext } from '../src/scoped'
import { resetStatusStore, statusDisabledOf, statusStaticOf, statusVisibleOf } from '../src/status-store'
import { createOverlay } from '../src/overlay'

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
    expect(context.env.notify).toHaveBeenCalledWith(
      'info',
      'hi Ada',
      expect.objectContaining({ position: 'top-center', timeout: 4000 }),
    )
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
    expect(reload).toHaveBeenCalledWith(undefined, false)
  })

  it('reload resolves a dynamic target and query payload', async () => {
    const reload = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'list', reload })
    const context = ctx({ scoped, data: { who: 'list', q: 7 } })
    await runAction({ actionType: 'reload', target: '${who}?q=${q}' }, context)
    expect(reload).toHaveBeenCalledWith({ q: 7 }, false)
  })

  it('reload sends action.data only and honors dataMergeMode', async () => {
    const reload = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'page_reload_2', reload })
    const context = ctx({ scoped })
    await runAction(
      { actionType: 'reload', componentId: 'page_reload_2', data: { age: 18 }, dataMergeMode: 'override' },
      context,
    )
    expect(reload).toHaveBeenCalledWith({ age: 18 }, true)
  })

  it('setValue override writes through scoped setData', async () => {
    const setData = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'page02', setData })
    const context = ctx({ scoped })
    await runAction(
      {
        actionType: 'setValue',
        componentId: 'page02',
        args: { value: { date: '2023-05-01' } },
        dataMergeMode: 'override',
      },
      context,
    )
    expect(setData).toHaveBeenCalledWith({ date: '2023-05-01' }, true)
  })

  it('setValue with componentId wraps a scalar as { value }', async () => {
    const setData = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'setvalue_text', setData })
    const context = ctx({ scoped })
    await runAction(
      {
        actionType: 'setValue',
        componentId: 'setvalue_text',
        args: { value: 'amis go go go!' },
      },
      context,
    )
    expect(setData).toHaveBeenCalledWith({ value: 'amis go go go!' }, false)
  })

  it('componentId reaches a form item inside a child data scope', async () => {
    const root = new ScopedContext()
    const formScope = new ScopedContext(root)
    const setData = vi.fn()
    const doAction = vi.fn()
    formScope.register({ name: 'switch', id: 'u:switch', setData, doAction })
    const context = ctx({ scoped: root })
    expect(root.getComponentByName('switch')).toBeUndefined()
    expect(root.getComponentById('u:switch')).toBeTruthy()
    await runAction({ actionType: 'setValue', componentId: 'u:switch', args: { value: true } }, context)
    await runAction({ actionType: 'clear', componentId: 'u:switch' }, context)
    expect(setData).toHaveBeenCalledWith({ value: true }, false)
    expect(doAction).toHaveBeenCalledWith({ actionType: 'clear', componentId: 'u:switch' }, expect.any(Object))
  })

  it('clear / reset / setValue address the target by componentName', async () => {
    const doAction = vi.fn()
    const setData = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'switch', doAction, setData })
    const context = ctx({ scoped })
    await runAction({ actionType: 'clear', componentName: 'switch' }, context)
    await runAction({ actionType: 'reset', componentName: 'switch' }, context)
    await runAction({ actionType: 'setValue', componentName: 'switch', args: { value: true } }, context)
    expect(doAction).toHaveBeenCalledTimes(2)
    expect(setData).toHaveBeenCalledWith({ value: true }, false)
  })

  it('unknown actionType with componentId calls the target doAction', async () => {
    const doAction = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'previewImage', doAction })
    const context = ctx({ scoped })
    const preview = { actionType: 'preview', componentId: 'previewImage' }
    const zoom = { actionType: 'zoom', componentId: 'previewImage', args: { scale: 50 } }
    await runAction(preview, context)
    await runAction(zoom, context)
    expect(doAction).toHaveBeenNthCalledWith(1, preview, expect.any(Object))
    expect(doAction).toHaveBeenNthCalledWith(2, zoom, expect.any(Object))
  })

  it('clear / reset / focus with componentId call doAction', async () => {
    const doAction = vi.fn()
    const reset = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'clear_text', doAction })
    const context = ctx({ scoped, form: { reset } })
    await runAction({ actionType: 'clear', componentId: 'clear_text' }, context)
    await runAction({ actionType: 'reset', componentId: 'clear_text' }, context)
    await runAction({ actionType: 'focus', componentId: 'clear_text' }, context)
    expect(doAction).toHaveBeenCalledTimes(3)
    expect(doAction).toHaveBeenNthCalledWith(1, { actionType: 'clear', componentId: 'clear_text' }, expect.any(Object))
    expect(reset).not.toHaveBeenCalled()
  })

  it('static / nonstatic write status store by componentId', async () => {
    resetStatusStore()
    await runAction({ actionType: 'static', componentId: 'formItemSwitch' }, ctx())
    expect(statusStaticOf({ id: 'formItemSwitch' })).toBe(true)
    await runAction({ actionType: 'nonstatic', componentId: 'formItemSwitch' }, ctx())
    expect(statusStaticOf({ id: 'formItemSwitch' })).toBe(false)
    resetStatusStore()
  })

  it('reset without componentId still resets the form', async () => {
    const reset = vi.fn()
    const context = ctx({ form: { reset } })
    await runAction({ actionType: 'reset' }, context)
    expect(reset).toHaveBeenCalled()
  })

  it('exposes event.data for inited-style payloads', () => {
    const payload = withNativeEvent({ responseData: { date: 'now' }, date: 'now' }, { type: 'inited' })
    expect(payload.event.data.responseData).toEqual({ date: 'now' })
    expect(payload.event.context.nativeEvent.type).toBe('inited')
    expect(payload.date).toBe('now')
  })

  it('ajax posts then notifies', async () => {
    const context = ctx()
    await runAction({ actionType: 'ajax', api: '/api/mock2/form/saveForm' }, context)
    expect(context.env.fetcher).toHaveBeenCalled()
    expect(context.env.notify).toHaveBeenCalledWith('success', 'ok')
    expect((context.env.fetcher as ReturnType<typeof vi.fn>).mock.calls[0][0].data).toEqual({})
  })

  it('ajax merges the payload into the form with api reason', async () => {
    const setData = vi.fn()
    const context = ctx({
      form: { setData },
      env: {
        fetcher: vi.fn(async () => ({ status: 0, msg: 'ok', data: { name: 'vamis-demo' } })),
        notify: vi.fn(),
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm: vi.fn(async () => true),
      },
    })
    await runAction({ actionType: 'ajax', api: '/api/mock2/form/saveForm' }, context)
    expect(setData).toHaveBeenCalledWith({ name: 'vamis-demo' }, false, 'api')
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
        closeById: vi.fn(),
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

  it('confirm closes the open dialog instead of env.confirm', async () => {
    const closeDialog = vi.fn()
    const confirm = vi.fn(async () => true)
    const context = ctx({
      env: {
        fetcher: vi.fn(async () => ({ status: 0, msg: 'ok', data: {} })),
        notify: vi.fn(),
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm,
      },
      overlay: {
        state: { dialog: { title: 'X' }, drawer: null, data: {} },
        openDialog: vi.fn(),
        openDrawer: vi.fn(),
        closeDialog,
        closeDrawer: vi.fn(),
        closeById: vi.fn(),
        close: vi.fn(),
      },
    })
    await runAction({ actionType: 'confirm' }, context)
    expect(closeDialog).toHaveBeenCalled()
    expect(confirm).not.toHaveBeenCalled()
  })

  it('confirm submits the overlay dialog form when one is registered', async () => {
    const closeDialog = vi.fn()
    const submitDialogForm = vi.fn(async () => true)
    const context = ctx({
      overlay: {
        state: { dialog: { title: '编辑选项' }, drawer: null, data: {} },
        openDialog: vi.fn(),
        openDrawer: vi.fn(),
        closeDialog,
        closeDrawer: vi.fn(),
        closeById: vi.fn(),
        close: vi.fn(),
        submitDialogForm,
      },
    })
    await runAction({ actionType: 'confirm' }, context)
    expect(submitDialogForm).toHaveBeenCalled()
    expect(closeDialog).not.toHaveBeenCalled()
  })

  it('dispatches dialog confirm/cancel events and honors preventDefault', async () => {
    const overlay = createOverlay()
    const notify = vi.fn()
    const context = ctx({
      overlay,
      env: {
        fetcher: vi.fn(async () => ({ status: 0, msg: 'ok', data: {} })),
        notify,
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm: vi.fn(async () => true),
      },
      event: createVamisEvent('click', {}),
    })
    void overlay.openDialog({
      title: '阻止',
      onEvent: {
        confirm: { actions: [{ actionType: 'toast', args: { msg: '确认事件' } }, { actionType: 'preventDefault' }] },
        cancel: { actions: [{ actionType: 'toast', args: { msg: '取消事件' } }, { actionType: 'preventDefault' }] },
      },
    }, { name: 'Ada' })
    await runAction({ actionType: 'confirm' }, context)
    expect(overlay.state.dialog).not.toBeNull()
    await runAction({ actionType: 'cancel' }, context)
    expect(overlay.state.dialog).not.toBeNull()
    expect(notify).toHaveBeenCalledWith('info', '确认事件', expect.any(Object))
    expect(notify).toHaveBeenCalledWith('info', '取消事件', expect.any(Object))
  })

  it('keeps a dialog open when confirm has close false and respects the submit close flag', async () => {
    const closeDialog = vi.fn()
    const submitDialogFormResult = vi.fn(async () => ({ found: true, ok: true }))
    const context = ctx({
      overlay: {
        state: { dialog: { title: '编辑' }, drawer: null, data: { name: 'Ada' } },
        openDialog: vi.fn(),
        openDrawer: vi.fn(),
        closeDialog,
        closeDrawer: vi.fn(),
        closeById: vi.fn(),
        close: vi.fn(),
        submitDialogFormResult,
      },
    })
    await runAction({ actionType: 'confirm', close: false }, context)
    expect(submitDialogFormResult).toHaveBeenCalledWith(false)
    expect(closeDialog).not.toHaveBeenCalled()
  })

  it('targets dialog setValue by id and applies override mode', async () => {
    const overlay = createOverlay()
    void overlay.openDialog({ id: 'dialog_setvalue', title: '数据' }, { username: 'amis', password: 'x' })
    const context = ctx({ overlay })
    await runAction({
      actionType: 'setValue',
      componentId: 'dialog_setvalue',
      args: { value: { username: 'vamis' } },
      dataMergeMode: 'override',
    }, context)
    expect(overlay.state.data).toEqual({ username: 'vamis' })
  })

  it('closes a named dialog after a generic button action', async () => {
    const overlay = createOverlay()
    void overlay.openDialog({ name: 'dialog_1', title: '父' })
    void overlay.openDialog({ title: '子' })
    const context = ctx({ overlay })
    await runAction({ type: 'button', close: 'dialog_1' }, context)
    expect(overlay.state.dialog).toBeNull()
    expect(overlay.state.dialogs).toHaveLength(0)
  })

  it('awaits ajax feedback and stops remaining actions on skipRestOnCancel', async () => {
    const event = createVamisEvent('click')
    const openDialog = vi.fn(async () => false as const)
    const context = ctx({
      event,
      overlay: {
        state: { dialog: null, drawer: null, data: {} },
        openDialog,
        openDrawer: vi.fn(),
        closeDialog: vi.fn(),
        closeDrawer: vi.fn(),
        closeById: vi.fn(),
        close: vi.fn(),
      },
    })
    await runActions([
      {
        actionType: 'ajax',
        api: '/api/mock2/form/saveForm',
        feedback: { body: '已保存', skipRestOnCancel: true },
      },
      { actionType: 'toast', args: { msg: '不应执行' } },
    ], context)
    expect(openDialog).toHaveBeenCalledTimes(1)
    expect(context.env.notify).toHaveBeenCalledTimes(1)
    expect(context.env.notify).toHaveBeenCalledWith('success', 'ok')
  })

  it('marks the current dialog busy while ajax is pending', async () => {
    let resolveFetch!: (value: any) => void
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve
    })
    const setDialogStatus = vi.fn()
    const context = ctx({
      env: {
        fetcher: vi.fn(() => fetchPromise),
        notify: vi.fn(),
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm: vi.fn(async () => true),
      },
      overlay: {
        state: { dialog: { title: '提交' }, drawer: null, data: {} },
        openDialog: vi.fn(),
        openDrawer: vi.fn(),
        closeDialog: vi.fn(),
        closeDrawer: vi.fn(),
        closeById: vi.fn(),
        close: vi.fn(),
        getActiveDialogKey: () => 7,
        setDialogStatus,
      },
    })
    const pending = runAction({ actionType: 'ajax', api: '/api/mock2/form/saveForm' }, context)
    expect(setDialogStatus).toHaveBeenCalledWith(7, { loading: true, error: '' })
    resolveFetch({ status: 0, msg: 'ok', data: {} })
    await pending
    expect(setDialogStatus).toHaveBeenLastCalledWith(7, { loading: false })
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
    expect(context.env.notify).toHaveBeenCalledWith('info', 'click', expect.any(Object))
  })

  it('interpolates event.data fields from the D4 subset', async () => {
    const context = ctx({
      data: withNativeEvent({ responseData: { date: 'x' } }, { type: 'inited' }),
    })
    await runOnEvent(
      {
        type: 'page',
        onEvent: {
          inited: {
            actions: [{ actionType: 'toast', args: { msgType: 'info', msg: '${event.data.responseData|json}' } }],
          },
        },
      },
      'inited',
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('info', '{"date":"x"}', expect.any(Object))
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
    expect(context.env.notify).toHaveBeenCalledWith('info', 'mouseenter', expect.any(Object))
  })

  it('toast reads Amis args.msgType as level', async () => {
    const context = ctx()
    await runAction({ actionType: 'toast', args: { msgType: 'warning', msg: 'careful' } }, context)
    expect(context.env.notify).toHaveBeenCalledWith(
      'warning',
      'careful',
      expect.objectContaining({ timeout: 4000, closeButton: false, showIcon: true }),
    )
  })

  it('toast.items each call env.notify with conf', async () => {
    const context = ctx()
    await runAction(
      {
        actionType: 'toast',
        toast: {
          position: 'bottom-center',
          items: [
            { body: '轻提示内容' },
            { body: '成功', level: 'success', timeout: 1000 },
          ],
        },
      },
      context,
    )
    expect(context.env.notify).toHaveBeenCalledTimes(2)
    expect(context.env.notify).toHaveBeenNthCalledWith(
      1,
      'info',
      '轻提示内容',
      expect.objectContaining({ position: 'bottom-center', timeout: 4000, closeButton: false }),
    )
    expect(context.env.notify).toHaveBeenNthCalledWith(
      2,
      'success',
      '成功',
      expect.objectContaining({ timeout: 1000, position: 'bottom-center' }),
    )
  })

  it('passes confirmTitle to env.confirm', async () => {
    const context = ctx()
    await runAction(
      {
        actionType: 'ajax',
        api: '/api/mock2/form/saveForm',
        confirmText: '确认要发出这个请求？',
        confirmTitle: '炸弹',
      },
      context,
    )
    expect(context.env.confirm).toHaveBeenCalledWith('确认要发出这个请求？', '炸弹')
  })

  it('canceling confirmText does not fetch', async () => {
    const context = ctx()
    context.env.confirm = vi.fn(async () => false)
    await runAction(
      { actionType: 'ajax', api: '/api/mock2/form/saveForm', confirmText: '确认要发出这个请求？' },
      context,
    )
    expect(context.env.fetcher).not.toHaveBeenCalled()
  })

  it('ignoreConfirm skips env.confirm so Action-level confirm is not doubled', async () => {
    const context = ctx()
    await runAction(
      {
        actionType: 'ajax',
        api: '/api/mock2/form/saveForm',
        confirmText: '确认要发出这个请求？',
        ignoreConfirm: true,
      },
      context,
    )
    expect(context.env.confirm).not.toHaveBeenCalled()
    expect(context.env.fetcher).toHaveBeenCalled()
  })

  it('confirmDialog cancel stops later actions', async () => {
    const event = createVamisEvent('click')
    const context = ctx({ event, data: { title: '操作确认', msg: '要删除它吗？' } })
    context.env.confirm = vi.fn(async () => false)
    await runActions(
      [
        { actionType: 'confirmDialog', dialog: { title: '${title}', msg: '${msg}' } },
        { actionType: 'toast', args: { msg: '确认ok啦！' } },
      ],
      context,
    )
    expect(context.env.confirm).toHaveBeenCalledWith('要删除它吗？', '操作确认', expect.any(Object))
    expect(context.env.notify).not.toHaveBeenCalled()
    expect(event.stopped).toBe(true)
    expect(event.prevented).toBe(true)
  })

  it('confirmDialog confirm continues later actions', async () => {
    const event = createVamisEvent('click')
    const context = ctx({ event })
    await runActions(
      [
        { actionType: 'confirmDialog', dialog: { title: '操作确认', msg: '要删除它吗？' } },
        { actionType: 'toast', args: { msg: '确认ok啦！' } },
      ],
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('info', '确认ok啦！', expect.any(Object))
  })

  it('custom confirmDialog waits for overlay result', async () => {
    const event = createVamisEvent('click')
    const openDialog = vi.fn(async () => false)
    const context = ctx({
      event,
      overlay: {
        state: { dialog: null, drawer: null, data: {} },
        openDialog,
        openDrawer: vi.fn(),
        closeDialog: vi.fn(),
        closeDrawer: vi.fn(),
        closeById: vi.fn(),
        close: vi.fn(),
      },
    })
    await runActions(
      [
        { actionType: 'confirmDialog', dialog: { type: 'dialog', title: '操作确认', body: { type: 'tpl', tpl: 'hi' } } },
        { actionType: 'toast', args: { msg: '确认ok啦！' } },
      ],
      context,
    )
    expect(openDialog).toHaveBeenCalled()
    expect(context.env.notify).not.toHaveBeenCalled()
    openDialog.mockResolvedValue({ name: 'Ada' })
    event.stopped = false
    event.prevented = false
    await runActions(
      [
        { actionType: 'confirmDialog', dialog: { type: 'dialog', title: '操作确认' } },
        { actionType: 'toast', args: { msg: '确认ok啦！' } },
      ],
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('info', '确认ok啦！', expect.any(Object))
    expect(event.data.name).toBe('Ada')
  })

  it('alert reads dialog.msg and title', async () => {
    const context = ctx({ data: { msg: '去吃饭了' } })
    await runAction(
      { actionType: 'alert', dialog: { title: '提示', msg: '<a href="#">${msg}~</a>' } },
      context,
    )
    expect(context.env.alert).toHaveBeenCalledWith('<a href="#">去吃饭了~</a>', '提示', undefined)
  })

  it('setEventData writes into event.data for later actions', async () => {
    const event = createVamisEvent('click')
    const context = ctx({ event, data: eventEvalData({ name: 'Ada' }, event) })
    await runActions(
      [
        { actionType: 'setEventData', args: { key: 'title', value: '页面标题：${name}' } },
        { actionType: 'toast', args: { msg: '${title}' } },
      ],
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('info', '页面标题：Ada', expect.any(Object))
  })

  it('wait uses args.time before later actions', async () => {
    vi.useFakeTimers()
    const context = ctx()
    const pending = runActions(
      [
        { actionType: 'wait', args: { time: 3000 } },
        { actionType: 'toast', args: { msg: 'done' } },
      ],
      context,
    )
    await vi.advanceTimersByTimeAsync(2999)
    expect(context.env.notify).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await pending
    expect(context.env.notify).toHaveBeenCalledWith('info', 'done', expect.any(Object))
    vi.useRealTimers()
  })

  it('stopPropagation actionType skips later actions', async () => {
    const event = createVamisEvent('click')
    const context = ctx({ event })
    await runActions(
      [
        { actionType: 'toast', args: { msg: '后续的动作将不会执行' } },
        { actionType: 'stopPropagation' },
        { actionType: 'toast', args: { msg: '动作2' } },
      ],
      context,
    )
    expect(context.env.notify).toHaveBeenCalledTimes(1)
    expect(context.env.notify).toHaveBeenCalledWith('info', '后续的动作将不会执行', expect.any(Object))
  })

  it('opens a mailto link for email actions', async () => {
    const context = ctx()
    await runAction(
      {
        actionType: 'email',
        to: 'amis@baidu.com',
        subject: '这是邮件主题',
        body: '这是邮件正文',
      },
      context,
    )
    expect(context.env.jumpTo).toHaveBeenCalledWith(
      'mailto:amis@baidu.com?subject=%E8%BF%99%E6%98%AF%E9%82%AE%E4%BB%B6%E4%B8%BB%E9%A2%98&body=%E8%BF%99%E6%98%AF%E9%82%AE%E4%BB%B6%E6%AD%A3%E6%96%87',
    )
  })

  it('ajax redirects and opens feedback after success', async () => {
    const openDialog = vi.fn()
    const context = ctx({
      overlay: {
        state: { dialog: null, drawer: null, data: {} },
        openDialog,
        openDrawer: vi.fn(),
        closeDialog: vi.fn(),
        closeDrawer: vi.fn(),
        closeById: vi.fn(),
        close: vi.fn(),
      },
    })
    await runAction(
      {
        actionType: 'ajax',
        api: '/api/mock2/form/saveForm',
        redirect: '/start/getting-started',
        feedback: { title: '操作成功', body: '${name} 已操作成功' },
      },
      context,
    )
    expect(context.env.jumpTo).toHaveBeenCalledWith('/start/getting-started', { blank: false })
    expect(openDialog).toHaveBeenCalledWith(
      { title: '操作成功', body: '${name} 已操作成功' },
      expect.objectContaining({ name: 'Ada' }),
    )
  })

  it('passes blank to jumpTo for url / link', async () => {
    const context = ctx()
    await runAction({ actionType: 'url', url: 'https://www.baidu.com', blank: true }, context)
    expect(context.env.jumpTo).toHaveBeenCalledWith('https://www.baidu.com', { blank: true, actionType: 'url' })
    const jumpCtx = ctx({ data: { myname: 'lvxj', myjon: 'player' } })
    await runAction(
      {
        actionType: 'url',
        args: {
          url: 'http://www.baidu.com',
          blank: true,
          params: { jon: '${myjon}' },
          name: '${myname}',
          age: 18,
        },
      },
      jumpCtx,
    )
    expect(jumpCtx.env.jumpTo).toHaveBeenCalledWith('http://www.baidu.com?jon=player&name=lvxj&age=18', {
      blank: true,
      actionType: 'url',
    })
    await runAction({ actionType: 'link', link: '/start/getting-started' }, context)
    expect(context.env.jumpTo).toHaveBeenCalledWith('/start/getting-started', { blank: false, actionType: 'link' })
  })

  it('copies html via copyFormat', async () => {
    const write = vi.fn(async () => undefined)
    const writeText = vi.fn(async () => undefined)
    vi.stubGlobal('navigator', { clipboard: { write, writeText } })
    vi.stubGlobal(
      'ClipboardItem',
      class {
        constructor(public items: Record<string, Blob>) {}
      },
    )
    const context = ctx()
    await runAction(
      { actionType: 'copy', copyFormat: 'text/html', content: '<b>bold</b>' },
      context,
    )
    expect(write).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('download treats the api as blob and saveAs uses the url', async () => {
    const click = vi.fn()
    const created: Array<Record<string, unknown>> = []
    const fakeDoc = {
      createElement: (tag: string) => {
        const el = { href: '', download: '', rel: '', target: '', click, remove: vi.fn() }
        if (tag === 'a') created.push(el)
        return el
      },
      body: { appendChild: vi.fn((node: unknown) => node) },
    }
    vi.stubGlobal('document', fakeDoc)
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:out', revokeObjectURL: vi.fn() })
    const blob = new Blob(['pdf'], { type: 'application/pdf' })
    const context = ctx({
      env: {
        fetcher: vi.fn(async () => ({ status: 0, msg: 'ok', data: blob, fileName: 'download.pdf' })),
        notify: vi.fn(),
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm: vi.fn(async () => true),
      },
    })
    await runAction({ actionType: 'download', api: '/api/download', downloadFileName: 'out.pdf' }, context)
    expect(context.env.fetcher).toHaveBeenCalled()
    expect(created.some((el) => el.download === 'out.pdf')).toBe(true)
    await runAction({ actionType: 'saveAs', api: '/api/download/report.csv', fileName: '保存的文件名' }, context)
    expect(created.some((el) => el.download === '保存的文件名')).toBe(true)
    expect(click).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('clear / clear-and-submit / reset-and-submit go through the form api', async () => {
    const clear = vi.fn()
    const reset = vi.fn()
    const submit = vi.fn(async () => undefined)
    const context = ctx({ form: { clear, reset, submit } })
    await runAction({ actionType: 'clear' }, context)
    expect(clear).toHaveBeenCalled()
    await runAction({ actionType: 'clear-and-submit' }, context)
    expect(submit).toHaveBeenCalled()
    await runAction({ actionType: 'reset-and-submit' }, context)
    expect(reset).toHaveBeenCalled()
    expect(submit).toHaveBeenCalledTimes(2)
  })

  it('stops when required fields fail validation', async () => {
    const validate = vi.fn(() => false)
    const context = ctx({ form: { validate, submit: vi.fn() } })
    const ran = await runAction({ actionType: 'submit', required: ['b'] }, context)
    expect(validate).toHaveBeenCalledWith(['b'])
    expect(ran).toBe(false)
    expect(context.env.notify).toHaveBeenCalledWith('error', '请检查表单')
    expect(context.form?.submit).not.toHaveBeenCalled()
  })

  it('ajax failure notifies and stops later actions unless ignoreError', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const event = createVamisEvent('click')
    const context = ctx({
      event,
      env: {
        fetcher: vi.fn(async () => ({ status: 500, msg: 'boom', data: {} })),
        notify: vi.fn(),
        jumpTo: vi.fn(),
        alert: vi.fn(),
        confirm: vi.fn(async () => true),
      },
    })
    await runActions(
      [
        { actionType: 'ajax', api: '/fail', messages: { failed: '失败了呢。。' } },
        { actionType: 'toast', args: { msg: '后续' } },
      ],
      context,
    )
    expect(context.env.notify).toHaveBeenCalledWith('error', '失败了呢。。')
    expect(context.env.notify).not.toHaveBeenCalledWith('info', '后续', expect.any(Object))
    expect(event.stopped).toBe(true)
    errors.mockRestore()
  })

  it('drawer waitForAction writes drawerResponse after close', async () => {
    const event = createVamisEvent('click')
    let close: ((value: Record<string, unknown> | false) => void) | undefined
    const openDrawer = vi.fn(
      () =>
        new Promise<Record<string, unknown> | false>((resolve) => {
          close = resolve
        }),
    )
    const context = ctx({
      event,
      overlay: {
        state: { dialog: null, drawer: null, data: {} },
        openDialog: vi.fn(),
        openDrawer,
        closeDialog: vi.fn(),
        closeDrawer: vi.fn(),
        closeById: vi.fn(),
        close: vi.fn(),
      },
    })
    const pending = runAction(
      { actionType: 'drawer', waitForAction: true, drawer: { title: '右' } },
      context,
    )
    close?.({ name: 'Ada' })
    await pending
    expect(event.data.drawerResponse).toEqual({ confirmed: true, value: { name: 'Ada' } })
  })

  it('visibility / usability write the status store', async () => {
    resetStatusStore()
    await runAction({ actionType: 'visibility', componentId: 'u:field', args: { value: false } }, ctx())
    expect(statusVisibleOf({ id: 'u:field' })).toBe(false)
    await runAction({ actionType: 'usability', componentId: 'u:field', args: { value: false } }, ctx())
    expect(statusDisabledOf({ id: 'u:field' })).toBe(true)
    resetStatusStore()
  })

  it('print with componentId calls the target doAction', async () => {
    const doAction = vi.fn()
    const scoped = new ScopedContext()
    scoped.register({ name: 'mycrud', doAction })
    const context = ctx({ scoped })
    const print = { actionType: 'print', componentId: 'mycrud' }
    await runAction(print, context)
    expect(doAction).toHaveBeenCalledWith(print, expect.any(Object))
  })
})
