import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isFormItemType } from '../src/factory'
import { getByPath, setByPathCopy } from '../src/scope'
import {
  tableAutoFillHeight,
  tableBackgroundScale,
  tableBordered,
  tableBreakpointMatch,
  tableBuildRows,
  tableColorScale,
  tableColumnGroups,
  tableCombineKeys,
  tableCombineNum,
  tableCombineSpans,
  tableConditionMatch,
  tableFilterOptions,
  tableFlattenRows,
  tableFootable,
  tableIndexText,
  tableMatchRows,
  tableMergeRowData,
  tableRowByPath,
  tableRowPasses,
  tableSortRows,
  tableSummaryRow,
  tableSummaryRows,
} from '../src/utils/table'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('table row tree', () => {
  const items = [
    { id: 1, engine: 'Trident', children: [{ id: 11, engine: 'Trident 4' }, { id: 12, engine: 'Trident 5', children: [{ id: 121 }] }] },
    { id: 2, engine: 'Gecko' },
  ]

  it('builds paths, depth and parents from children', () => {
    const rows = tableBuildRows(items)
    expect(rows.map((row) => row.path)).toEqual(['0', '1'])
    expect(rows[0].children.map((row) => row.path)).toEqual(['0.0', '0.1'])
    expect(rows[0].children[1].children[0]).toMatchObject({ path: '0.1.0', depth: 3, index: 0 })
    expect(rows[0].children[1].parent).toBe(rows[0])
    expect(tableBuildRows('nope')).toEqual([])
  })

  it('wraps non-object members and honours a custom children field and id', () => {
    const rows = tableBuildRows([{ id: 'a', kids: ['x'] }], 'kids', (row, path) => String(row.id ?? path))
    expect(rows[0].id).toBe('a')
    expect(rows[0].children[0].data).toEqual({ item: 'x' })
    expect(rows[0].children[0].id).toBe('0.0')
  })

  it('flattens only expanded branches', () => {
    const rows = tableBuildRows(items)
    expect(tableFlattenRows(rows).map((row) => row.path)).toEqual(['0', '0.0', '0.1', '0.1.0', '1'])
    expect(tableFlattenRows(rows, () => false).map((row) => row.path)).toEqual(['0', '1'])
    expect(tableFlattenRows(rows, (row) => row.path === '0').map((row) => row.path)).toEqual(['0', '0.0', '0.1', '1'])
  })

  it('formats nested index text and finds rows by path', () => {
    expect(tableIndexText('0')).toBe('1')
    expect(tableIndexText('0.1.2')).toBe('1.2.3')
    const rows = tableBuildRows(items)
    expect(tableRowByPath(rows, [0, 1])?.data.id).toBe(12)
    expect(tableRowByPath(rows, [0, 5])).toBeUndefined()
    expect(tableRowByPath(rows, [])).toBeUndefined()
  })
})

