import { describe, expect, it } from 'vitest'
import {
  drawerActions,
  drawerBody,
  drawerCloseOnEsc,
  drawerCloseOnOutside,
  drawerPosition,
  drawerShowClose,
  drawerShowOverlay,
  drawerSize,
  drawerSizeClass,
  drawerTitle,
} from '../src/utils/drawer'
import { overlayFrameStyle } from '../src/utils/dialog'

describe('drawer defaults', () => {
  it('defaults position right / size empty / showClose true / overlay true', () => {
    expect(drawerPosition({})).toBe('right')
    expect(drawerPosition({ position: 'left' })).toBe('left')
    expect(drawerPosition({ position: 'top' })).toBe('top')
    expect(drawerPosition({ position: 'bottom' })).toBe('bottom')
    expect(drawerPosition({ position: 'oops' })).toBe('right')
    expect(drawerSize({})).toBe('')
    expect(drawerSize({ size: 'xs' })).toBe('xs')
    expect(drawerSize({ size: 'xl' })).toBe('xl')
    expect(drawerShowClose({})).toBe(true)
    expect(drawerShowClose({ showCloseButton: false })).toBe(false)
    expect(drawerShowOverlay({})).toBe(true)
    expect(drawerShowOverlay({ overlay: false })).toBe(false)
    expect(drawerCloseOnEsc({})).toBe(false)
    expect(drawerCloseOnEsc({ closeOnEsc: true })).toBe(true)
    expect(drawerCloseOnOutside({})).toBe(false)
  })

  it('maps size to width / height classes by position', () => {
    expect(drawerSizeClass({})).toContain('400px')
    expect(drawerSizeClass({ size: 'xs' })).toContain('200px')
    expect(drawerSizeClass({ size: 'sm' })).toContain('300px')
    expect(drawerSizeClass({ size: 'md' })).toContain('500px')
    expect(drawerSizeClass({ size: 'lg' })).toContain('800px')
    expect(drawerSizeClass({ size: 'xl' })).toContain('90%')
    expect(drawerSizeClass({ position: 'bottom', size: 'sm' })).toContain('h-[300px]')
  })

  it('reads title / body / default close+confirm / custom size', () => {
    expect(drawerTitle({ title: '抽屉 ${who}' }, { who: '甲' })).toBe('抽屉 甲')
    expect(drawerBody({ body: '文案' })).toEqual(['文案'])
    expect(drawerBody({ body: { type: 'form', body: [] } })).toEqual([
      { type: 'form', mode: 'horizontal', wrapWithPanel: false, body: [] },
    ])
    expect(drawerActions({})).toEqual([
      { type: 'button', actionType: 'close', label: '取消' },
      { type: 'button', actionType: 'confirm', label: '确认', primary: true },
    ])
    expect(drawerActions({ actions: [] })).toEqual([])
    expect(overlayFrameStyle({ width: 300 }, 'drawer')).toMatchObject({ width: '300px', maxWidth: '300px' })
    expect(overlayFrameStyle({ position: 'bottom', height: 240 }, 'drawer')).toMatchObject({
      height: '240px',
      maxHeight: '240px',
    })
  })
})
