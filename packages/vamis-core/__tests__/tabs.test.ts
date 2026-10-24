import { describe, expect, it } from 'vitest'
import {
  tabBody,
  tabDisabled,
  tabKey,
  tabTitle,
  tabsFromSource,
  tabsInitialActive,
  tabsMode,
  tabsMountOnEnter,
  tabsNormalizeActive,
  tabsUnmountOnExit,
} from '../src/utils/tabs'

describe('tabsMode', () => {
  it('defaults to line', () => {
    expect(tabsMode({})).toBe('line')
    expect(tabsMode({ tabsMode: 'vertical' })).toBe('vertical')
    expect(tabsMode({ tabsMode: 'nope' })).toBe('line')
  })
})

describe('tabKey / tabBody', () => {
  it('uses hash then index, and body falls back to tab', () => {
    expect(tabKey({ hash: 'tab2' }, 1)).toBe('tab2')
    expect(tabKey({ title: 'Tab 1' }, 0)).toBe('0')
    expect(tabBody({ tab: 'Content 1' })).toEqual(['Content 1'])
    expect(tabBody({ body: '选项卡内容1' })).toEqual(['选项卡内容1'])
  })
})

describe('tabsFromSource', () => {
  it('repeats the template over the source array like Amis', () => {
    const schema = {
      source: '${arr}',
      tabs: [{ title: '${a}', body: { type: 'tpl', tpl: '${b}' } }],
    }
    const tabs = tabsFromSource(schema, {
      arr: [
        { a: '收入', b: 199 },
        { a: '支出', b: 299 },
      ],
    })
    expect(tabs).toHaveLength(2)
    expect(tabTitle(tabs[0], { a: '收入', b: 199 })).toBe('收入')
    expect(tabTitle(tabs[1], { a: '支出', b: 299 })).toBe('支出')
  })
})

describe('tabsInitialActive', () => {
  it('honors activeKey hash or index', () => {
    const tabs = [
      { title: 'Tab 1', hash: 'tab1' },
      { title: 'Tab 2', hash: 'tab2' },
    ]
    expect(tabsInitialActive({ activeKey: 'tab2' }, tabs)).toBe('tab2')
    expect(tabsNormalizeActive(1, tabs)).toBe('tab2')
    expect(tabsInitialActive({}, [{ title: 'A' }])).toBe('0')
  })
})

describe('tabDisabled / mount flags', () => {
  it('keeps disabled and Amis mountOnEnter default true', () => {
    expect(tabDisabled({ disabled: true })).toBe(true)
    expect(tabsMountOnEnter({})).toBe(true)
    expect(tabsMountOnEnter({ mountOnEnter: false })).toBe(false)
    expect(tabsUnmountOnExit({})).toBe(false)
    expect(tabsUnmountOnExit({ unmountOnExit: true })).toBe(true)
  })
})
