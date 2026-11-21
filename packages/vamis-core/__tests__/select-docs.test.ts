import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

function cssRule(css: string, selector: string) {
  const indentedStart = css.indexOf(`\n  ${selector} {`)
  const start = indentedStart >= 0 ? indentedStart + 1 : css.indexOf(`${selector} {`)
  expect(start, `missing CSS rule: ${selector}`).toBeGreaterThanOrEqual(0)
  const end = css.indexOf('}', start)
  return css.slice(start, end + 1)
}

describe('select docs', () => {
  it('keeps the Amis section order and difference section at the bottom', () => {
    const doc = read('../../../website/src/components/form/select.md')
    const headings = [...doc.matchAll(/^(#{1,3}) (.+)$/gm)].map((match) => ({
      level: match[1].length,
      title: match[2],
    }))
    const h2 = headings.filter((heading) => heading.level === 2).map((heading) => heading.title)
    const h3 = headings.filter((heading) => heading.level === 3).map((heading) => heading.title)
    const displayStart = doc.indexOf('## 展示模式')
    const displayEnd = doc.indexOf('## 支持搜索')
    const displayHeadings = [
      ...doc.slice(displayStart, displayEnd).matchAll(/^### (.+)$/gm),
    ].map((match) => match[1])
    const tableStart = doc.indexOf('### 表格模式')
    const tableEnd = doc.indexOf('### 树形模式')
    const tableSection = doc.slice(tableStart, tableEnd)
    const chainedStart = doc.indexOf('### 级联选择')
    const chainedEnd = doc.indexOf('## 支持搜索')
    const chainedSection = doc.slice(chainedStart, chainedEnd)

    expect(doc).toContain('\ntitle: Select 选择器\n')
    expect(doc).toContain('\n# Select 选择器\n')
    expect(h2).toEqual([
      '基本用法',
      '自定义菜单',
      '展示模式',
      '支持搜索',
      '延时加载',
      '关联选择模式',
      '限制标签最大展示数量',
      '自定义下拉区域宽度与对齐方式',
      '多选全选',
      '自动补全 autoComplete',
      '属性表',
      '事件表',
      '动作表',
      '与 Amis 的差异',
    ])
    expect(displayHeadings).toEqual(['分组展示模式', '表格模式', '树形模式', '级联选择'])
    expect(tableSection).not.toContain('当前状态：未接')
    expect([...tableSection.matchAll(/```schema/g)]).toHaveLength(2)
    expect(chainedSection).not.toContain('当前状态：未接')
    expect([...chainedSection.matchAll(/```schema/g)]).toHaveLength(2)
    expect(h3).toContain('刷新数据源 reload')
    expect(h2[h2.length - 1]).toBe('与 Amis 的差异')
  })

  it('keeps group header tokens off grouped child rows', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const itemRule = cssRule(
      css,
      '.vamis-select__checkall,\n  .vamis-select__item,\n  .vamis-select__create-btn',
    )
    const childRule = cssRule(css, '.vamis-select__item--child')
    const itemLabelRule = cssRule(css, '.vamis-select__item-label')
    const groupLabelRule = cssRule(css, '.vamis-select__group-label')

    expect(itemRule).toContain('color: var(--select-option-color)')
    expect(itemRule).toContain('line-height: var(--select-option-line-height)')
    expect(childRule).toContain('padding-left: var(--select-group-item-indent)')
    expect(itemLabelRule).toContain('color: var(--select-option-color)')
    expect(groupLabelRule).toContain('color: var(--select-group-color)')
    expect(css).toContain('.vamis-select__item.is-active:hover .vamis-select__item-label')
    expect(childRule).not.toMatch(
      /(?:^|\n)\s*(?:color|font-size|font-weight|line-height):/,
    )
  })

  it('uses one scroll container for Select tree menus', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const popoverRule = cssRule(css, '.vamis-select__popover.is-tree')
    const paneRule = cssRule(
      css,
      '.vamis-select__popover.is-tree .vamis-select__tree-pane',
    )
    const treeRule = cssRule(
      css,
      '.vamis-select__popover.is-tree .vamis-select__tree-pane .vamis-tree',
    )

    expect(popoverRule).toContain('overflow: hidden')
    expect(paneRule).toContain('overflow: auto')
    expect(treeRule).toContain('max-height: none')
    expect(treeRule).toContain('overflow: visible')
  })

  it('uses Amis table header separators instead of a gray bottom border on each th', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const headRule = cssRule(css, '.vamis-select__table [data-slot="table-head"]')
    const headerRowRule = cssRule(
      css,
      '.vamis-select__table thead [data-slot="table-row"]',
    )

    expect(headRule).toContain('border-right: 1px solid var(--card)')
    expect(headRule).toContain('border-bottom: 1px solid var(--card)')
    expect(headerRowRule).toContain('background: var(--table-thead-bg)')
    expect(headerRowRule).toContain('border-bottom: 1px solid var(--border)')
  })
})
