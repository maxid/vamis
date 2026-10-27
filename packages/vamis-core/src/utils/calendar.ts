/** Calendar。对齐 Amis：schedules 静态或 `${}`；默认色循环 bg-warning…；largeMode 默认 false。 */

import { evalFormula, resolveValue } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export const CALENDAR_SCHEDULE_CLASS_NAMES = [
  'bg-warning',
  'bg-danger',
  'bg-success',
  'bg-info',
  'bg-secondary',
] as const

/** zh-CN / moment：周一起始。禁止用 helper `grid-cols-7`（Amis 该 class 实际是 6 列）。 */
export const CALENDAR_WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'] as const

export type CalendarCell = {
  date: Date
  day: number
  iso: string
  current: boolean
  today: boolean
  events: CalendarSchedule[]
}

export type CalendarLane = {
  content: string
  className: string
  width: number
  placeholder: boolean
}

export type CalendarSchedule = {
  startTime: unknown
  endTime: unknown
  content: unknown
  className: string
}

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function calendarParseDate(value: unknown): Date {
  if (value == null || value === '') return new Date()
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? new Date() : value
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value < 1e12 ? value * 1000 : value)
  }
  const text = String(value).trim()
  if (/^NOW\(\)$/i.test(text)) {
    const now = evalFormula('NOW()')
    if (now instanceof Date) return now
    if (typeof now === 'number' && Number.isFinite(now)) return new Date(now)
    return new Date()
  }
  if (/^\d+$/.test(text)) {
    const n = Number(text)
    return new Date(n < 1e12 ? n * 1000 : n)
  }
  const d = new Date(text)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

export function calendarRawValue(schema: unknown, data: PlainObject = {}): unknown {
  const rec = asRecord(schema)
  if (rec.value != null) {
    if (typeof rec.value === 'string' && rec.value.includes('${')) return resolveValue(rec.value, data)
    return rec.value
  }
  if (rec.name != null && rec.name !== '') return data[String(rec.name)]
  return undefined
}

export function calendarMonthTitle(cursor: Date): string {
  return `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`
}

export function calendarYearLabel(cursor: Date): string {
  return `${cursor.getFullYear()}年`
}

export function calendarMonthLabel(cursor: Date): string {
  return `${cursor.getMonth() + 1}月`
}

export const CALENDAR_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

/** Amis YearsView：十年一组，前后各一格置灰。 */
export function calendarDecade(cursor: Date): {
  from: number
  to: number
  years: Array<{ year: number; muted: boolean }>
} {
  const y = cursor.getFullYear()
  const base = y - (y % 10)
  const years: Array<{ year: number; muted: boolean }> = []
  for (let i = -1; i < 11; i++) years.push({ year: base + i, muted: i === -1 || i === 10 })
  return { from: base, to: base + 9, years }
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function calendarFormatDateTime(value: unknown): string {
  const d = calendarParseDate(value)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

export function calendarSchedulePayload(events: CalendarSchedule[], currentDate: Date) {
  return {
    currentDate,
    scheduleData: events.map((item) => ({
      startTime: item.startTime,
      endTime: item.endTime,
      content: item.content,
      className: item.className,
      time: `${calendarFormatDateTime(item.startTime)} - ${calendarFormatDateTime(item.endTime ?? item.startTime)}`,
    })),
  }
}

export function calendarDefaultScheduleAction(): Record<string, unknown> {
  return {
    actionType: 'dialog',
    dialog: {
      title: '日程',
      actions: [],
      closeOnEsc: true,
      body: {
        type: 'table',
        columns: [
          { name: 'time', label: '时间' },
          { name: 'content', label: '内容' },
        ],
        data: '${scheduleData}',
      },
    },
  }
}

export function calendarScheduleAction(schema: unknown): Record<string, unknown> {
  const raw = asRecord(schema).scheduleAction
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>
  return calendarDefaultScheduleAction()
}

/** 窄屏年选择器：当前年 ±100，对齐 Amis Picker。 */
export function calendarPickerYears(cursor: Date, span = 100): number[] {
  const y = cursor.getFullYear()
  const out: number[] = []
  for (let i = y - span; i <= y + span; i++) out.push(i)
  return out
}

export const CALENDAR_PICKER_ITEM_HEIGHT = 48
export const CALENDAR_PICKER_VISIBLE = 5

export type CalendarPickerOption = { value: number; text: string }

export function calendarPickerYearOptions(
  cursor: Date,
  span = 100,
  unit = true
): CalendarPickerOption[] {
  return calendarPickerYears(cursor, span).map((year) => ({
    value: year,
    text: unit ? `${year}年` : String(year),
  }))
}

export function calendarPickerMonthOptions(): CalendarPickerOption[] {
  return CALENDAR_MONTHS.map((month) => ({
    value: month - 1,
    text: `${String(month).padStart(2, '0')}月`,
  }))
}

/** 点滚轮可见行：相对当前选中行的偏移。对齐 Amis PickerColumn onClickItem。 */
export function calendarPickerIndexFromClick(
  yInWheel: number,
  currentIndex: number,
  count: number,
  itemHeight = CALENDAR_PICKER_ITEM_HEIGHT,
  visible = CALENDAR_PICKER_VISIBLE,
): number {
  if (count <= 0) return 0
  const visibleIndex = Math.floor(yInWheel / itemHeight)
  const center = (visible - 1) / 2
  const next = currentIndex + (visibleIndex - center)
  return Math.min(count - 1, Math.max(0, next))
}

/** 周一为周首的 6×7 格子，含上月/下月补齐（对齐 Amis react-datetime）。 */
export function calendarMonthCells(
  cursor: Date,
  schedules: CalendarSchedule[] = [],
  today: Date = new Date(),
): CalendarCell[] {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1)
  const mondayPad = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - mondayPad)
  const todayIso = isoDay(today)
  const out: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const iso = isoDay(date)
    out.push({
      date,
      day: date.getDate(),
      iso,
      current: date.getMonth() === month && date.getFullYear() === year,
      today: iso === todayIso,
      events: eventsOnDay(schedules, iso),
    })
  }
  return out
}

