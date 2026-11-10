/** InputNumber 契约：对齐 Amis `NumberInput` / `NumberControl`（6.13.0）。 */

import { filterTpl } from '../formula'
import { normalizeOptions, type OptionItem } from './options'
import type { PlainObject } from '../types'

export type NumberValue = string | number

/** rc-input-number 7 StepHandler：右侧步进长按才连续加；enhance 两侧按钮没有。 */
export const NUMBER_STEP_DELAY = 600
export const NUMBER_STEP_INTERVAL = 200

/** 对齐 Amis `isNumeric`：`typeof number` 即真；字符串走 `/^[-+]?(?:\d*[.])?\d+$/`。 */
export function numberIsNumeric(value: unknown): boolean {
  if (typeof value === 'number') return true
  if (typeof value === 'string') return /^[-+]?(?:\d*[.])?\d+$/.test(value)
  return false
}

export function getNumberPrecision(value: unknown): number {
  const str = String(value ?? '')
  const expAt = str.toLowerCase().indexOf('e')
  if (expAt >= 0) {
    const exp = Number(str.slice(expAt + 1))
    const base = str.slice(0, expAt)
    const dot = base.indexOf('.')
    const frac = dot >= 0 ? base.length - dot - 1 : 0
    return Math.max(0, frac - (Number.isFinite(exp) ? exp : 0))
  }
  const dot = str.indexOf('.')
  return dot >= 0 ? Math.max(0, str.length - dot - 1) : 0
}

/**
 * 合法精度为 0 和正整数；否则 0。
 * 写了 `step` 时取 `precision` 与 step 小数位的较大值。
 */
export function normalizeNumberPrecision(precision: unknown, step?: number): number {
  if (typeof precision === 'number' && Number.isInteger(precision) && precision >= 0) {
    return Math.max(precision, getNumberPrecision(step ?? 1))
  }
  if (step != null) return Math.max(0, getNumberPrecision(step))
  return 0
}

export function numberFormatter(num: number | string, precision?: number): string {
  const number = +num
  const finalP =
    typeof precision === 'number' ? precision : number.toString().split('.')[1]?.length || 0
  if (typeof number === 'number' && !Number.isNaN(number)) {
    const regexp = finalP ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(\d{3})+$)/g
    return number.toFixed(finalP).replace(regexp, '$1,')
  }
  return (0).toFixed(finalP)
}

export function numberReverter(value: string | number | undefined): string {
  if (!value && value !== 0) return ''
  const stringValue = value.toString()
  const withoutCommas = stringValue.replace(/,/g, '')
  if (stringValue.includes('.')) {
    const decimalPlaces = stringValue.split('.')[1].length
    return Number(withoutCommas).toFixed(decimalPlaces)
  }
  return withoutCommas
}

function splitDecimal(raw: string): { sign: bigint; digits: bigint; precision: number } {
  let str = raw.trim()
  let sign = 1n
  if (str.startsWith('-')) {
    sign = -1n
    str = str.slice(1)
  } else if (str.startsWith('+')) {
    str = str.slice(1)
  }
  const [intPart = '0', fracPart = ''] = str.split('.')
  const precision = fracPart.length
  const digits = BigInt((intPart.replace(/^0+(?=\d)/, '') || '0') + fracPart)
  return { sign, digits, precision }
}

function joinDecimal(sign: bigint, digits: bigint, precision: number): string {
  const neg = sign < 0n && digits !== 0n ? '-' : ''
  let body = digits.toString()
  if (precision <= 0) return neg + body
  if (body.length <= precision) body = body.padStart(precision + 1, '0')
  const i = body.length - precision
  const frac = body.slice(i).replace(/0+$/, '')
  const intPart = body.slice(0, i).replace(/^0+(?=\d)/, '') || '0'
  return frac ? `${neg}${intPart}.${frac}` : `${neg}${intPart}`
}

export function decimalCompare(a: NumberValue, b: NumberValue): number {
  const left = splitDecimal(String(a))
  const right = splitDecimal(String(b))
  const precision = Math.max(left.precision, right.precision)
  const lv = left.sign * left.digits * 10n ** BigInt(precision - left.precision)
  const rv = right.sign * right.digits * 10n ** BigInt(precision - right.precision)
  if (lv === rv) return 0
  return lv < rv ? -1 : 1
}

export function decimalAdd(a: NumberValue, b: NumberValue): string {
  const left = splitDecimal(String(a || 0))
  const right = splitDecimal(String(b || 0))
  const precision = Math.max(left.precision, right.precision)
  const lv = left.sign * left.digits * 10n ** BigInt(precision - left.precision)
  const rv = right.sign * right.digits * 10n ** BigInt(precision - right.precision)
  const sum = lv + rv
  const sign = sum < 0n ? -1n : 1n
  return joinDecimal(sign, sign * sum, precision)
}

