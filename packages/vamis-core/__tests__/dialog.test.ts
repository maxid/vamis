import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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
    expect(dialogSizeClass({})).toContain('min-[576px]:max-w-[500px]')
    expect(dialogSizeClass({})).not.toContain('sm:max-w-[')
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
    expect(dialogBody({ body: { type: 'form', body: [{ type: 'static', name: 'engine' }] } })).toEqual([
      {
        type: 'form',
        mode: 'horizontal',
        wrapWithPanel: false,
        body: [{ type: 'static', name: 'engine' }],
      },
    ])
    expect(
      dialogBody({ body: { type: 'form', wrapWithPanel: true, mode: 'inline', body: [] } }),
    ).toEqual([{ type: 'form', wrapWithPanel: true, mode: 'inline', body: [] }])
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
    expect(overlayFrameStyle({}, 'dialog')).toEqual({})
    expect(overlayFrameStyle({ width: 320, height: 200 }, 'dialog')).toEqual({
      maxWidth: '320px',
      height: '200px',
    })
  })

  it('pins dialog to Amis Modal startMarginTop 60px, not vertical center', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const vue = readFileSync(resolve(here, '../../vamis-ui/src/ui/dialog/DialogContent.vue'), 'utf8')
    expect(vue).toContain('top-[60px]')
    expect(vue).not.toContain('top-[50%]')
    expect(vue).not.toContain('translate-y-[-50%]')
  })

  it('keeps overlay footer in a row on mobile, matching Amis down(sm)', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const footer = readFileSync(resolve(here, '../../vamis-ui/src/ui/dialog/DialogFooter.vue'), 'utf8')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(footer).toContain('flex-row')
    expect(footer).not.toContain('flex-col-reverse')
    expect(footer).not.toContain('sm:flex-row')
    expect(css).toContain('@media (max-width: 575.98px)')
    expect(css).toContain("data-slot='dialog-footer'] [data-slot='button']")
    expect(css).toContain('height: 44px')
  })

  it('close button uses Amis data-tooltip 关闭 on the left', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const vue = readFileSync(resolve(here, '../../vamis-ui/src/ui/dialog/DialogContent.vue'), 'utf8')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(vue).toContain('data-tooltip="关闭"')
    expect(vue).toContain('data-position="left"')
    expect(css).toContain("[data-tooltip]::after")
    expect(css).toContain("content: attr(data-tooltip)")
    expect(css).toContain("[data-tooltip][data-position='left']::after")
  })
})
