import { describe, expect, it } from 'vitest'
import {
  panelActions,
  panelAffixFooter,
  panelBody,
  panelCollapsible,
  panelFooter,
  panelHeader,
  panelShowBody,
  panelShowHeading,
  panelTitle,
} from '../src/utils/panel'

describe('panel heading', () => {
  it('uses title unless header is set', () => {
    expect(panelShowHeading({})).toBe(false)
    expect(panelShowHeading({ title: '面板标题' })).toBe(true)
    expect(panelTitle({ title: '面板标题' })).toBe('面板标题')
    expect(panelShowHeading({ title: false })).toBe(false)
    expect(panelShowHeading({ title: '' })).toBe(false)
  })

  it('lets header replace title', () => {
    expect(panelHeader({ header: '自定义头', title: '面板标题' })).toBe('自定义头')
    expect(panelTitle({ header: '自定义头', title: '面板标题' })).toBeUndefined()
    expect(panelShowHeading({ header: { type: 'tpl', tpl: '头' } })).toBe(true)
  })
})

describe('panel body / footer / actions', () => {
  it('keeps string body and omits empty', () => {
    expect(panelShowBody({ body: '面板内容' })).toBe(true)
    expect(panelBody({ body: '面板内容' })).toEqual(['面板内容'])
    expect(panelShowBody({})).toBe(false)
    expect(panelBody({ body: ['a', 'b'] })).toEqual(['a', 'b'])
  })

  it('reads footer nodes', () => {
    expect(panelFooter({ footer: '底部' })).toEqual(['底部'])
    expect(panelFooter({})).toEqual([])
  })

  it('defaults action type to button like Amis render', () => {
    expect(panelActions({})).toEqual([])
    expect(
      panelActions({
        actions: [{ label: '按钮 1', actionType: 'dialog' }, { type: 'submit', label: '提交' }],
      }),
    ).toEqual([
      { label: '按钮 1', actionType: 'dialog', type: 'button' },
      { type: 'submit', label: '提交' },
    ])
  })
})

describe('panel affixFooter / collapsible', () => {
  it('treats true and always as sticky footer', () => {
    expect(panelAffixFooter({})).toBe(false)
    expect(panelAffixFooter({ affixFooter: true })).toBe(true)
    expect(panelAffixFooter({ affixFooter: 'always' })).toBe(true)
  })

  it('keeps collapsible opt-in', () => {
    expect(panelCollapsible({})).toBe(false)
    expect(panelCollapsible({ collapsible: true })).toBe(true)
  })
})
