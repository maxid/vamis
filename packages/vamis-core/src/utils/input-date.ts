/** InputDate：对齐 Amis DateControl / DatePicker / filterDate（6.13.0）。 */

import type { ManipulateType } from 'dayjs'
import { dayjs, isDayjs, parseDate, type Dayjs } from './dayjs'
import { resolveValue } from '../formula'
import { getPathValue } from './path-value'
import { calendarMonthCells, calendarWeeks, isoDay, type CalendarCell } from './calendar'
import type { PlainObject, SchemaObject } from '../types'

export type InputDateView = 'days' | 'months' | 'years' | 'time'

const RELATIVE_RE =
  /^(.+)?(\+|-)(\d+)(minute|min|hour|day|week|month|year|weekday|second|millisecond)s?$/i

const UNIT_MAP: Record<string, ManipulateType> = {
  year: 'year',
  month: 'month',
  week: 'week',
  weekday: 'week',
  day: 'day',
  hour: 'hour',
  minute: 'minute',
  min: 'minute',
  second: 'second',
  millisecond: 'millisecond',
}

const SHORTCUT_PRESETS: Record<string, { label: string; apply: (now: Dayjs) => Dayjs }> = {
  now: { label: '现在', apply: (now) => now },
  today: { label: '今天', apply: (now) => now.startOf('day') },
  yesterday: { label: '昨天', apply: (now) => now.add(-1, 'days').startOf('day') },
  tomorrow: { label: '明天', apply: (now) => now.add(1, 'days').startOf('day') },
  thisweek: { label: '本周一', apply: (now) => now.startOf('isoWeek').startOf('day') },
  thismonth: { label: '本月初', apply: (now) => now.startOf('month') },
  prevmonth: { label: '上个月初', apply: (now) => now.startOf('month').add(-1, 'month') },
  prevquarter: { label: '上个季节初', apply: (now) => now.startOf('quarter').add(-1, 'quarter') },
  thisquarter: { label: '本季度初', apply: (now) => now.startOf('quarter') },
  endofthisweek: { label: '本周日', apply: (now) => now.endOf('isoWeek') },
  endofthismonth: { label: '本月底', apply: (now) => now.endOf('month') },
  endoflastmonth: { label: '上月底', apply: (now) => now.add(-1, 'month').endOf('month') },
}

const SHORTCUT_ADVANCE: Array<{
  re: RegExp
  label: (n: string) => string
  apply: (now: Dayjs, n: number) => Dayjs
}> = [
  { re: /^(\d+)hoursago$/, label: (n) => `${n}小时前`, apply: (now, n) => now.subtract(n, 'hours') },
  { re: /^(\d+)hourslater$/, label: (n) => `${n}小时后`, apply: (now, n) => now.add(n, 'hours') },
  { re: /^(\d+)daysago$/, label: (n) => `${n}天前`, apply: (now, n) => now.subtract(n, 'days') },
  { re: /^(\d+)dayslater$/, label: (n) => `${n}天后`, apply: (now, n) => now.add(n, 'days') },
  { re: /^(\d+)weeksago$/, label: (n) => `${n}周前`, apply: (now, n) => now.subtract(n, 'weeks') },
  { re: /^(\d+)weekslater$/, label: (n) => `${n}周后`, apply: (now, n) => now.add(n, 'weeks') },
  { re: /^(\d+)monthsago$/, label: (n) => `${n}月前`, apply: (now, n) => now.subtract(n, 'months') },
  { re: /^(\d+)monthslater$/, label: (n) => `${n}月后`, apply: (now, n) => now.add(n, 'months') },
  { re: /^(\d+)quartersago$/, label: (n) => `${n}季度前`, apply: (now, n) => now.subtract(n, 'quarters') },
  { re: /^(\d+)quarterslater$/, label: (n) => `${n}季度后`, apply: (now, n) => now.add(n, 'quarters') },
]

export type InputDateShortcut = { key?: string; label: string; date: Dayjs }

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function factory(utc: boolean) {
  return (input?: unknown, format?: string, strict?: boolean) =>
    parseDate(input, format, { utc, strict: strict === true })
}

