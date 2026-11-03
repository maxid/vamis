/**
 * 公式 / 日期解析用的 dayjs。对齐原 moment 主路径：X/x、宽松分隔符、中文年月日。
 */
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekday from 'dayjs/plugin/weekday'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'

dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(weekday)
dayjs.extend(quarterOfYear)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(localizedFormat)
dayjs.extend(advancedFormat)

export { dayjs }
export type { Dayjs }

export const isDayjs = (value: unknown): value is Dayjs => dayjs.isDayjs(value)

export type ParseDateOptions = {
  utc?: boolean
  strict?: boolean
}

function softenDateText(raw: string): string {
  let text = raw.trim()
  if (/[年月日时分秒]/.test(text)) {
    text = text
      .replace(/年/g, '-')
      .replace(/月/g, '-')
      .replace(/日/g, ' ')
      .replace(/时/g, ':')
      .replace(/分/g, ':')
      .replace(/秒/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/-+$/g, '')
  }
  if (/^\d{4}\.\d{1,2}\.\d{1,2}/.test(text)) {
    text = text.replace(/\./g, '-')
  }
  return text
}

function fromUnix(raw: unknown, milliseconds: boolean, utcFlag: boolean): Dayjs {
  const n = Number(raw)
  if (!Number.isFinite(n)) return dayjs(NaN)
  if (milliseconds) return utcFlag ? dayjs.utc(n) : dayjs(n)
  return utcFlag ? dayjs.unix(n).utc() : dayjs.unix(n)
}

/** 宽松解析：空 format 走原生；指定 format 时再试中文/紧凑数字。 */
export function parseDate(raw: unknown, format?: string, options?: ParseDateOptions): Dayjs {
  const utcFlag = options?.utc === true
  const strict = options?.strict === true
  const ctor = utcFlag ? dayjs.utc : dayjs

  if (raw == null || raw === '') return dayjs(NaN)
  if (isDayjs(raw)) return utcFlag ? dayjs.utc(raw) : raw.clone()
  if (raw instanceof Date) return ctor(raw)

  if (format === 'X') return fromUnix(raw, false, utcFlag)
  if (format === 'x') return fromUnix(raw, true, utcFlag)

  if (typeof raw !== 'string' && typeof raw !== 'number') return dayjs(NaN)

  const text = String(raw)
  if (!format) {
    const native = ctor(softenDateText(text))
    return native.isValid() ? native : ctor(text)
  }

  // 10/13 位数字是 Unix 时间戳，不能当 YYYY-MM-DD 宽松解析（会得到 1596-02-18）。
  if (/^\d{10}(\.\d+)?$/.test(text) || /^\d{13}(\.\d+)?$/.test(text)) {
    return dayjs(NaN)
  }

  const parsed = ctor(text, format, strict)
  if (parsed.isValid()) return parsed

  const softened = softenDateText(text)
  if (softened !== text) {
    const again = ctor(softened, format, strict)
    if (again.isValid()) return again
  }

  if (!strict && /^\d{8}$/.test(text) && /Y{4}/.test(format)) {
    const compact = ctor(text, 'YYYYMMDD', strict)
    if (compact.isValid()) return compact
  }

  return parsed
}
