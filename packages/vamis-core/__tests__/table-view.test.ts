import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  tableViewBorder,
  tableViewBorderColor,
  tableViewCaption,
  tableViewCaptionSide,
  tableViewCols,
  tableViewPadding,
  tableViewRows,
  tableViewSpan,
  tableViewTdStyle,
  tableViewWidth,
} from '../src/utils/table-view'

describe('table-view defaults', () => {
  it('defaults width 100%, border true, padding and borderColor from tokens', () => {
    expect(tableViewWidth({})).toBe('100%')
    expect(tableViewWidth({ width: 320 })).toBe('320px')
    expect(tableViewWidth({ width: '80%' })).toBe('80%')
    expect(tableViewBorder({})).toBe(true)
    expect(tableViewBorder({ border: false })).toBe(false)
    expect(tableViewPadding({})).toBe('var(--TableCell-paddingY) var(--TableCell-paddingX)')
    expect(tableViewPadding({ padding: 8 })).toBe('8px')
    expect(tableViewBorderColor({})).toBe('var(--borderColor)')
    expect(tableViewBorderColor({ borderColor: '#eee' })).toBe('#eee')
  })

  it('defaults captionSide top and maps caption tpl', () => {
    expect(tableViewCaptionSide({})).toBe('top')
    expect(tableViewCaptionSide({ captionSide: 'bottom' })).toBe('bottom')
    expect(tableViewCaption({ caption: '标题' })).toBe('标题')
    expect(tableViewCaption({ caption: '${name}' }, { name: '华北' })).toBe('华北')
  })
})

describe('table-view rows and cells', () => {
  it('maps ${} on cell background, keeps visibleOn, drops hidden rows', () => {
    const rows = tableViewRows(
      {
        trs: [
          { visibleOn: 'showHead', tds: [{ body: { type: 'tpl', tpl: '地区' } }] },
          {
            tds: [
              {
                background: "${score>50 ? '#fef1d2': '#d7f8ff'}",
                body: { type: 'tpl', tpl: '分数>50' },
              },
              { hiddenOn: 'hideCity', body: { type: 'tpl', tpl: '北京' } },
            ],
          },
        ],
      },
      { showHead: false, score: 40, hideCity: true },
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].tds).toHaveLength(1)
    expect(rows[0].tds[0].background).toBe('#d7f8ff')
    expect(rows[0].tds[0].body).toEqual({ type: 'tpl', tpl: '分数>50' })
  })

  it('builds td style: border, bold, align, valign, colspan, padding override', () => {
    const style = tableViewTdStyle(
      { color: '#111', bold: true, align: 'center', valign: 'top', width: 200, padding: 4, background: '#feceea' },
      { border: true, borderColor: '#ccc', padding: '8px 10px' },
    )
    expect(style.border).toBe('1px solid #ccc')
    expect(style.color).toBe('#111')
    expect(style.fontWeight).toBe('bold')
    expect(style.textAlign).toBe('center')
    expect(style.verticalAlign).toBe('top')
    expect(style.width).toBe('200px')
    expect(style.padding).toBe('4px')
    expect(style.background).toBe('#feceea')
  })

  it('only emits HTML span when the value is >= 1', () => {
    expect(tableViewSpan(2)).toBe(2)
    expect(tableViewSpan('3')).toBe(3)
    expect(tableViewSpan(undefined)).toBeUndefined()
    expect(tableViewSpan(0)).toBeUndefined()
    expect(tableViewSpan(-1)).toBeUndefined()
  })

  it('defines Amis table-view tokens on :root and does not bitwise-OR spans in the template', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('--borderColor: var(--border)')
    expect(css).toContain('--TableCell-paddingX: var(--table-cell-px)')
    expect(css).toContain('--TableCell-paddingY:')
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/rest/TableView.vue'), 'utf8')
    expect(vue).toContain('tableViewSpan(cell.colspan)')
    expect(vue).toContain('tableViewSpan(cell.rowspan)')
    expect(vue).not.toContain('as number | undefined')
    expect(vue).toContain("textAlign: 'center'")
  })

  it('maps col style and span', () => {
    const cols = tableViewCols(
      { cols: [{}, { span: 2, style: { background: '${tone}' } }] },
      { tone: '#F7F7F7' },
    )
    expect(cols).toHaveLength(2)
    expect(cols[0].span).toBeUndefined()
    expect(cols[1].span).toBe(2)
    expect(cols[1].style).toEqual({ background: '#F7F7F7' })
  })
})
