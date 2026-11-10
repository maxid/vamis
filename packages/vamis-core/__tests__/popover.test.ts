import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  popOverBodyNode,
  popOverEnabled,
  popOverFieldSchema,
  popOverMode,
  popOverOffset,
  popOverPosition,
  popOverPositionTarget,
  popOverShowIcon,
  popOverTextOverflow,
  popOverTitle,
  popOverTrigger,
} from '../src/utils/popover'

describe('popOver defaults', () => {
  it('defaults click / showIcon / popOver / center, and respects enable flags', () => {
    expect(popOverEnabled({})).toBe(false)
    expect(popOverEnabled({ popOver: false })).toBe(false)
    expect(popOverEnabled({ popOver: true })).toBe(true)
    expect(popOverEnabled({ popOver: '弹出甲' })).toBe(true)
    expect(popOverEnabled({ popOver: '弹出甲', popOverEnable: false })).toBe(false)
    expect(popOverEnabled({ popOver: '弹出甲', popOverEnabled: false })).toBe(false)
    expect(popOverEnabled({ popOver: '弹出甲', popOverEnableOn: 'this.id == 1' }, { id: 1 })).toBe(true)
    expect(popOverEnabled({ popOver: '弹出甲', popOverEnableOn: 'this.id == 1' }, { id: 2 })).toBe(false)
    expect(popOverTrigger({})).toBe('click')
    expect(popOverTrigger({ popOver: { trigger: 'hover' } })).toBe('hover')
    expect(popOverShowIcon({ popOver: true })).toBe(true)
    expect(popOverShowIcon({ popOver: { showIcon: false } })).toBe(false)
    expect(popOverShowIcon({ textOverflow: 'ellipsis' })).toBe(false)
    expect(popOverEnabled({ textOverflow: 'ellipsis' })).toBe(true)
    expect(popOverTrigger({ textOverflow: 'ellipsis' })).toBe('hover')
    expect(popOverTextOverflow({ textOverflow: 'ellipsis' })).toBe('ellipsis')
    expect(popOverTextOverflow({ textOverflow: 'noWrap' })).toBe('noWrap')
    expect(popOverMode({})).toBe('popOver')
    expect(popOverMode({ popOver: { mode: 'dialog' } })).toBe('dialog')
    expect(popOverMode({ popOver: { mode: 'drawer' } })).toBe('drawer')
    expect(popOverPosition({})).toBe('center')
    expect(popOverPosition({ textOverflow: 'ellipsis' })).toBe('auto')
    expect(popOverPosition({ popOver: { position: 'left-top' } })).toBe('left-top')
    expect(popOverPosition({ popOver: { position: 'right' } })).toBe('right')
    expect(popOverPosition({ popOver: '弹出甲' }, 'right')).toBe('right')
    expect(popOverBodyNode({ name: 'engine', textOverflow: 'ellipsis' })).toEqual({
      type: 'tpl',
      tpl: '${engine}',
    })
    expect(popOverOffset({ popOver: { offset: { left: 4, top: 8 } } })).toEqual({ x: 4, y: 8 })
  })

  it('builds body from true / string / object, and reads title', () => {
    expect(popOverBodyNode({ name: 'engine', popOver: true })).toEqual({ type: 'tpl', tpl: '${engine}' })
    expect(popOverBodyNode({ popOver: '全文甲' })).toEqual({ type: 'tpl', tpl: '全文甲' })
    expect(popOverBodyNode({ popOver: { body: '对象甲' } })).toEqual({ type: 'tpl', tpl: '对象甲' })
    expect(popOverBodyNode({ popOver: { body: { type: 'tpl', tpl: '${engine}' } } })).toEqual({
      type: 'tpl',
      tpl: '${engine}',
    })
    expect(popOverTitle({ popOver: { title: '标题甲' } })).toBe('标题甲')
    expect(popOverTitle({ popOver: '全文甲' })).toBe('')
  })

  it('uses the table cell as overlay target (Amis targetOutter), icon/wrap outside tables', () => {
    const btn = {} as HTMLElement
    const wrap = {} as HTMLElement
    const td = { tagName: 'TD' } as HTMLElement
    const hostInCell = {
      closest(sel: string) {
        return sel.split(',').some((part) => part.trim() === 'td') ? td : null
      },
    } as unknown as Element
    const hostOutside = { closest: () => null } as unknown as Element
    expect(popOverPositionTarget(hostInCell, { showIcon: true, btn, wrap })).toBe(td)
    expect(popOverPositionTarget(hostInCell, { showIcon: false, btn, wrap })).toBe(td)
    expect(popOverPositionTarget(hostOutside, { showIcon: true, btn, wrap })).toBe(btn)
    expect(popOverPositionTarget(hostOutside, { showIcon: false, btn, wrap })).toBe(wrap)
    expect(popOverPositionTarget(null, { showIcon: true, btn, wrap })).toBe(btn)
    expect(popOverPositionTarget(null, { showIcon: false, btn, wrap })).toBe(wrap)
  })
})

