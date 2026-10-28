import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  table2ApplySelection,
  table2Bordered,
  table2CanSort,
  table2CellIsRenderer,
  table2ColumnsTogglable,
  table2KeyField,
  table2LeafColumns,
  table2Placeholder,
  table2RowDisabled,
  table2RowId,
  table2SelectedKeys,
  table2SelectionType,
  table2Footer,
  table2NextSort,
  table2ShowHeader,
  table2Size,
  table2Source,
  table2Title,
} from '../src/utils/table2'

const rows = [
  { id: 1, engine: 'Trident', browser: 'IE' },
  { id: 2, engine: 'Gecko', browser: 'Firefox' },
  { id: 3, engine: 'Webkit', browser: 'Safari' },
  { id: 4, engine: 'Presto', browser: 'Opera' },
]

describe('table2 source', () => {
  it('defaults to ${items}, and reads $rows like Amis', () => {
    expect(table2Source({}, { items: rows })).toEqual(rows)
    expect(table2Source({ source: '$rows' }, { rows })).toEqual(rows)
    expect(table2Source({ source: '${items}' }, { items: rows })).toEqual(rows)
    expect(table2Source({ source: '${rows}' }, { rows })).toEqual(rows)
    expect(table2Source({ data: { items: rows } }, {})).toEqual(rows)
    expect(table2Source({}, {})).toEqual([])
  })

  it('prefers injected items over source (crud2 host)', () => {
    expect(table2Source({ source: '$rows' }, { rows: [] }, rows)).toEqual(rows)
  })
})

describe('table2 selection', () => {
  it('keyField: primaryField > rowSelection.keyField > keyField > id', () => {
    expect(table2KeyField({})).toBe('id')
    expect(table2KeyField({ keyField: 'sid' })).toBe('sid')
    expect(table2KeyField({ rowSelection: { keyField: 'rid' }, keyField: 'sid' })).toBe('rid')
    expect(table2KeyField({ primaryField: 'pid', rowSelection: { keyField: 'rid' }, keyField: 'sid' })).toBe(
      'pid',
    )
  })

  it('selectable/multiple override rowSelection; default checkbox when rowSelection true', () => {
    expect(table2SelectionType({})).toBe('')
    expect(table2SelectionType({ rowSelection: true })).toBe('checkbox')
    expect(table2SelectionType({ rowSelection: { type: 'radio' } })).toBe('radio')
    expect(table2SelectionType({ selectable: true })).toBe('checkbox')
    expect(table2SelectionType({ selectable: true, multiple: false })).toBe('radio')
    expect(table2SelectionType({ selectable: true, multiple: false, rowSelection: { type: 'checkbox' } })).toBe(
      'radio',
    )
    expect(table2SelectionType({ selectable: false, rowSelection: true })).toBe('')
  })

  it('disableOn evaluates against {record, rowIndex} like Amis Table2', () => {
    expect(table2RowDisabled({ rowSelection: { disableOn: 'this.record.id === 1' } }, rows[0], 0)).toBe(true)
    expect(table2RowDisabled({ rowSelection: { disableOn: 'this.record.id === 1' } }, rows[1], 1)).toBe(false)
  })

  it('selectedRowKeys match by keyField', () => {
    expect(table2SelectedKeys({ rowSelection: { selectedRowKeys: [1, 2] } }, rows)).toEqual([1, 2])
    expect(table2RowId(rows[0], 0, 'id')).toBe(1)
  })

  it('selection menu: all / none / invert / odd / even on changable keys', () => {
    const keys = rows.map((row) => row.id)
    expect(table2ApplySelection('all', keys, [1])).toEqual([1, 2, 3, 4])
    expect(table2ApplySelection('none', keys, [1, 2])).toEqual([])
    expect(table2ApplySelection('invert', keys, [1, 3])).toEqual([2, 4])
    expect(table2ApplySelection('odd', keys, [])).toEqual([1, 3])
    expect(table2ApplySelection('even', keys, [])).toEqual([2, 4])
  })
})

