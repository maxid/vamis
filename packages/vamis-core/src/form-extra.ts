export type KvRow = { key: string; value: unknown }

export function kvRowsFromValue(value: unknown): KvRow[] {
  if (Array.isArray(value)) {
    const rows = value.map((item) => {
      if (item && typeof item === 'object') {
        const row = item as Record<string, unknown>
        return { key: String(row.key ?? ''), value: row.value ?? '' }
      }
      return { key: String(item ?? ''), value: '' }
    })
    return rows.length ? rows : [{ key: '', value: '' }]
  }
  if (value && typeof value === 'object') {
    const rows = Object.entries(value as Record<string, unknown>).map(([key, val]) => ({
      key,
      value: val,
    }))
    return rows.length ? rows : [{ key: '', value: '' }]
  }
  return [{ key: '', value: '' }]
}

export function valueFromKvRows(rows: KvRow[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const row of rows) {
    const key = String(row.key ?? '').trim()
    if (!key) continue
    obj[key] = row.value ?? ''
  }
  return obj
}

export type RangePair = { start: string; end: string }

export function readRangeValue(value: unknown, delimiter?: string): RangePair {
  if (Array.isArray(value)) {
    return { start: String(value[0] ?? ''), end: String(value[1] ?? '') }
  }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return {
      start: String(obj.start ?? obj.from ?? obj.min ?? ''),
      end: String(obj.end ?? obj.to ?? obj.max ?? ''),
    }
  }
  if (typeof value === 'string' && value && delimiter) {
    const [start = '', end = ''] = value.split(delimiter)
    return { start, end }
  }
  return { start: '', end: '' }
}

export function writeRangeValue(range: RangePair, delimiter?: string): unknown {
  if (delimiter) return [range.start, range.end].join(delimiter)
  return { start: range.start, end: range.end }
}

export function parseQuarter(value: unknown): { year: string; quarter: string } {
  const text = String(value ?? '').trim()
  const match = text.match(/^(\d{4})[-/\s]?Q?([1-4])$/i)
  if (match) return { year: match[1], quarter: match[2] }
  return { year: '', quarter: '' }
}

export function formatQuarter(year: string, quarter: string): string {
  if (!year && !quarter) return ''
  if (year && quarter) return `${year}-Q${quarter}`
  return year || `Q${quarter}`
}

export const CONDITION_OPERATORS = [
  { value: 'equal', label: '等于' },
  { value: 'not_equal', label: '不等于' },
  { value: 'like', label: '包含' },
  { value: 'greater', label: '大于' },
  { value: 'less', label: '小于' },
  { value: 'is_empty', label: '为空' },
  { value: 'is_not_empty', label: '不为空' },
  { value: 'in', label: '属于' },
] as const

export type ConditionRule = { field: string; op: string; value: unknown }
export type ConditionValue = { conjunction: 'and' | 'or'; children: ConditionRule[] }

export function emptyConditionRule(): ConditionRule {
  return { field: '', op: 'equal', value: '' }
}

export function normalizeConditionValue(value: unknown): ConditionValue {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    const conjunction = obj.conjunction === 'or' ? 'or' : 'and'
    const raw = Array.isArray(obj.children) ? obj.children : []
    const children = raw.map((item) => {
      if (!item || typeof item !== 'object') return emptyConditionRule()
      const rule = item as Record<string, unknown>
      const left = rule.left && typeof rule.left === 'object' ? (rule.left as Record<string, unknown>) : null
      return {
        field: String(rule.field ?? left?.field ?? ''),
        op: String(rule.op ?? 'equal'),
        value: rule.value ?? rule.right ?? '',
      }
    })
    return { conjunction, children: children.length ? children : [emptyConditionRule()] }
  }
  return { conjunction: 'and', children: [emptyConditionRule()] }
}

export function inflateArrayRows(value: unknown, fieldName = 'item'): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length === 0) return [{}]
  return value.map((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) return { ...(item as Record<string, unknown>) }
    return { [fieldName]: item }
  })
}

export function flattenArrayRows(
  rows: Record<string, unknown>[],
  fieldName = 'item',
  flat = true,
): unknown[] {
  if (!flat) return rows.map((row) => ({ ...row }))
  return rows.map((row) => (fieldName in row ? row[fieldName] : Object.values(row)[0]))
}

export const DATE_PART_TYPES = [
  'input-month',
  'input-quarter',
  'input-year',
  'input-month-range',
  'input-quarter-range',
  'input-year-range',
] as const

export const FORM_EXTRA_TYPES = [
  'picker',
  'input-tag',
  'input-color',
  'input-range',
  'fieldset',
  'group',
  'input-group',
  'chained-select',
  'input-sub-form',
  'input-array',
  'input-kv',
  'input-rich-text',
  'editor',
  'condition-builder',
  ...DATE_PART_TYPES,
] as const