describe('popOverFieldSchema', () => {
  it('keeps typed nodes and lifts nameless fields', () => {
    expect(popOverFieldSchema({ type: 'tpl', tpl: '甲' })).toEqual({ type: 'tpl', tpl: '甲' })
    expect(popOverFieldSchema({ name: 'engine', popOver: '全文甲' })).toEqual({
      type: 'field',
      name: 'engine',
      popOver: '全文甲',
    })
    expect(popOverFieldSchema('纯文本甲')).toEqual({ type: 'tpl', tpl: '纯文本甲' })
  })
})

describe('popOver renderer / docs', () => {
  it('uses VamisOverlay, Amis zoom-in, and layer tokens instead of shadcn popover', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const host = readFileSync(resolve(here, '../../vamis/src/renderers/PopOverHost.vue'), 'utf8')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    const docs = readFileSync(resolve(here, '../../../website/src/components/popover.md'), 'utf8')
    expect(host).toContain('VamisOverlay')
    expect(host).toContain('popOverPositionTarget')
    expect(host).toContain('defaultPosition')
    const staticVue = readFileSync(resolve(here, '../../vamis/src/renderers/form/Static.vue'), 'utf8')
    expect(staticVue).toContain('default-position="right"')
    expect(host).toContain('VamisGalleryToolIcon')
    expect(host).toContain('name="zoom-in"')
    expect(host).not.toContain('ZoomInIcon')
    expect(host).not.toContain('bg-popover')
    expect(host).not.toContain('z-50')
    expect(css).toContain('--popover-layer-min: 320px')
    expect(css).toContain('--popover-layer-max: 640px')
    expect(css).toContain('.vamis-overlay--popover')
    expect(css).toContain('z-index: var(--z-popover, 1400)')
    expect(css).toContain('.vamis-list-field__value .vamis-popover-host')
    expect(css).toContain('top: 0.125em')
    expect(css).toContain('.vamis-list-field__label')
    expect(css).toContain('[data-vamis-list-items]')
    expect(css).toContain('--list-items-margin-right: 15px')
    expect(css).toContain('.vamis-crud-toolbar')
    expect(css).toContain('.vamis-crud-toolbar-item--left')
    expect(css).toContain('.vamis-crud-filter')
    expect(css).toContain('.vamis-crud-body')
    expect(css).toContain('.vamis-table-foot-toolbar')
    expect(css).toContain('float: left')
    expect(css).toContain('float: right')
    expect(css).toContain('clear: both')
    expect(docs).toContain('基本配置')
    expect(docs).toContain('Rendering engine')
    expect(docs).toContain('${engine|truncate:6}')
    expect(docs).toContain('/api/mock2/sample')
    expect(docs).toContain('textOverflow')
    expect(docs).not.toContain('fa 放大镜未接')
    expect(docs).not.toContain('浮层像素级')
    const crud = readFileSync(resolve(here, '../../vamis/src/renderers/CRUD.vue'), 'utf8')
    expect(crud).toContain('PopOverHost')
    expect(crud).toContain('Pagination')
    expect(crud).toContain('vamis-crud-statistics')
    expect(crud).toContain('vamis-crud-filter')
    expect(crud).toContain('vamis-crud-body')
    expect(crud).toContain('vamis-table-foot-toolbar')
    expect(crud).toContain('maxButtons: 9')
    expect(crud).not.toContain('上一页')
    expect(crud).not.toContain('space-y-3')
    expect(docs).toContain('1710')
    const list = readFileSync(resolve(here, '../../vamis/src/renderers/List.vue'), 'utf8')
    expect(list).not.toContain("'${title}'")
    expect(list).toContain('data-vamis-list-items')
    expect(list).not.toContain('<ul')
    const listItem = readFileSync(resolve(here, '../../vamis/src/renderers/rest/ListItem.vue'), 'utf8')
    expect(listItem).toContain('provideListItemField')
    expect(listItem).not.toContain('列表项')
  })
})
