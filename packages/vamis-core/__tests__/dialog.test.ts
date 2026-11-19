import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  dialogActions,
  dialogBody,
  dialogCloseOnEsc,
  dialogCloseOnOutside,
  dialogDisabled,
  dialogDraggable,
  dialogShowError,
  dialogShowClose,
  dialogShowLoading,
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
    expect(dialogSize({ size: 'custom' })).toBe('custom')
    expect(dialogSize({ size: 'oops' })).toBe('')
    expect(dialogShowClose({})).toBe(true)
    expect(dialogShowClose({ showCloseButton: false })).toBe(false)
    expect(dialogShowClose({ showCloseButton: true })).toBe(true)
    expect(dialogCloseOnEsc({})).toBe(false)
    expect(dialogCloseOnEsc({ closeOnEsc: true })).toBe(true)
    expect(dialogCloseOnOutside({})).toBe(false)
    expect(dialogCloseOnOutside({ closeOnOutside: true })).toBe(true)
    expect(dialogShowError({})).toBe(true)
    expect(dialogShowError({ showErrorMsg: false })).toBe(false)
    expect(dialogShowLoading({})).toBe(true)
    expect(dialogShowLoading({ showLoading: false })).toBe(false)
    expect(dialogDisabled({ disabled: true })).toBe(true)
    expect(dialogDraggable({ draggable: true })).toBe(true)
    expect(dialogDraggable({})).toBe(false)
  })

  it('maps size to complete max-width class literals, not runtime templates', () => {
    expect(dialogSizeClass({})).toBe('w-full max-w-[500px] vamis-dialog--default')
    expect(dialogSizeClass({})).not.toContain('max-w-none')
    expect(dialogSizeClass({})).not.toContain('${')
    expect(dialogSizeClass({})).not.toContain('min-[576px]')
    expect(dialogSizeClass({ size: 'sm' })).toContain('max-w-[350px]')
    expect(dialogSizeClass({ size: 'md' })).toContain('max-w-[800px]')
    expect(dialogSizeClass({ size: 'lg' })).toContain('max-w-[1100px]')
    expect(dialogSizeClass({ size: 'xl' })).toContain('max-w-[90%]')
    expect(dialogSizeClass({ size: 'full' })).toContain('max-w-none')
    expect(dialogSizeClass({ size: 'xs' })).toContain('max-w-[200px]')
    expect(dialogSizeClass({ size: 'custom' })).toContain('vamis-dialog--custom')
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
    expect(overlayFrameStyle({ size: 'custom', width: 640, height: 320 }, 'dialog')).toEqual({
      width: '640px',
      height: '320px',
    })
    expect(dialogBody({ body: { type: 'form', body: [] } }, true)).toEqual([
      { disabled: true, type: 'form', mode: 'horizontal', wrapWithPanel: false, body: [] },
    ])
    expect(dialogActions({}, true)).toEqual([
      { type: 'button', actionType: 'cancel', label: '取消', disabled: true },
      { type: 'button', actionType: 'confirm', label: '确认', primary: true, disabled: true },
    ])
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
    expect(css).toContain("data-slot='dialog-footer'] [data-vamis-action]")
    expect(css).toContain("data-slot='dialog-footer'] [data-slot='button']")
    expect(css).toContain('height: 44px')
  })

  it('keeps desktop dialog 500px; 100% width only under 576', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    const content = readFileSync(resolve(here, '../../vamis-ui/src/ui/dialog/DialogContent.vue'), 'utf8')
    const src = readFileSync(resolve(here, '../src/utils/dialog.ts'), 'utf8')
    const mobileAt = css.indexOf('@media (max-width: 575.98px)')
    const desktopAt = css.indexOf('.vamis-dialog--default')
    expect(desktopAt).toBeGreaterThan(-1)
    expect(mobileAt).toBeGreaterThan(desktopAt)
    expect(css.slice(desktopAt, mobileAt)).toContain('max-width: 500px')
    expect(css.slice(mobileAt)).toContain('max-width: none')
    expect(content).not.toContain('max-w-none')
    expect(src).not.toContain('min-[576px]:max-w-')
    const fn = src.slice(src.indexOf('export function dialogSizeClass'), src.indexOf('export function dialogShowClose'))
    expect(fn).toContain("max-w-[500px]")
    expect(fn).not.toContain('${')
  })

  it('uses the Amis Modal flex column box model instead of shadcn grid spacing', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const content = readFileSync(resolve(here, '../../vamis-ui/src/ui/dialog/DialogContent.vue'), 'utf8')
    const header = readFileSync(resolve(here, '../../vamis-ui/src/ui/dialog/DialogHeader.vue'), 'utf8')
    const host = readFileSync(resolve(here, '../../vamis/src/OverlayHost.vue'), 'utf8')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(content).toContain('flex w-full translate-x-[-50%] flex-col')
    expect(content).not.toContain('grid w-full')
    expect(content).not.toContain('gap-3')
    expect(content).not.toContain('p-5')
    expect(content).not.toContain('animate-in')
    expect(content).not.toContain('zoom-in-95')
    expect(content).not.toContain('duration-200')
    expect(header).toContain('text-left')
    expect(header).not.toContain('sm:text-left')
    expect(host).toContain('data-vamis-overlay-body="dialog"')
    expect(host).toContain('vamis-dialog-body-loading')
    expect(host).toContain('vamis-dialog-body-loading-mask')
    expect(host.match(/<VamisSpinnerMark/g)).toHaveLength(1)
    expect(host).toContain("translate: 'none'")
    expect(host).toContain('data-vamis-dialog-key')
    expect(host).toContain('<DialogCloseButton')
    expect(host).toContain('clampDraggedDialogs')
    expect(host).toContain("window.addEventListener('resize'")
    expect(host).not.toContain('transform: `translate')
    expect(css).toContain("[data-vamis-overlay='dialog'] {\n  padding: 24px 0;")
    expect(css).toContain("[data-vamis-overlay-body='dialog'] {")
    expect(css).toContain('position: relative;')
    expect(css).toContain('flex: 1 1 auto;')
    expect(css).toContain('margin: 13px 0 21px;')
    expect(css).toContain('padding: 3px 24px;')
    expect(css).toContain('--modal-overlay-bg: rgba(0, 0, 0, 0.7);')
    expect(css).toContain('.vamis-dialog-body-loading {')
    expect(css).toContain('z-index: var(--z-spinner);')
    expect(css).toContain('width: 32px;')
    expect(css).toContain('height: 32px;')
    expect(css).toContain('@keyframes vamis-dialog-loading-mask-in')
    expect(css).toContain("[data-vamis-overlay='dialog'] [data-slot='dialog-close'] {\n  display: inline-flex;\n  width: 16px;\n  height: 22px;")
  })

  it('close button uses Amis data-tooltip 关闭 on the left', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const vue = readFileSync(resolve(here, '../../vamis-ui/src/ui/dialog/DialogCloseButton.vue'), 'utf8')
    const host = readFileSync(resolve(here, '../../vamis/src/OverlayHost.vue'), 'utf8')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(vue).toContain('data-tooltip="关闭"')
    expect(vue).toContain('data-position="left"')
    expect(host.indexOf('<DialogHeader')).toBeLessThan(host.indexOf('<DialogCloseButton'))
    expect(css).toContain("[data-tooltip]::after")
    expect(css).toContain("content: attr(data-tooltip)")
    expect(css).toContain("[data-tooltip][data-position='left']::after")
    expect(css).toContain('animation-name: tooltipIn')
    expect(css).toContain('@keyframes tooltipIn')
  })
})