describe('table action targets', () => {
  const rows = tableBuildRows([
    { id: 1, engine: 'Trident', version: 4, children: [{ id: 11, engine: 'Trident', version: 5 }] },
    { id: 2, engine: 'Gecko', version: 1.7 },
    { id: 3, engine: 'Webkit', version: '' },
  ])

  it('matches expression strings and condition-builder trees', () => {
    expect(tableConditionMatch('${version > 3}', { version: 4 })).toBe(true)
    expect(tableConditionMatch('', { version: 4 })).toBe(false)
    expect(tableConditionMatch({ left: { field: 'engine' }, op: 'contains', right: 'ck' }, { engine: 'Gecko' })).toBe(true)
    expect(tableConditionMatch({ field: 'version', op: 'greater', value: '${limit}' }, { version: 10, limit: 9 })).toBe(true)
    expect(tableConditionMatch({ field: 'version', op: 'is_empty' }, { version: '' })).toBe(true)
    expect(tableConditionMatch({ field: 'engine', op: 'select_any_in', right: ['Gecko', 'Webkit'] }, { engine: 'Gecko' })).toBe(true)
    const tree = {
      conjunction: 'or',
      children: [
        { field: 'engine', op: 'equal', right: 'Webkit' },
        { conjunction: 'and', children: [{ field: 'engine', op: 'starts_with', right: 'Tri' }, { field: 'version', op: 'less', right: 5 }] },
      ],
    }
    expect(tableConditionMatch(tree, { engine: 'Trident', version: 4 })).toBe(true)
    expect(tableConditionMatch(tree, { engine: 'Trident', version: 5 })).toBe(false)
    expect(tableConditionMatch({ ...tree, not: true }, { engine: 'Trident', version: 5 })).toBe(true)
    expect(tableConditionMatch({ conjunction: 'and', children: [] }, {})).toBe(false)
  })

  it('index wins over condition; strings accept lists, tree paths and templates', () => {
    expect(tableMatchRows(rows, {}, 1, '${id === 1}').map((row) => row.data.id)).toEqual([2])
    expect(tableMatchRows(rows, {}, 9)).toEqual([])
    expect(tableMatchRows(rows, {}, '0,2').map((row) => row.data.id)).toEqual([1, 3])
    expect(tableMatchRows(rows, {}, '0.0').map((row) => row.data.id)).toEqual([11])
    expect(tableMatchRows(rows, { at: 2 }, '${at}').map((row) => row.data.id)).toEqual([3])
    expect(tableMatchRows(rows, {}, '0,0,x').map((row) => row.data.id)).toEqual([1])
  })

  it('condition walks the whole tree with row data over context', () => {
    expect(tableMatchRows(rows, {}, undefined, '${engine === "Trident"}').map((row) => row.data.id)).toEqual([1, 11])
    expect(tableMatchRows(rows, { engine: 'Gecko' }, undefined, '${engine === "Gecko"}').map((row) => row.data.id)).toEqual([2])
    expect(tableMatchRows(rows, {})).toEqual([])
  })

  it('row setData always merges, even if replace is true', () => {
    const row = { engine: 'Trident', version: '4', id: 1 }
    expect(tableMergeRowData(row, { engine: 'amis', id: 1234 })).toEqual({
      engine: 'amis',
      version: '4',
      id: 1234,
    })
    const table = read('../../vamis/src/renderers/Table.vue')
    expect(table).toContain('tableMergeRowData')
    expect(table).not.toContain('replace ? { ...patch }')
    expect(table).toContain('hasQuickEditColumn.value || !!headingText.value')
  })
})

describe('table merge, groups and summary', () => {
  it('reads combineNum from numbers, strings and variables', () => {
    expect(tableCombineNum(2)).toBe(2)
    expect(tableCombineNum('3')).toBe(3)
    expect(tableCombineNum('${n}', { n: 4 })).toBe(4)
    expect(tableCombineNum(0)).toBe(0)
    expect(tableCombineNum('x')).toBe(0)
  })

  it('takes consecutive named columns from combineFromIndex', () => {
    const columns = [{ name: 'a' }, { name: 'b' }, { type: 'operation' }, { name: 'c' }]
    expect(tableCombineKeys(columns, 2)).toEqual(['a', 'b'])
    expect(tableCombineKeys(columns, 3)).toEqual(['a', 'b'])
    expect(tableCombineKeys(columns, 1, 1)).toEqual(['b'])
    expect(tableCombineKeys(columns, 0)).toEqual([])
  })

  it('merges the second column only inside the first column group', () => {
    const rows = [
      { a: 'x', b: 1 },
      { a: 'x', b: 1 },
      { a: 'x', b: 2 },
      { a: 'y', b: 2 },
    ]
    expect(tableCombineSpans(rows, ['a', 'b'])).toEqual([{ a: 3, b: 2 }, { a: 0, b: 0 }, { a: 0, b: 1 }, { a: 1 }])
    expect(tableCombineSpans([], ['a'])).toEqual([])
  })

  it('groups adjacent groupName columns and skips the group row when unused', () => {
    expect(tableColumnGroups([{ name: 'a' }, { name: 'b' }])).toEqual([])
    const groups = tableColumnGroups([
      { name: 'a', fixed: 'left' },
      { name: 'b', groupName: 'G' },
      { name: 'c', groupName: 'G' },
      { name: 'd', groupName: 'H' },
      { name: 'e' },
    ])
    expect(groups).toEqual([
      { label: '', colSpan: 1, rowSpan: 2, index: 0, fixed: 'left' },
      { label: 'G', colSpan: 2, rowSpan: 1, index: 1, fixed: '' },
      { label: 'H', colSpan: 1, rowSpan: 1, index: 3, fixed: '' },
      { label: '', colSpan: 1, rowSpan: 2, index: 4, fixed: '' },
    ])
  })

  it('lays out summary cells against visible columns and lead columns', () => {
    const cells = tableSummaryRow([{ type: 'text', text: '总计', colSpan: 2 }, { type: 'tpl', tpl: 'x' }], [true, true, true, true])
    expect(cells.map((cell) => [cell.colSpan, cell.firstIndex, cell.lastIndex])).toEqual([
      [2, 0, 1],
      [1, 2, 2],
      [1, 3, 3],
    ])
    expect(cells[2]).toMatchObject({ type: 'html', html: '&nbsp;' })
    // 第二列隐藏：跨两列的格子收成一列
    const hidden = tableSummaryRow([{ text: '总计', colSpan: 2 }, { tpl: 'x' }], [true, false, true])
    expect(hidden.map((cell) => cell.colSpan)).toEqual([1, 1])
    const lead = tableSummaryRow([{ text: 'a' }], [true], 2)
    expect(lead[0]).toMatchObject({ colSpan: 2, firstIndex: -1 })
    expect(tableSummaryRow([], [true])).toEqual([])
  })

  it('accepts one or several summary rows', () => {
    expect(tableSummaryRows(undefined)).toEqual([])
    expect(tableSummaryRows([{ a: 1 }, { b: 2 }])).toEqual([[{ a: 1 }, { b: 2 }]])
    expect(tableSummaryRows([[{ a: 1 }], { b: 2 }])).toEqual([[{ a: 1 }], [{ b: 2 }]])
  })
})