export function inputDateType(schema: { type?: string } | string | undefined): string {
  if (typeof schema === 'string') return schema
  return String(schema?.type || 'input-date')
}

export function inputDateValueFormat(schema: { format?: unknown; valueFormat?: unknown; type?: string }): string {
  const rec = asRecord(schema)
  const raw = rec.valueFormat ?? rec.format
  if (typeof raw === 'string' && raw) return raw
  return 'X'
}

export function inputDateDisplayFormat(schema: {
  inputFormat?: unknown
  displayFormat?: unknown
  timeFormat?: unknown
  type?: string
}): string {
  const rec = asRecord(schema)
  const raw = rec.displayFormat ?? rec.inputFormat
  if (typeof raw === 'string' && raw) return raw
  const type = inputDateType(schema)
  if (type === 'input-datetime') return 'YYYY-MM-DD HH:mm:ss'
  if (type === 'input-time') return 'HH:mm'
  return 'YYYY-MM-DD'
}

export function inputDateTimeFormat(schema: {
  timeFormat?: unknown
  displayFormat?: unknown
  inputFormat?: unknown
  type?: string
}): string {
  const rec = asRecord(schema)
  if (typeof rec.timeFormat === 'string' && rec.timeFormat) return rec.timeFormat
  const display = inputDateDisplayFormat(schema)
  const hasSec = /s/i.test(display)
  if (inputDateType(schema) === 'input-time') return hasSec ? 'HH:mm:ss' : 'HH:mm'
  if (/H|h|m|s/.test(display)) return hasSec ? 'HH:mm:ss' : 'HH:mm'
  return ''
}

export function inputDateShowsTime(schema: { type?: string; timeFormat?: unknown; displayFormat?: unknown; inputFormat?: unknown }): boolean {
  const type = inputDateType(schema)
  if (type === 'input-time' || type === 'input-datetime') return true
  return Boolean(inputDateTimeFormat(schema))
}

export function inputDateViewMode(schema: { type?: string; viewMode?: unknown }): InputDateView {
  const rec = asRecord(schema)
  const raw = String(rec.viewMode || '')
  if (raw === 'time' || raw === 'months' || raw === 'years' || raw === 'days') return raw
  const type = inputDateType(schema)
  if (type === 'input-time') return 'time'
  return 'days'
}

export function inputDatePlaceholder(schema: { placeholder?: unknown; type?: string }): string {
  if (schema.placeholder != null && schema.placeholder !== '') return String(schema.placeholder)
  const type = inputDateType(schema)
  if (type === 'input-datetime') return '请选择日期以及时间'
  if (type === 'input-time') return '请选择时间'
  return '请选择日期'
}

export function inputDateClearable(schema: { clearable?: unknown }): boolean {
  return schema.clearable !== false
}

export function inputDateCloseOnSelect(schema: { closeOnSelect?: unknown; type?: string }): boolean {
  if (schema.closeOnSelect === false) return false
  if (schema.closeOnSelect === true) return true
  return true
}

function lookupDollar(value: string, data: PlainObject): unknown {
  const key = value.slice(1)
  if (!key || key.startsWith('{')) return undefined
  if (Object.prototype.hasOwnProperty.call(data, key)) return data[key]
  return getPathValue(data, key)
}

