/** Grid 2D。对齐 Amis `cols` / `x,y,w,h` / `gap` / `align` / `valign`。 */

const JUSTIFY_SELF: Record<string, string> = {
  left: 'start',
  right: 'end',
  center: 'center',
  auto: 'stretch',
}

const ALIGN_SELF: Record<string, string> = {
  top: 'start',
  bottom: 'end',
  middle: 'center',
  auto: 'stretch',
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function asGrids(grids: unknown): Record<string, unknown>[] {
  return Array.isArray(grids) ? grids.filter((item) => item && typeof item === 'object') : []
}

function axis(value: unknown, fallback = 1): number {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Amis：整数补 px，其余原样。 */
export function grid2dCssLen(value: unknown): string | number {
  if (value == null || value === '') return 0
  if (typeof value === 'number') return Number.isInteger(value) ? (value === 0 ? 0 : `${value}px`) : value
  return String(value)
}

export function grid2dCols(schema: unknown): number {
  const n = Number(asRecord(schema).cols)
  return Number.isFinite(n) && n > 0 ? n : 12
}

export function grid2dGap(schema: unknown): { columnGap: string | number; rowGap: string | number } {
  const rec = asRecord(schema)
  const gap = rec.gap ?? 0
  const row = rec.gapRow ?? rec.rowGap ?? gap
  return { columnGap: grid2dCssLen(gap), rowGap: grid2dCssLen(row) }
}

export function grid2dCellStyle(grid: unknown): Record<string, string | number> {
  const rec = asRecord(grid)
  const x = axis(rec.x)
  const y = axis(rec.y)
  const w = axis(rec.w)
  const h = axis(rec.h)
  const align = typeof rec.align === 'string' ? rec.align : 'auto'
  const valign = typeof rec.valign === 'string' ? rec.valign : 'auto'
  return {
    gridColumnStart: x,
    gridColumnEnd: x + w,
    gridRowStart: y,
    gridRowEnd: y + h,
    justifySelf: JUSTIFY_SELF[align] || 'stretch',
    alignSelf: ALIGN_SELF[valign] || 'stretch',
  }
}

export function grid2dTemplate(
  schema: unknown,
  grids: unknown,
): { columns: string[]; rows: string[] } {
  const rec = asRecord(schema)
  const cols = grid2dCols(schema)
  const rowHeight = rec.rowHeight == null || rec.rowHeight === '' ? '3.125rem' : String(grid2dCssLen(rec.rowHeight))
  const columns = Array.from({ length: cols }, () => '1fr')
  let maxRow = 0
  const list = asGrids(grids)
  for (const grid of list) {
    maxRow = Math.max(maxRow, axis(grid.y) + axis(grid.h) - 1)
  }
  const rows = Array.from({ length: maxRow }, () => rowHeight)
  for (const grid of list) {
    const x = axis(grid.x)
    const y = axis(grid.y)
    if (grid.width != null && grid.width !== '') {
      const len = grid2dCssLen(grid.width)
      columns[x - 1] = typeof len === 'number' ? String(len) : len
    }
    if (grid.height != null && grid.height !== '' && y - 1 < rows.length) {
      const len = grid2dCssLen(grid.height)
      rows[y - 1] = typeof len === 'number' ? String(len) : len
    }
  }
  return { columns, rows }
}

export function grid2dContainerStyle(schema: unknown, grids: unknown): Record<string, string | number> {
  const rec = asRecord(schema)
  const gap = grid2dGap(schema)
  const tpl = grid2dTemplate(schema, grids ?? rec.grids)
  const width = rec.width == null || rec.width === '' ? 'auto' : grid2dCssLen(rec.width)
  return {
    display: 'grid',
    width: typeof width === 'number' ? String(width) : width,
    columnGap: gap.columnGap,
    rowGap: gap.rowGap,
    gridTemplateColumns: tpl.columns.join(' '),
    gridTemplateRows: tpl.rows.join(' '),
  }
}