describe('table cell helpers', () => {
  it('interpolates the colour scale and clamps out-of-range values', () => {
    const scale = tableColorScale(0, 100, ['#000000', '#ffffff'])
    expect(scale(0)).toBe('#000000')
    expect(scale(100)).toBe('#ffffff')
    expect(scale(50)).toBe('#7f7f7f')
    expect(scale(-5)).toBe('#000000')
    expect(scale(500)).toBe('#ffffff')
    // min == max、颜色不足两个：退回默认黄 → 橙
    expect(tableColorScale(3, 3)(3)).toBe('#ffef9c')
    expect(tableColorScale(10, 0, ['#000', '#fff'])(10)).toBe('#ffffff')
  })

  it('derives backgroundScale bounds from the column, variables or source', () => {
    const rows = [{ v: 0, w: 10 }, { v: 10, w: 0 }]
    const colors = ['#000000', '#ffffff']
    expect(tableBackgroundScale({ name: 'v', backgroundScale: { colors } }, rows[1], {}, rows)).toBe('#ffffff')
    expect(tableBackgroundScale({ name: 'v', backgroundScale: { min: '${lo}', max: 20, colors } }, rows[1], { lo: 0 }, rows)).toBe('#7f7f7f')
    expect(tableBackgroundScale({ name: 'v', backgroundScale: { source: '${w}', min: 0, max: 10, colors } }, rows[0], {}, rows)).toBe('#ffffff')
    expect(tableBackgroundScale({ name: 'v' }, rows[0], {}, rows)).toBe('')
    expect(tableBackgroundScale({ name: 'v', backgroundScale: { colors } }, { v: 'n/a' }, {}, rows)).toBe('')
  })

  it('matches Amis breakpoints', () => {
    expect(tableBreakpointMatch('*', 2000)).toBe(true)
    expect(tableBreakpointMatch('xs', 767)).toBe(true)
    expect(tableBreakpointMatch('xs', 768)).toBe(false)
    expect(tableBreakpointMatch('sm,md', 1000)).toBe(true)
    expect(tableBreakpointMatch('lg', 1199)).toBe(false)
    expect(tableBreakpointMatch(true, 10)).toBe(true)
    expect(tableBreakpointMatch(undefined, 10)).toBe(false)
  })

  it('reads footable and autoFillHeight config', () => {
    expect(tableFootable({})).toEqual({ enabled: false, expand: 'none', accordion: false })
    expect(tableFootable({ footable: true })).toEqual({ enabled: true, expand: 'none', accordion: false })
    expect(tableFootable({ footable: { expand: 'first', accordion: true } })).toEqual({ enabled: true, expand: 'first', accordion: true })
    expect(tableAutoFillHeight({})).toEqual({ enabled: false })
    expect(tableAutoFillHeight({ autoFillHeight: true })).toEqual({ enabled: true, height: undefined, maxHeight: undefined })
    expect(tableAutoFillHeight({ autoFillHeight: { height: 300, maxHeight: 'x' } })).toEqual({ enabled: true, height: 300, maxHeight: undefined })
  })

  it('sorts numbers numerically and keeps blanks last in both directions', () => {
    const rows = [{ v: 10 }, { v: '' }, { v: 2 }, { v: null }, { v: '9' }]
    const pick = (row: { v: unknown }) => row.v
    expect(tableSortRows(rows, 'asc', pick).map(pick)).toEqual([2, '9', 10, '', null])
    expect(tableSortRows(rows, 'desc', pick).map(pick)).toEqual([10, '9', 2, '', null])
    expect(rows[0].v).toBe(10)
  })

  it('searches by contains and filters by equality', () => {
    const row = { engine: 'Trident', grade: 'A', 'a.b': 'x' }
    expect(tableRowPasses(row, { engine: 'tri' }, {})).toBe(true)
    expect(tableRowPasses(row, { engine: 'gecko' }, {})).toBe(false)
    expect(tableRowPasses(row, {}, { grade: 'A,B' })).toBe(true)
    expect(tableRowPasses(row, {}, { grade: ['C'] })).toBe(false)
    expect(tableRowPasses(row, { engine: '' }, { grade: null, 'a.b': 'x' })).toBe(true)
  })

  it('takes filter options from schema, source or the column values', () => {
    const rows = [{ grade: 'A' }, { grade: 'B' }, { grade: 'A' }, { grade: '' }]
    expect(tableFilterOptions({ name: 'grade', filterable: true }, rows)).toEqual([
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
    ])
    expect(tableFilterOptions({ name: 'grade', filterable: { options: ['A', { label: '乙', value: 'B' }] } }, rows)).toEqual([
      { label: 'A', value: 'A' },
      { label: '乙', value: 'B' },
    ])
    expect(tableFilterOptions({ name: 'grade', filterable: { source: '${opts}' } }, rows, { opts: [{ label: 'X', value: 1 }] })).toEqual([
      { label: 'X', value: '1' },
    ])
  })
})