export function calendarWeeks(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function diffDays(end: Date, start: Date): number {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000)
}

function inclusiveSpan(from: Date, end: Date): number {
  const days = Math.max(0, diffDays(end, from))
  return days + 1
}

function remainingInWeek(from: Date): number {
  return 7 - ((from.getDay() + 6) % 7)
}

/** 放大模式：起始格画出跨度，同周后续格占位，周一重新起条。 */
export function calendarWeekLanes(week: CalendarCell[], schedules: CalendarSchedule[]): CalendarLane[][] {
  const laneMap = new Map<number, number>()
  return week.map((cell, col) => {
    const shown = cell.events.slice(0, 3)
    const slots: Array<CalendarLane | null> = [null, null, null]
    const freeLane = () => {
      const i = slots.findIndex((s) => s == null)
      return i >= 0 ? i : 0
    }

    for (const hit of shown) {
      const idx = schedules.indexOf(hit)
      const start = startOfDay(calendarParseDate(hit.startTime))
      const end = startOfDay(calendarParseDate(hit.endTime ?? hit.startTime))
      const startsToday = isoDay(start) === cell.iso
      const isMonday = col === 0

      if (startsToday || (isMonday && !startsToday)) {
        let lane = idx >= 0 ? laneMap.get(idx) : undefined
        if (lane == null) {
          lane = freeLane()
          if (idx >= 0) laneMap.set(idx, lane)
        }
        const width = Math.min(inclusiveSpan(cell.date, end), remainingInWeek(cell.date)) || 1
        slots[lane] = {
          content: hit.content == null ? '' : String(hit.content),
          className: hit.className,
          width,
          placeholder: false,
        }
      } else {
        const lane = idx >= 0 ? laneMap.get(idx) : undefined
        if (lane == null) continue
        slots[lane] = { content: '', className: '', width: 1, placeholder: true }
      }
    }

    let last = slots.length - 1
    while (last >= 0 && slots[last] == null) last -= 1
    const filled: CalendarLane[] = []
    for (let i = 0; i <= last; i++) {
      filled.push(slots[i] || { content: '', className: '', width: 1, placeholder: true })
    }
    return filled
  })
}

export function calendarLaneMore(cell: CalendarCell): number {
  return Math.max(0, cell.events.length - 3)
}

export function calendarLargeMode(schema: unknown): boolean {
  return asRecord(schema).largeMode === true
}

export function calendarScheduleClassNames(schema: unknown): string[] {
  const raw = asRecord(schema).scheduleClassNames
  if (!Array.isArray(raw) || !raw.length) return [...CALENDAR_SCHEDULE_CLASS_NAMES]
  return raw.map((item) => String(item || '')).filter(Boolean)
}

export function calendarSchedules(schema: unknown, data: PlainObject = {}): CalendarSchedule[] {
  const raw = asRecord(schema).schedules
  const resolved = typeof raw === 'string' ? resolveValue(raw, data) : raw
  if (!Array.isArray(resolved)) return []
  const palette = calendarScheduleClassNames(schema)
  let index = 0
  const out: CalendarSchedule[] = []
  for (const item of resolved) {
    const rec = asRecord(item)
    let className = rec.className == null || rec.className === '' ? '' : String(rec.className)
    if (!className && palette.length) {
      className = palette[index % palette.length]
      index += 1
    }
    out.push({
      startTime: rec.startTime,
      endTime: rec.endTime ?? rec.startTime,
      content: rec.content,
      className,
    })
  }
  return out
}

export function eventsOnDay(schedules: CalendarSchedule[], day: string): CalendarSchedule[] {
  return schedules.filter((item) => {
    const start = isoDay(calendarParseDate(item.startTime))
    const end = isoDay(calendarParseDate(item.endTime ?? item.startTime))
    return day >= start && day <= end
  })
}

export function calendarStyleEntries(
  style: unknown,
): Array<{ key: string; value: string; important: boolean }> {
  const rec = asRecord(style)
  const out: Array<{ key: string; value: string; important: boolean }> = []
  for (const [rawKey, rawValue] of Object.entries(rec)) {
    if (rawValue == null || rawValue === false) continue
    const key = rawKey.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`)
    let text = String(rawValue)
    const important = /!important/i.test(text)
    if (important) text = text.replace(/!important/gi, '').trim()
    out.push({ key, value: text, important })
  }
  return out
}