function truncDecimal(value: NumberValue, precision: number): string {
  const { sign, digits, precision: cur } = splitDecimal(String(value))
  if (cur <= precision) return joinDecimal(sign, digits, cur)
  const drop = 10n ** BigInt(cur - precision)
  return joinDecimal(sign, digits / drop, precision)
}

function roundDecimal(value: NumberValue, precision: number): string {
  const { sign, digits, precision: cur } = splitDecimal(String(value))
  if (cur === precision) return joinDecimal(sign, digits, cur)
  if (cur < precision) {
    return joinDecimal(sign, digits * 10n ** BigInt(precision - cur), precision)
  }
  const drop = 10n ** BigInt(cur - precision)
  const half = drop / 2n
  const extra = digits % drop
  let next = digits / drop
  if (extra >= half) next += 1n
  return joinDecimal(sign, next, precision)
}

export function formatNumberValue(
  value: unknown,
  precision: number,
  big?: boolean,
): unknown {
  if (value == null || value === '' || !numberIsNumeric(value)) return value
  if (big === true) return String(value)
  const rounded = roundDecimal(value as NumberValue, precision)
  const n = Number(rounded)
  return Number.isNaN(n) ? value : n
}

/**
 * 对齐 `NumberInput.normalizeValue`：非法值回 `resetValue`；再夹 min/max；
 * 非大数且精度对不上时截断（不四舍五入）。
 */
export function normalizeNumberValue(
  value: unknown,
  min: NumberValue | undefined,
  max: NumberValue | undefined,
  precision: number,
  resetValue: unknown,
  clearValueOnEmpty?: boolean,
  isBig?: boolean,
): unknown {
  if (!numberIsNumeric(value)) {
    if (!numberIsNumeric(resetValue)) return clearValueOnEmpty ? undefined : ''
    value = resetValue
  }
  if (typeof value === 'number') {
    if (typeof min === 'number') value = Math.max(value, min)
    if (typeof max === 'number') value = Math.min(value, max)
  }
  if (typeof value === 'string') {
    if (min !== undefined && decimalCompare(value, min) < 0) value = min
    if (max !== undefined && decimalCompare(max, value) < 0) value = max
  }
  if (!isBig && getNumberPrecision(value) !== precision) {
    const truncated = truncDecimal(value as NumberValue, precision)
    value = isBig ? truncated : Number(truncated)
  }
  return value
}

/** min / max / precision / step 支持模板。大数模式不转 Number。 */
export function filterNumberProp(
  value: unknown,
  data: PlainObject = {},
  isBig = false,
): number | string | undefined {
  if (typeof value === 'undefined') return undefined
  if (typeof value === 'number') return value
  const text = filterTpl(String(value), data)
  if (!/^[-]?\d+/.test(text)) return undefined
  return isBig ? text : +text
}

export function numberUnitOptions(raw: unknown): OptionItem[] {
  return normalizeOptions(raw)
}

export function numberUnitFromValue(value: unknown, options: OptionItem[]): string | undefined {
  if (!options.length) return undefined
  const values = options.map((item) => String(item.value ?? '')).sort((a, b) => b.length - a.length)
  if (typeof value === 'string' && value) {
    for (const unit of values) {
      if (unit && value.endsWith(unit)) return unit
    }
  }
  return String(options[0]?.value ?? '')
}

export function numberStripUnit(value: unknown, unit?: string): unknown {
  if (unit && typeof value === 'string') return value.replace(unit, '')
  return value
}

export function numberAttachUnit(value: unknown, unit?: string): unknown {
  if (value == null || value === '') return value
  if (!unit) return value
  return `${value}${unit}`
}

export function parseNumberInput(raw: string, prefix?: string, suffix?: string, kilobit?: boolean): string {
  let next = raw
  if (prefix) next = next.replace(prefix, '')
  if (suffix) next = next.replace(suffix, '')
  if (kilobit) next = next.replace(/,/g, '')
  return next
}

export function formatKilobitTyping(value: string): string {
  if (!value) return value
  const parts = value.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export function numberStepValue(
  value: unknown,
  step: number,
  direction: 1 | -1,
  precision: number,
  big?: boolean,
): NumberValue {
  const base = numberIsNumeric(value) ? (value as NumberValue) : 0
  const delta = direction < 0 ? -Math.abs(step) : Math.abs(step)
  const next = decimalAdd(base, delta)
  if (big) return roundDecimal(next, Math.max(precision, getNumberPrecision(next)))
  const rounded = roundDecimal(next, precision)
  const n = Number(rounded)
  return Number.isNaN(n) ? Number(next) : n
}

export function numberDisplayRaw(value: unknown): string {
  if (value == null || value === '') return ''
  return String(value)
}
