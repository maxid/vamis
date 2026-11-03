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
        close: vi.fn(),
      },
    })
    await runAction({ actionType: 'confirm' }, context)
    expect(closeDialog).toHaveBeenCalled()
    expect(confirm).not.toHaveBeenCalled()
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
})