/** 对齐 Amis `filterDate`：相对值 / $var / ${} / today / now / format。 */
export function filterDate(
  value: unknown,
  data: PlainObject = {},
  format = 'X',
  utc = false,
  now: Date | Dayjs = new Date(),
): Dayjs | undefined {
  if (value == null || value === '' || value === false) return undefined
  const mm = factory(utc)
  const origin = isDayjs(now) ? now.clone() : mm(now)

  if (isDayjs(value)) return utc ? dayjs.utc(value) : value.clone()
  if (value instanceof Date) return mm(value)

  let next: unknown = value
  if (typeof next === 'string') {
    next = next.trim()
    if (!next) return undefined
    if (next.startsWith('$') && !next.startsWith('${')) {
      const resolved = lookupDollar(next, data)
      if (resolved == null || resolved === '') return undefined
      next = resolved
    } else if (next.includes('${')) {
      next = resolveValue(next, { ...data, now: origin.toDate(), today: origin.clone().startOf('day').toDate() })
    }
  }

  if (next == null || next === '') return undefined
  if (isDayjs(next)) return utc ? dayjs.utc(next) : next.clone()
  if (next instanceof Date) return mm(next)

  if (typeof next === 'string') {
    const text = next.trim()
    const relative = RELATIVE_RE.exec(text)
    if (relative) {
      const step = parseInt(relative[3], 10)
      const unit = UNIT_MAP[relative[4].toLowerCase()] || (relative[4].toLowerCase() as ManipulateType)
      const base = relative[1]
        ? filterDate(relative[1], data, format, utc, origin) || origin.clone().startOf('day')
        : /minute|min|hour|second/i.test(relative[4])
          ? origin.clone()
          : origin.clone().startOf('day')
      return relative[2] === '-' ? base.subtract(step, unit) : base.add(step, unit)
    }
    if (text === 'now') return origin.clone()
    if (text === 'today') return origin.clone().startOf('day')
    const byFormat = format ? parseDate(text, format, { utc, strict: true }) : undefined
    if (byFormat?.isValid()) return utc ? byFormat.local() : byFormat
    return normalizeDate(text, format, { utc })
  }

  if (typeof next === 'number' && Number.isFinite(next)) {
    return normalizeDate(next, format, { utc })
  }
  return undefined
}

export function normalizeDate(
  value: unknown,
  format?: string,
  options?: { utc?: boolean },
): Dayjs | undefined {
  if (value == null || value === '' || value === '0' || value === false) return undefined
  const utc = options?.utc === true
  const mm = factory(utc)
  if (isDayjs(value)) return utc ? dayjs.utc(value).local() : value.clone()
  if (value instanceof Date) return mm(value)

  if (typeof value === 'string' || typeof value === 'number') {
    const strict = utc
      ? parseDate(value, format, { utc: true }).local()
      : parseDate(value, format, { strict: true })
    if (strict.isValid()) return strict

    let formats = ['', 'YYYY-MM-DD HH:mm:ss', 'X']
    const text = String(value)
    if (/^\d{10}((\.\d+)*)$/.test(text)) formats = ['X', 'x', 'YYYY-MM-DD HH:mm:ss', '']
    else if (/^\d{13}((\.\d+)*)$/.test(text)) formats = ['x', 'X', 'YYYY-MM-DD HH:mm:ss', '']

    for (const item of formats) {
      const date = item ? parseDate(value, item, { utc }) : parseDate(value, undefined, { utc })
      if (date.isValid()) return utc ? date.clone() : date
    }
  }
  return undefined
}

export function formatInputDate(date: Dayjs | undefined, format: string, utc = false): string {
  if (!date || !date.isValid()) return ''
  const m = utc ? dayjs.utc(date) : date
  return m.format(format)
}

export function parseInputDateValue(
  value: unknown,
  schema: SchemaObject,
  data: PlainObject = {},
  now?: Date | Dayjs,
): Dayjs | undefined {
  const format = inputDateValueFormat(schema)
  const utc = schema.utc === true
  return filterDate(value, data, format, utc, now) || normalizeDate(value, format, { utc })
}

export function storeInputDateValue(
  date: Dayjs | undefined,
  schema: SchemaObject,
): string {
  if (!date || !date.isValid()) return ''
  return formatInputDate(date, inputDateValueFormat(schema), schema.utc === true)
}

/** 日历点选：日期模式落到当天 0 点（`isEndDate` 则 23:59:59），时间模式保留时分秒。 */
export function pickInputDateValue(
  date: Dayjs | undefined,
  schema: SchemaObject,
  keepTime?: Dayjs,
): string {
  if (!date || !date.isValid()) return ''
  let next = date.clone()
  if (inputDateType(schema) === 'input-time') {
    return storeInputDateValue(next, schema)
  }
  if (inputDateShowsTime(schema) && keepTime?.isValid()) {
    next = next.hour(keepTime.hour()).minute(keepTime.minute()).second(keepTime.second()).millisecond(keepTime.millisecond())
  } else if (schema.isEndDate === true) {
    next = next.endOf('day')
  } else if (!inputDateShowsTime(schema)) {
    next = next.startOf('day')
  }
  return storeInputDateValue(next, schema)
}

