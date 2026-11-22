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
  it('keeps the completed Select status without unsupported property markers', () => {
    const doc = read('../../../website/src/components/form/select.md')
    const design = read('../../../docs/design/component/form/select.md')

    expect(doc).toContain('::: info 实现进度 100% · 已完成')
    expect(doc).not.toContain('**未接**')
    expect(design).toContain('> 状态：**已完成 100%**')
    expect(design).toContain('验收清单（文档核对：12 / 12）')
  })

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

  it('uses equal associated columns inside one selection scroll host', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const popoverRule = cssRule(css, '.vamis-select__popover.is-associated')
    const associatedRule = cssRule(css, '.vamis-select__associated')
    const leftRule = cssRule(css, '.vamis-select__associated-left')
    const rightRule = cssRule(css, '.vamis-select__associated-right')

    expect(popoverRule).toContain('display: flex')
    expect(popoverRule).toContain('overflow: hidden')
    expect(associatedRule).toContain(
      'max-height: var(--transfer-selection-max-height)',
    )
    expect(css).toContain('--transfer-selection-max-height: 350px')
    expect(leftRule).toContain('flex: 1 1 0')
    expect(leftRule).toContain('width: 0')
    expect(leftRule).toContain('min-height: 200px')
    expect(leftRule).toContain('overflow: auto')
    expect(rightRule).toContain('flex: 1 1 0')
    expect(rightRule).toContain('width: 0')
    expect(rightRule).toContain('min-height: 200px')
    expect(rightRule).toContain('overflow: auto')
  })

  it('keeps associated tree content inside the column scroll host', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const leftTreePane = cssRule(
      css,
      '.vamis-select__popover.is-associated .vamis-select__associated-left .vamis-select__tree-pane',
    )
    const rightTreePane = cssRule(
      css,
      '.vamis-select__popover.is-associated .vamis-select__associated-right .vamis-select__tree-pane',
    )
    const leftTree = cssRule(
      css,
      '.vamis-select__popover.is-associated .vamis-select__associated-left .vamis-tree',
    )
    const rightTree = cssRule(
      css,
      '.vamis-select__popover.is-associated .vamis-select__associated-right .vamis-tree',
    )

    for (const rule of [leftTreePane, rightTreePane, leftTree, rightTree]) {
      expect(rule).toContain('overflow: visible')
      expect(rule).toContain('max-height: none')
    }
  })

  it('uses Amis chained subTitle and placeholder metrics', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const subTitleRule = cssRule(css, '.vamis-select__chained-sub-title')
    const placeholderRule = cssRule(
      css,
      '.vamis-select__chained-placeholder',
    )
    const spinnerRule = cssRule(
      css,
      '.vamis-select__chained-item > .vamis-spinner',
    )

    expect(subTitleRule).toContain('padding: var(--gap-xs)')
    expect(subTitleRule).toContain('color: var(--text-muted)')
    expect(subTitleRule).toContain('font-size: var(--fontSizeSm)')
    expect(placeholderRule).toContain('height: var(--control-h)')
    expect(placeholderRule).toContain('color: var(--text-muted)')
    expect(placeholderRule).toContain('font-size: var(--fontSizeBase)')
    expect(spinnerRule).toContain('flex: 0 0 auto')
    expect(spinnerRule).toContain('margin-left: var(--gap-sm)')
  })

  it('keeps the creatable action outside the scrolling option list', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const popoverRule = cssRule(css, '.vamis-select__popover.is-creatable')
    const listRule = cssRule(
      css,
      '.vamis-select__popover.is-creatable > .vamis-select__list',
    )
    const createRule = cssRule(css, '.vamis-select__create')

    expect(popoverRule).toContain('display: flex')
    expect(popoverRule).toContain('overflow: hidden')
    expect(listRule).toContain('overflow: auto')
    expect(createRule).toContain('border-bottom')
  })

  it('uses one checkbox recipe across Select list, table, tree, chained and associated modes', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const selectRule = cssRule(css, '.vamis-select')
    const popoverRule = cssRule(css, '.vamis-select__popover')
    const associatedRule = cssRule(
      css,
      '.vamis-select__associated-left-item,\n.vamis-select__associated-right-item',
    )
    const treeCheckRule = cssRule(
      css,
      '.vamis-select__tree-pane .vamis-tree__check.vamis-checkbox__mark',
    )
    const treeCheckIconRule = cssRule(
      css,
      '.vamis-select__tree-pane .vamis-tree__check.vamis-checkbox__mark .vamis-checkbox__icon',
    )
    const listRowRule = cssRule(
      css,
      '.vamis-select__checkall,\n  .vamis-select__item,\n  .vamis-select__create-btn',
    )
    const listCheckRule = cssRule(css, '.vamis-select__check')
    const chainedCheckallRule = cssRule(
      css,
      '.vamis-select__chained-checkall',
    )
    const groupCheckboxRule = cssRule(
      css,
      '.vamis-select__item--child',
    )
    const groupCheckallRule = cssRule(
      css,
      '.vamis-select__popover.is-group .vamis-select__checkall',
    )
    const treeCheckallRule = cssRule(
      css,
      '.vamis-select__tree-checkall',
    )
    const selectVue = read('../../vamis/src/renderers/form/Select.vue')

    expect(css).toContain('--select-check-size: 14px')
    expect(css).toContain('--select-check-icon-size: 12px')
    expect(css).toContain('--select-check-gap: 8px')
    expect(css).not.toContain('--select-group-check-gap')
    expect(css).not.toContain('--select-tree-check-gap')
    expect(css).not.toContain('--select-chained-check-gap')
    expect(css).not.toContain('--select-associated-check-gap')
    expect(selectRule).toContain('--checkbox-size: var(--select-check-size)')
    expect(selectRule).toContain(
      '--checkbox-icon-size: var(--select-check-icon-size)',
    )
    expect(selectRule).toContain('--checkbox-gap: var(--select-check-gap)')
    expect(popoverRule).toContain('--checkbox-size: var(--select-check-size)')
    expect(popoverRule).toContain(
      '--checkbox-icon-size: var(--select-check-icon-size)',
    )
    expect(popoverRule).toContain('--checkbox-gap: var(--select-check-gap)')
    expect(associatedRule).toContain('gap: var(--select-check-gap)')
    expect(treeCheckRule).toContain(
      'calc(var(--select-check-gap) - var(--gap-xs))',
    )
    expect(treeCheckIconRule).toContain('width: var(--select-check-icon-size)')
    expect(treeCheckIconRule).toContain('height: var(--select-check-icon-size)')
    expect(listRowRule).toContain('gap: var(--select-check-gap)')
    expect(listCheckRule).not.toContain('margin-right')
    expect(css).not.toContain('.vamis-select.is-group .vamis-select__check {')
    expect(groupCheckboxRule).toContain('gap: var(--select-check-gap)')
    expect(groupCheckallRule).toContain('gap: var(--select-check-gap)')
    expect(treeCheckallRule).toContain('gap: var(--select-check-gap)')
    expect(chainedCheckallRule).toContain('gap: var(--select-check-gap)')
    expect(css).toMatch(
      /\.vamis-select__chained-item\s*\{[^}]*display:\s*flex;[^}]*gap:\s*var\(--select-check-gap\)/,
    )
    expect(selectVue.match(/'is-group': isGroupMenu/g)).toHaveLength(3)
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
