import { evalExpression, filterTpl } from '@vamis/core'

/** Amis `getIndexDataField`：`listItem.title: ${name}` 抽 `name`。 */
export function listIndexDataField(listItem: unknown, indexField?: string): string {
  const key = indexField || 'title'
  const rec = listItem && typeof listItem === 'object' && !Array.isArray(listItem)
    ? (listItem as Record<string, unknown>)
    : {}
  const tpl = rec[key]
  if (typeof tpl === 'string') {
    const match = tpl.trim().match(/^\$\{([^}]+)\}$/)
    if (match) return match[1].trim()
  }
  return key
}

export function listItemLetter(row: Record<string, unknown>, field: string): string {
  const value = row[field]
  if (typeof value !== 'string' || !/^[A-Za-z]/.test(value)) return ''
  return value.charAt(0).toUpperCase()
}

export function parseListIndexes(index: unknown, data: Record<string, unknown>, length: number): number[] {
  if (index == null || index === '') return []
  const raw = typeof index === 'string' ? filterTpl(index, data) : String(index)
  return raw
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0 && n < length)
}

export function listRowMatchesCondition(
  row: Record<string, unknown>,
  condition: unknown,
  data: Record<string, unknown>,
): boolean {
  if (condition == null || condition === '') return false
  if (typeof condition === 'string') return evalExpression(condition, { ...data, ...row })
  if (typeof condition !== 'object' || Array.isArray(condition)) return false
  const rec = condition as {
    conjunction?: string
    children?: Array<{ left?: { field?: string }; op?: string; right?: unknown }>
  }
  const kids = rec.children || []
  if (!kids.length) return false
  const tests = kids.map((child) => {
    const field = child.left?.field
    if (!field) return false
    if (child.op === 'equal' || child.op == null) return String(row[field] ?? '') === String(child.right ?? '')
    return false
  })
  return rec.conjunction === 'or' ? tests.some(Boolean) : tests.every(Boolean)
}

export function matchListRows(
  rows: Record<string, unknown>[],
  data: Record<string, unknown>,
  index?: unknown,
  condition?: unknown,
): number[] {
  const fromIndex = parseListIndexes(index, data, rows.length)
  if (condition == null || condition === '') return fromIndex
  const fromCond: number[] = []
  rows.forEach((row, i) => {
    if (listRowMatchesCondition(row, condition, data)) fromCond.push(i)
  })
  if (!fromIndex.length) return fromCond
  return [...new Set([...fromIndex, ...fromCond])]
}

export function isListControlClick(event: MouseEvent): boolean {
  const el = event.target
  if (!(el instanceof Element)) return false
  return Boolean(
    el.closest(
      'button, a, input, textarea, select, [data-vamis-action], [data-slot="checkbox"], [role="radio"], .vamis-list__check, .vamis-list__drag',
    ),
  )
}