export function displayInputDateValue(
  value: unknown,
  schema: SchemaObject,
  data: PlainObject = {},
): string {
  const date = parseInputDateValue(value, schema, data)
  if (!date) return value == null || value === '' ? '' : String(value)
  return formatInputDate(date, inputDateDisplayFormat(schema), false)
}

export function resolveBoundDate(
  raw: unknown,
  schema: SchemaObject,
  data: PlainObject,
  now?: Date | Dayjs,
): Dayjs | undefined {
  if (raw == null || raw === '') return undefined
  return parseInputDateValue(raw, schema, data, now)
}

export function inputDateMinMax(
  schema: SchemaObject,
  data: PlainObject,
  now?: Date | Dayjs,
): { min?: Dayjs; max?: Dayjs } {
  return {
    min: resolveBoundDate(schema.minDate, schema, data, now),
    max: resolveBoundDate(schema.maxDate, schema, data, now),
  }
}

function compileDisabledDate(body: string): ((currentDate: Dayjs, props: unknown) => boolean) | undefined {
  try {
    return new Function('currentDate', 'props', body) as (currentDate: Dayjs, props: unknown) => boolean
  } catch {
    return undefined
  }
}

export function isInputDateDisabled(
  date: Dayjs,
  schema: SchemaObject,
  data: PlainObject,
  trusted = false,
  now?: Date | Dayjs,
): boolean {
  const { min, max } = inputDateMinMax(schema, data, now)
  if (min && date.clone().endOf('day').isBefore(min)) return true
  if (max && date.clone().startOf('day').isAfter(max)) return true
  const raw = schema.disabledDate
  if (typeof raw === 'function') {
    try {
      return Boolean((raw as (currentDate: Dayjs, props: unknown) => unknown)(date, { ...schema, data }))
    } catch {
      return false
    }
  }
  if (typeof raw === 'string' && raw && trusted) {
    const fn = compileDisabledDate(raw)
    if (!fn) return false
    try {
      return Boolean(fn(date, { ...schema, data }))
    } catch {
      return false
    }
  }
  return false
}

function hasCustomDisabledDate(schema: SchemaObject, trusted: boolean): boolean {
  const raw = schema.disabledDate
  if (typeof raw === 'function') return true
  return typeof raw === 'string' && Boolean(raw) && trusted
}

/** 对齐 Amis MonthsView / YearsView：区间内没有任何合法天才禁用该月/年。 */
function isInputDateUnitDisabled(
  unit: 'month' | 'year',
  date: Dayjs,
  schema: SchemaObject,
  data: PlainObject,
  trusted = false,
  now?: Date | Dayjs,
): boolean {
  const start = date.clone().startOf(unit)
  const end = date.clone().endOf(unit)
  const { min, max } = inputDateMinMax(schema, data, now)
  if (min && end.isBefore(min, 'day')) return true
  if (max && start.isAfter(max, 'day')) return true
  if (!hasCustomDisabledDate(schema, trusted)) return false
  let cursor = start.clone().startOf('day')
  const last = end.clone().startOf('day')
  while (!cursor.isAfter(last, 'day')) {
    if (!isInputDateDisabled(cursor, schema, data, trusted, now)) return false
    cursor = cursor.add(1, 'day')
  }
  return true
}

export function isInputDateMonthDisabled(
  year: number,
  month: number,
  schema: SchemaObject,
  data: PlainObject,
  trusted = false,
  now?: Date | Dayjs,
): boolean {
  return isInputDateUnitDisabled('month', dayjs().year(year).month(month).date(1), schema, data, trusted, now)
}

export function isInputDateYearDisabled(
  year: number,
  schema: SchemaObject,
  data: PlainObject,
  trusted = false,
  now?: Date | Dayjs,
): boolean {
  return isInputDateUnitDisabled('year', dayjs().year(year).month(0).date(1), schema, data, trusted, now)
}

