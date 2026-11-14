import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { resolveValue } from '../src/formula'
import { tabFormValue, tabsCollapseBtnLabel, tabsInitialActive, tabsMode, tabsResolveActiveKey } from '../src/utils/tabs'

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
      'tabsNormalizeActive',
      'popstate',
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
      '## 动作表',
      '## 属性表',
    ]) {
      expect(doc).toContain(h)
    }
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
  })
})
