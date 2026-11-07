import { describe, expect, it } from 'vitest'
import { pushToast, resetToasts, useToastState } from '../src/toast-store'
import {
  isMobileToast,
  toastNotices,
  toastSchemaObject,
  toastPosition,
  toastTimeout,
} from '../src/utils/toast'

describe('toast notices', () => {
  it('defaults position / timeout / closeButton / showIcon / allowHtml', () => {
    expect(toastPosition()).toBe('top-center')
    expect(toastPosition('bottom-left')).toBe('bottom-left')
    expect(toastPosition('nope')).toBe('top-center')
    expect(toastPosition(undefined, true)).toBe('center')
    expect(toastTimeout('info')).toBe(4000)
    expect(toastTimeout('error')).toBe(6000)
    expect(toastTimeout('error', 1000)).toBe(1000)
    expect(toastTimeout('info', undefined, true)).toBe(3000)
  })

  it('reads toast.items and lets item override toast-level conf', () => {
    const notices = toastNotices(
      {
        actionType: 'toast',
        toast: {
          position: 'bottom-center',
          timeout: 1000,
          closeButton: true,
          showIcon: false,
          items: [
            { body: '轻提示内容', level: 'success' },
            { body: '另一条', position: 'top-left', timeout: 3000, closeButton: false, showIcon: true },
          ],
        },
      },
      {},
    )
    expect(notices).toEqual([
      {
        level: 'success',
        body: '轻提示内容',
        title: '',
        position: 'bottom-center',
        timeout: 1000,
        closeButton: true,
        showIcon: false,
        allowHtml: true,
      },
      {
        level: 'info',
        body: '另一条',
        title: '',
        position: 'top-left',
        timeout: 3000,
        closeButton: false,
        showIcon: true,
        allowHtml: true,
      },
    ])
  })

  it('falls back to msg / args.msg when there are no items', () => {
    expect(toastNotices({ actionType: 'toast', msg: 'hi ${name}' }, { name: 'Ada' })).toEqual([
      {
        level: 'info',
        body: 'hi Ada',
        title: '',
        position: 'top-center',
        timeout: 4000,
        closeButton: false,
        showIcon: true,
        allowHtml: true,
      },
    ])
    expect(
      toastNotices({ actionType: 'toast', args: { msgType: 'warning', msg: 'careful', timeout: 2000 } }, {}),
    ).toMatchObject({ 0: { level: 'warning', body: 'careful', timeout: 2000 } })
  })

  it('interpolates title and treats allowHtml false as text', () => {
    const notices = toastNotices(
      {
        actionType: 'toast',
        toast: {
          items: [{ title: '给 ${name}', body: '<b>hi</b>', allowHtml: false, level: 'error' }],
        },
      },
      { name: 'Ada' },
    )
    expect(notices[0]).toMatchObject({
      title: '给 Ada',
      body: '<b>hi</b>',
      level: 'error',
      timeout: 6000,
      allowHtml: false,
    })
  })

  it('mobile notices default center / 3000 but keep explicit position', () => {
    expect(toastNotices({ actionType: 'toast', msg: 'hi' }, {}, true)[0]).toMatchObject({
      position: 'center',
      timeout: 3000,
    })
    expect(
      toastNotices(
        { actionType: 'toast', toast: { position: 'top-left', items: [{ body: '角落' }] } },
        {},
        true,
      )[0],
    ).toMatchObject({ position: 'top-left', timeout: 3000, body: '角落' })
    expect(typeof isMobileToast()).toBe('boolean')
  })

  it('keeps SchemaNode title/body instead of flattening to text', () => {
    const tpl = { type: 'tpl', className: 'text-danger', tpl: '这是 schema 节点 ${name}' }
    const title = { type: 'tpl', tpl: '标题' }
    expect(toastSchemaObject(tpl)).toEqual(tpl)
    expect(toastSchemaObject([tpl, title])).toEqual({ type: 'wrapper', body: [tpl, title] })
    expect(toastSchemaObject({ tpl: 'plain' })).toBeNull()
    const notices = toastNotices(
      {
        actionType: 'toast',
        toast: {
          items: [{ title, body: tpl }],
        },
      },
      { name: 'Ada' },
    )
    expect(notices[0]).toMatchObject({
      title: '',
      body: '',
      titleSchema: title,
      bodySchema: tpl,
    })
  })

  it('pushToast snapshots bodySchema and click-time data', () => {
    resetToasts()
    const schema = { type: 'tpl', tpl: 'hi ${name}' }
    const data = { name: 'Ada' }
    pushToast('info', '', { bodySchema: schema, data })
    const item = useToastState().items[0]
    expect(item.bodySchema).toEqual(schema)
    expect(item.data).toEqual({ name: 'Ada' })
    expect(item.data).not.toBe(data)
    resetToasts()
  })
})