function resolveShortcutPreset(key: string): { label: string; apply: (now: Dayjs) => Dayjs } | undefined {
  const preset = SHORTCUT_PRESETS[key]
  if (preset) return preset
  for (const item of SHORTCUT_ADVANCE) {
    const match = item.re.exec(key)
    if (!match) continue
    const n = match[1]
    return {
      label: item.label(n),
      apply: (now) => item.apply(now, Number(n)),
    }
  }
  return undefined
}

export function resolveInputDateShortcuts(
  raw: unknown,
  data: PlainObject = {},
  now: Date | Dayjs = new Date(),
): InputDateShortcut[] {
  if (raw == null || raw === false || raw === '') return []
  const list: unknown[] = typeof raw === 'string' ? raw.split(',') : Array.isArray(raw) ? raw : [raw]
  const origin = isDayjs(now) ? now.clone() : parseDate(now)
  const out: InputDateShortcut[] = []
  for (const item of list) {
    if (item == null || item === false || item === '') continue
    if (typeof item === 'string') {
      const key = item.trim()
      const preset = resolveShortcutPreset(key)
      if (!preset) continue
      out.push({ key, label: preset.label, date: preset.apply(origin.clone()) })
      continue
    }
    if (typeof item !== 'object' || Array.isArray(item)) continue
    const rec = item as { label?: unknown; date?: unknown }
    const label = rec.label != null ? String(rec.label) : ''
    let dateRaw = rec.date
    if (typeof dateRaw === 'string' && dateRaw.includes('${')) {
      dateRaw = resolveValue(dateRaw, data)
    }
    const date =
      filterDate(dateRaw, data, 'X', false, origin) ||
      (dateRaw instanceof Date ? parseDate(dateRaw) : undefined) ||
      (isDayjs(dateRaw) ? dateRaw.clone() : undefined)
    if (!date || !date.isValid()) continue
    out.push({ label: label || date.format('YYYY-MM-DD'), date })
  }
  return out
}

export function inputDateMonthCells(cursor: Date | Dayjs, today?: Date | Dayjs): CalendarCell[][] {
  const date = isDayjs(cursor) ? cursor.toDate() : cursor
  const now = today ? (isDayjs(today) ? today.toDate() : today) : new Date()
  return calendarWeeks(calendarMonthCells(date, [], now))
}

export function inputDateCellIso(cell: CalendarCell): string {
  return cell.iso || isoDay(cell.date)
}

export function inputDateDefaultStored(
  schema: SchemaObject,
  data: PlainObject,
  current: unknown,
  now?: Date | Dayjs,
): string | undefined {
  const raw = current ?? schema.value
  if (raw == null || raw === '') return undefined
  const date = parseInputDateValue(raw, schema, data, now)
  if (!date) return undefined
  return storeInputDateValue(date, schema)
}

export function inputDateSetDataValue(
  values: Record<string, unknown> | undefined,
  name?: string,
): unknown | undefined {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return undefined
  if (Object.prototype.hasOwnProperty.call(values, 'value')) return values.value
  if (name && Object.prototype.hasOwnProperty.call(values, name)) return values[name]
  return undefined
}

export function inputDateResetValue(schema: { resetValue?: unknown; value?: unknown }, pristine: unknown): unknown {
  if (pristine !== undefined) return pristine
  if (schema.resetValue !== undefined) return schema.resetValue
  if (schema.value !== undefined) return schema.value
  return ''
}

export const INPUT_DATE_MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] as const

export function inputDateHours(): string[] {
  return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
}

export function inputDateMinutes(): string[] {
  return Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
}

export function parseTypedInputDate(
  text: string,
  schema: SchemaObject,
  data: PlainObject = {},
): Dayjs | undefined {
  const trimmed = text.trim()
  if (!trimmed) return undefined
  const display = inputDateDisplayFormat(schema)
  const parsed = parseDate(trimmed, display, { strict: true })
  if (parsed.isValid()) return parsed
  return parseInputDateValue(trimmed, schema, data)
}