describe('table2 columns and chrome', () => {
  it('columnsTogglable defaults auto and opens when leaf columns > 5', () => {
    expect(table2ColumnsTogglable({}, 4)).toBe(false)
    expect(table2ColumnsTogglable({}, 5)).toBe(false)
    expect(table2ColumnsTogglable({}, 6)).toBe(true)
    expect(table2ColumnsTogglable({ columnsTogglable: true }, 2)).toBe(true)
    expect(table2ColumnsTogglable({ columnsTogglable: false }, 8)).toBe(false)
  })

  it('placeholder 暂无数据; bordered false; size default; showHeader true', () => {
    expect(table2Placeholder({})).toBe('暂无数据')
    expect(table2Placeholder({ placeholder: '空空' })).toBe('空空')
    expect(table2Bordered({})).toBe(false)
    expect(table2Bordered({ bordered: true })).toBe(true)
    expect(table2Size({})).toBe('default')
    expect(table2Size({ size: 'large' })).toBe('large')
    expect(table2Size({ size: 'small' })).toBe('small')
    expect(table2Size({ size: 'oops' })).toBe('default')
    expect(table2ShowHeader({})).toBe(true)
    expect(table2ShowHeader({ showHeader: false })).toBe(false)
  })

  it('flattens grouped children to leaf columns', () => {
    const leaves = table2LeafColumns({
      columns: [
        { title: 'Engine', name: 'engine' },
        {
          title: 'Browser',
          children: [
            { title: 'Grade', name: 'grade' },
            { title: 'Badge', name: 'badgeText' },
          ],
        },
      ],
    })
    expect(leaves.map((col) => col.name)).toEqual(['engine', 'grade', 'badgeText'])
  })

  it('cell renderer / sorter / title interpolation', () => {
    expect(table2CellIsRenderer({ type: 'button' })).toBe(true)
    expect(table2CellIsRenderer({ tpl: '${engine}' })).toBe(true)
    expect(table2CellIsRenderer({ name: 'engine' })).toBe(false)
    expect(table2CanSort({ name: 'engine', sorter: true })).toBe(true)
    expect(table2CanSort({ name: 'engine', sortable: true })).toBe(true)
    expect(table2CanSort({ name: 'engine' })).toBe(false)
    expect(table2Title({ title: '表格标题 - ${rows.length}' }, { rows })).toBe('表格标题 - 4')
    expect(table2Footer({ footer: 'Footer' })).toBe('Footer')
    expect(table2NextSort('engine', {})).toEqual({ orderBy: 'engine', orderDir: 'asc' })
    expect(table2NextSort('engine', { orderBy: 'engine', orderDir: 'asc' })).toEqual({
      orderBy: 'engine',
      orderDir: 'desc',
    })
    expect(table2NextSort('engine', { orderBy: 'engine', orderDir: 'desc' })).toEqual({
      orderBy: '',
      orderDir: '',
    })
  })
})

describe('table2 renderer pins Amis main-path markup', () => {
  it('uses table2 helpers, placeholder chips, size vars, rowClick', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/data/Table2.vue'), 'utf8')
    expect(vue).toContain('table2Source')
    expect(vue).toContain('table2SelectionType')
    expect(vue).toContain('vamis-table2')
    expect(vue).toContain('is-bordered')
    expect(vue).toContain('--table-row-h-sm')
    expect(vue).toContain('--table-row-h-lg')
    expect(vue).toContain('rowClick')
    expect(vue).toContain('vamis-table2-title')
    expect(vue).toContain('vamis-table2-footer')
    expect(vue).toContain('vamis-table2-radio')
    expect(vue).toContain('table2NextSort')
    expect(vue).toContain('vamis-table2-sort')
    expect(vue).toContain('vamis-table2-sort-icon is-up')
    expect(vue).toContain('vamis-table2-sort-icon is-down')
    expect(vue).toContain('vamis-table2-sort-icon is-default')
    expect(vue).toContain('display: none')
    expect(vue).toContain('align-items: center')
    expect(vue).toContain('height: 21px')
    expect(vue).toContain('position: absolute')
    expect(vue).toContain('translate(-50%, -50%)')
    expect(vue).toContain('#151b26')
    expect(vue).toContain('@click.stop="toggleSort(col)"')
    expect(vue).not.toMatch(/<TableHead[\s\S]{0,180}@click="toggleSort/)
    expect(vue).toContain('.vamis-table2-radio:hover:not(:disabled)')
    const checkbox = readFileSync(resolve(here, '../../vamis-ui/src/ui/checkbox/Checkbox.vue'), 'utf8')
    expect(checkbox).toContain('vamis-checkbox')
    expect(checkbox).toContain('vamis-check-pop')
    expect(checkbox).toContain('hover:enabled:data-[state=unchecked]:border-primary')
    expect(checkbox).toContain('hover:enabled:data-[state=checked]')
    expect(checkbox).toContain('hover:enabled:data-[state=indeterminate]')
  })
})
