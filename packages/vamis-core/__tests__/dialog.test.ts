import { describe, expect, it } from 'vitest'
import {
  dialogActions,
  dialogBody,
  dialogCloseOnEsc,
  dialogCloseOnOutside,
  dialogShowClose,
  dialogSize,
  dialogSizeClass,
  dialogTitle,
  overlayFrameStyle,
} from '../src/utils/dialog'

describe('dialog defaults', () => {
  it('defaults size empty / showClose true / closeOnEsc false / closeOnOutside false', () => {
    expect(dialogSize({})).toBe('')
    expect(dialogSize({ size: 'sm' })).toBe('sm')
    expect(dialogSize({ size: 'md' })).toBe('md')
    expect(dialogSize({ size: 'lg' })).toBe('lg')
    expect(dialogSize({ size: 'xl' })).toBe('xl')
    expect(dialogSize({ size: 'full' })).toBe('full')
    expect(dialogSize({ size: 'xs' })).toBe('xs')
    expect(dialogSize({ size: 'oops' })).toBe('')
    expect(dialogShowClose({})).toBe(true)
    expect(dialogShowClose({ showCloseButton: false })).toBe(false)
    expect(dialogShowClose({ showCloseButton: true })).toBe(true)
    expect(dialogCloseOnEsc({})).toBe(false)
    expect(dialogCloseOnEsc({ closeOnEsc: true })).toBe(true)
    expect(dialogCloseOnOutside({})).toBe(false)
    expect(dialogCloseOnOutside({ closeOnOutside: true })).toBe(true)
  })

  it('maps size to max-width classes', () => {
    expect(dialogSizeClass({})).toContain('500px')
    expect(dialogSizeClass({ size: 'sm' })).toContain('350px')
    expect(dialogSizeClass({ size: 'md' })).toContain('800px')
    expect(dialogSizeClass({ size: 'lg' })).toContain('1100px')
    expect(dialogSizeClass({ size: 'xl' })).toContain('90%')
    expect(dialogSizeClass({ size: 'full' })).toContain('max-w-none')
    expect(dialogSizeClass({ size: 'xs' })).toContain('200px')
  })

  it('reads title / body / default actions / custom width', () => {
    expect(dialogTitle({ title: '提示 ${who}' }, { who: '甲' })).toBe('提示 甲')
    expect(dialogTitle({})).toBe('')
    expect(dialogBody({ body: '文案' })).toEqual(['文案'])
    expect(dialogBody({ body: { type: 'tpl', tpl: '节点' } })).toEqual([{ type: 'tpl', tpl: '节点' }])
    expect(dialogBody({})).toEqual([])
    expect(dialogActions({})).toEqual([
      { type: 'button', actionType: 'cancel', label: '取消' },
      { type: 'button', actionType: 'confirm', label: '确认', primary: true },
    ])
    expect(dialogActions({ confirm: false })).toEqual([{ type: 'button', actionType: 'cancel', label: '取消' }])
    expect(dialogActions({ actions: [] })).toEqual([])
    expect(dialogActions({ actions: [{ type: 'button', label: '自定义' }] })).toEqual([
      { type: 'button', label: '自定义' },
    ])
    expect(overlayFrameStyle({}, 'dialog')).toEqual({ maxWidth: '500px' })
    expect(overlayFrameStyle({ width: 320, height: 200 }, 'dialog')).toEqual({
      maxWidth: '320px',
      height: '200px',
    })
  })
})
