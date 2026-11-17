/** Form `mode: horizontal`：对齐 Amis Item.tsx / cxd `leftFixed: true`。 */

import type { PlainObject } from '../types'

export type FormHorizontal = {
  left?: number | string
  right?: number | string
  offset?: number | string
  leftFixed?: boolean | number | 'xs' | 'sm' | 'md' | 'lg'
  justify?: boolean
}

export type FormLabelAlign = 'left' | 'right'

const COLS = 12

/** Amis `getWidthRate`：`col-*-N` 抽栏数，否则当数字。 */
export function formHorizontalRate(value: unknown, strict = false): number {
  if (typeof value === 'string' && /\bcol-\w+-(\d+)\b/.test(value)) {
    return Number.parseInt(RegExp.$1, 10)
  }
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (strict) return 0
  if (typeof value === 'string' && value) return Number(value) || 0
  return (value as number) || 0
}

function asHorizontal(raw: unknown): FormHorizontal | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  return raw as FormHorizontal
}

/**
 * 项上 `horizontal` 覆盖表单。都没写时走云舍默认 `{ leftFixed: true }`（98px），
 * 不要用 Form.tsx defaultProps 的 left:2 / right:10（会被主题盖掉）。
 */
export function formHorizontalOf(item: PlainObject = {}, formHorizontal?: FormHorizontal | null): FormHorizontal {
  return asHorizontal(item.horizontal) ?? formHorizontal ?? { leftFixed: true }
}

export function formHorizontalFromSchema(schema: PlainObject): FormHorizontal {
  return asHorizontal(schema.horizontal) ?? { leftFixed: true }
}

export function formLabelAlignOf(item: PlainObject = {}, formAlign?: string): FormLabelAlign {
  const raw = item.labelAlign !== 'inherit' && item.labelAlign != null ? item.labelAlign : formAlign
  return raw === 'left' ? 'left' : 'right'
}

/** 表单项级 `labelWidth` 打在 label 上；表单级走 `--form-label-width`。 */
export function formLabelWidthCss(item: PlainObject = {}): Record<string, string> | undefined {
  const w = item.labelWidth
  if (w == null || w === '' || w === false) return undefined
  const px = typeof w === 'number' ? `${w}px` : /^\d+(\.\d+)?$/.test(String(w)) ? `${w}px` : String(w)
  return { width: px }
}

export function formHorizontalItemClass(horizontal: FormHorizontal): string {
  return horizontal.justify ? 'vamis-form-item--horizontal-justify' : ''
}

export function formHorizontalLabelClass(horizontal: FormHorizontal, align: FormLabelAlign): string {
  const parts: string[] = []
  if (horizontal.leftFixed) {
    const key = typeof horizontal.leftFixed === 'string' ? horizontal.leftFixed : 'normal'
    parts.push(`vamis-form-col--${key}`)
  } else {
    const left = formHorizontalRate(horizontal.left)
    if (left > 0) parts.push(`vamis-form-col--${left}`)
  }
  parts.push(align === 'left' ? 'vamis-form-item__label--left' : 'vamis-form-item__label--right')
  return parts.join(' ')
}

export function formHorizontalValueClass(horizontal: FormHorizontal): string {
  if (horizontal.leftFixed) return ''
  const left = formHorizontalRate(horizontal.left)
  const right = formHorizontalRate(horizontal.right)
  if (right > 0 && right !== COLS - left) return `vamis-form-col--${right}`
  return ''
}
