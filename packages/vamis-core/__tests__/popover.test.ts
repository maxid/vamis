import { describe, expect, it } from 'vitest'
import {
  popOverBodyNode,
  popOverEnabled,
  popOverFieldSchema,
  popOverMode,
  popOverOffset,
  popOverPosition,
  popOverShowIcon,
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
    expect(popOverMode({})).toBe('popOver')
    expect(popOverMode({ popOver: { mode: 'dialog' } })).toBe('dialog')
    expect(popOverMode({ popOver: { mode: 'drawer' } })).toBe('drawer')
    expect(popOverPosition({})).toBe('center')
    expect(popOverPosition({ popOver: { position: 'left-top' } })).toBe('left-top')
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
