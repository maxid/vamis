import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { resolveValue } from '../src/formula'
import {
  tabFormValue,
  tabsCollapseBtnLabel,
  tabsHiddenIndexesByBox,
  tabsIndexesEqual,
  tabsInitialActive,
  tabsMode,
  tabsRemapAfterReorder,
  tabsResolveActiveKey,
  tabsUseAutoOverflow,
} from '../src/utils/tabs'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('tabs', () => {
  it('supports addable/editable/draggable and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/Tabs.vue')
    for (const t of [
      'addable',
      'tabClosable',
      'editable',
      'draggable',
      'animation: 250',
      'Sortable',
      'commitEdit',
      'changeActiveKey',
      'deleteTab',
      'showTip',
      'tabsCollapseOnExceed',
      'tabsRemapAfterReorder',
      'scheduleMeasure',
      'more-host--auto',
      'links-wrap',
      'onLinksScroll',
      'tabsNormalizeActive',
      'popstate',
      'placeInk',
      'vamis-tabs__ink',
    ]) {
      expect(vue).toContain(t)
    }
    const doc = read('../../../website/src/components/tabs.md')
    for (const h of [
      '## 拖拽排序',
      '## 可增加、删除',
      '## 可编辑标签名',
      '## 显示提示',
      '## 作为表单项的值',
      '## 展示模式',
      '## 配置超出折叠',
      '## 超出容器',
      '## 动作表',
      '## 属性表',
    ]) {
      expect(doc).toContain(h)
    }
    const overflowDoc = doc.slice(doc.indexOf('## 超出容器'), doc.indexOf('## mountOnEnter'))
    const overflowFence = overflowDoc.slice(overflowDoc.indexOf('```schema'), overflowDoc.lastIndexOf('```'))
    expect(overflowDoc).toContain('不用写溢出字段')
    expect(overflowFence).toContain('"tabsMode": "${dir}"')
    expect(overflowFence).toContain('"collapseBtnLabel": "展开"')
    expect(overflowFence).not.toContain('visibleOn')
    expect(overflowFence).not.toContain('"source"')
    expect(overflowFence).not.toContain('collapseOnExceed')
    expect(vue).toMatch(/active\.value === key[\s\S]*seedVisited\(nextKey\)/)
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('.vamis-tabs--strong .vamis-tabs__link.is-active')
    expect(css).toMatch(/\.vamis-tabs--strong \.vamis-tabs__link\.is-active \{[\s\S]*?border-bottom-color: var\(--card\)/)
    expect(css).toContain('.vamis-tabs--line .vamis-tabs__links-wrap')
  })

  it('reads tabsMode or mode and form value', () => {
    expect(tabsMode({ tabsMode: 'radio' })).toBe('radio')
    expect(tabsMode({ mode: 'simple' })).toBe('simple')
    expect(tabsMode({})).toBe('line')
    expect(tabFormValue({ title: 'Tab 1' }, '0')).toBe('Tab 1')
    expect(tabFormValue({ title: 'Tab 1', value: 1 }, '0')).toBe(1)
  })

  it('toInt filter keeps number and parses string', () => {
    expect(resolveValue('${key|toInt}', { key: 2 })).toBe(2)
    expect(resolveValue('${key|toInt}', { key: '1' })).toBe(1)
  })

  it('resolves activeKey formula and falls to defaultKey when empty', () => {
    const tabs = [{ title: 'Tab 1' }, { title: 'Tab 2' }, { title: 'Tab 3' }]
    expect(tabsResolveActiveKey({ activeKey: '${key|toInt}' }, tabs, { key: 2 })).toBe('2')
    expect(tabsResolveActiveKey({ activeKey: '${activeKey|toInt}' }, tabs, { key: 2 })).toBeUndefined()
    expect(tabsInitialActive({ activeKey: '${activeKey|toInt}', defaultKey: '${defaultKey|toInt}' }, tabs, { defaultKey: 1, key: 2 })).toBe('1')
  })

  it('translates collapse more to 更多', () => {
    expect(tabsCollapseBtnLabel({})).toBe('更多')
    expect(tabsCollapseBtnLabel({ collapseBtnLabel: 'more' })).toBe('更多')
    expect(tabsCollapseBtnLabel({ collapseBtnLabel: '展开' })).toBe('展开')
    expect(tabsUseAutoOverflow({})).toBe(true)
    expect(tabsUseAutoOverflow({ collapseOnExceed: 3 })).toBe(false)
  })

  it('resolves tabsMode from data', () => {
    expect(tabsMode({ tabsMode: '${dir}' }, { dir: 'vertical' })).toBe('vertical')
    expect(tabsMode({ tabsMode: '${dir}' }, { dir: 'nope' })).toBe('line')
  })

  it('remaps active after drag reorder by object identity', () => {
    const a = { title: 'A' }
    const b = { title: 'B' }
    const c = { title: 'C' }
    const prev = [a, b, c]
    const next = [b, a, c]
    const keyOf = (_tab: { title: string }, index: number) => String(index)
    const remapped = tabsRemapAfterReorder(prev, next, '1', new Set(['1', '2']), keyOf)
    expect(remapped.active).toBe('0')
    expect([...remapped.visited].sort()).toEqual(['0', '2'])
  })

  it('lists clipped tab indexes against the viewport box', () => {
    const rect = (left: number, width: number) =>
      ({ left, right: left + width, top: 0, bottom: 32, width, height: 32 }) as DOMRect
    const items = [{ getBoundingClientRect: () => rect(0, 80) }, { getBoundingClientRect: () => rect(80, 80) }, { getBoundingClientRect: () => rect(160, 80) }]
    const hidden = tabsHiddenIndexesByBox(items, { getBoundingClientRect: () => rect(0, 150) }, false)
    expect(hidden).toEqual([1, 2])
    expect(tabsIndexesEqual([2], [2])).toBe(true)
    expect(tabsIndexesEqual([2], [1, 2])).toBe(false)
  })
})