describe('data chain for form items outside a form', () => {
  it('reads a literal dotted key before walking the path', () => {
    expect(getByPath({ 'a.b': 1, a: { b: 2 } }, 'a.b')).toBe(1)
    expect(getByPath({ a: { b: 2 } }, 'a.b')).toBe(2)
    expect(getByPath({ list: [{ x: 3 }] }, 'list[0].x')).toBe(3)
    expect(getByPath({ a: 1 }, '')).toEqual({ a: 1 })
    expect(getByPath(undefined, 'a')).toBeUndefined()
  })

  it('writes a row as a new object and leaves the original untouched', () => {
    const row = { id: 1, status: true, nested: { a: 1, keep: { z: 1 } } }
    const next = setByPathCopy(row, 'status', false)
    expect(next).not.toBe(row)
    expect(next).toEqual({ ...row, status: false })
    expect(row.status).toBe(true)

    const deep = setByPathCopy(row, 'nested.a', 2)
    expect(deep.nested).toEqual({ a: 2, keep: { z: 1 } })
    expect(deep.nested).not.toBe(row.nested)
    expect(row.nested.a).toBe(1)
    expect(setByPathCopy({}, 'x.y', 1)).toEqual({ x: { y: 1 } })
  })

  it('tells form items from display types so a table cell keeps their name', () => {
    for (const type of ['switch', 'input-text', 'select', 'checkbox', 'input-number']) {
      expect(isFormItemType(type), type).toBe(true)
    }
    // 列 `type: text` 在表格里是纯文本列，不是输入框
    for (const type of ['tpl', 'text', 'status', 'mapping', 'progress', 'button', undefined, '']) {
      expect(isFormItemType(type), String(type)).toBe(false)
    }
  })

  it('form items go through useFieldValue, not form?.setValue', () => {
    // 没有祖先表单时 `form?.setValue` 直接把值丢掉；表格单元格、页面里的裸表单项都踩这条。
    const dir = resolve(here, '../../vamis/src/renderers/form')
    const files = readdirSync(dir)
      .filter((name) => /\.(vue|ts)$/.test(name))
      .map((name) => join(dir, name))
    files.push(resolve(here, '../../vamis/src/optionsControl.ts'))
    const offenders = files.filter((file) => /form\?\.(setValue|getValue)\(/.test(readFileSync(file, 'utf8')))
    expect(offenders.map((file) => file.slice(file.indexOf('vamis/src')))).toEqual([])
  })

  it('table cells host the row and the row is replaced, not mutated', () => {
    const cell = read('../../vamis/src/renderers/table/TableCellBody.vue')
    expect(cell).toContain('provideValueHost')
    expect(cell).toContain('isFormItemType')
    const table = read('../../vamis/src/renderers/Table.vue')
    expect(table).toContain('setByPathCopy')
    expect(table).toContain('@change="onCellChange(row, $event)"')
    const renderer = read('../src/SchemaRenderer.vue')
    expect(renderer).toContain('provideValueHost')
    expect(renderer).toContain('parentValueHost.setValue')
  })

  it('writes dragged column width onto colgroup so super-header colspan cannot swallow it', () => {
    const table = read('../../vamis/src/renderers/Table.vue')
    expect(table).toContain('function colGroupStyle')
    expect(table).toContain(':style="colGroupStyle(col)"')
  })

  it('table primitive has no card chrome (Amis Table has no outer border)', () => {
    const primitive = read('../../vamis-ui/src/ui/table/Table.vue')
    expect(primitive).not.toMatch(/rounded-lg border/)
    expect(primitive).toContain('data-slot="table-container"')
  })

  it('tableBordered is opt-in outer chrome, not Table2 cell grid', () => {
    expect(tableBordered({})).toBe(false)
    expect(tableBordered({ bordered: true })).toBe(true)
    expect(tableBordered({ bordered: false })).toBe(false)
    const table = read('../../vamis/src/renderers/Table.vue')
    expect(table).toContain('is-bordered')
    expect(table).toContain('tableBordered')
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('.vamis-table-wrap.is-bordered [data-slot="table-container"]')
    expect(css).toContain('border-radius: var(--borderRadiusLg)')
    expect(css).toContain('.vamis-table-wrap.is-bordered thead [data-slot="table-head"]')
    expect(css).toContain(
      '.vamis-table-wrap.is-bordered tbody > tr:first-child > [data-slot="table-cell"]',
    )
    expect(css).toContain(
      '.vamis-table-wrap.is-bordered tbody > tr:last-child > [data-slot="table-cell"]',
    )
  })

  it('affix header clone has no leftover card border (docs env turns affix off, SDK default is on)', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const block = css.match(/^\.vamis-table__affix-head \{[^}]*\}/m)?.[0] ?? ''
    expect(block).toContain('.vamis-table__affix-head {')
    expect(block).not.toContain('border:')
    expect(block).not.toContain('border-radius')
    expect(css).toContain('.vamis-table-wrap.is-bordered.is-affix-header .vamis-table__affix-head')
  })

  it('sheet and dialog overlays sit above sticky table chrome', () => {
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toMatch(/\[data-slot='sheet-overlay'\][\s\S]*?z-index: var\(--z-modal\)/)
    expect(css).toContain("[data-slot='sheet-content']")
    expect(css).toContain("[data-slot='dialog-overlay']")
  })

  it('last data row keeps a bottom border even without outer chrome', () => {
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('border-bottom: 1px solid var(--border)')
    expect(css).toContain('border-top-width: 0')
  })

  it('first data row has no top border; header bottom uses thead-sep', () => {
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('border-top-width: 0')
    expect(css).toContain('border-bottom: var(--table-thead-sep-width) solid var(--table-thead-sep)')
    expect(css).not.toMatch(
      /\[data-slot="table-cell"\] \{\s*border-top: 1px solid var\(--border\)/,
    )
  })

  it('isHead tbody th keeps a gray bottom line (not thead-sep white)', () => {
    const css = read('../../vamis-ui/src/styles.css')
    const block = css.match(/\.vamis-table-wrap tbody \[data-slot="table-head"\] \{[^}]+\}/)?.[0] ?? ''
    expect(block).toContain('border-bottom: 1px solid var(--border)')
    expect(block).not.toContain('border-bottom: 0')
    expect(css).not.toContain(
      '.vamis-table-wrap tbody > tr:not(:last-child) > [data-slot="table-head"]',
    )
  })

  it('sticky columns inherit an opaque row bg and sit above scrolling cells', () => {
    const css = read('../../vamis-ui/src/styles.css')
    // 默认行底必须在 @layer components，helper `.bg-success` 才能压过；禁止 unlayered 写死。
    expect(css).toMatch(
      /@layer components \{[\s\S]*?\.vamis-table-wrap tbody > tr\.vamis-table__tr \{[\s\S]*?background-color: var\(--table-bg\)/,
    )
    expect(css).not.toMatch(
      /^\.vamis-table-wrap tbody > tr\.vamis-table__tr \{\s*background/m,
    )
    expect(css).toContain('z-index: var(--table-fixed-z)')
    expect(css).toContain('.vamis-table-wrap td.is-sticky')
    expect(css).toContain('background: inherit')
  })
})
