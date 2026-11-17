/** Checkbox 真假值：对齐 Amis `value == trueValue`（宽松相等）。 */

import type { PlainObject } from '../types'

export function checkboxTrueValue(schema: PlainObject): unknown {
  return schema.trueValue ?? true
}

export function checkboxFalseValue(schema: PlainObject): unknown {
  return schema.falseValue ?? false
}

/** `checked` 强制展示；否则 `value == trueValue`。 */
export function checkboxIsChecked(value: unknown, schema: PlainObject): boolean {
  if (schema.checked !== undefined) return !!schema.checked
  return value == checkboxTrueValue(schema)
}

export function checkboxWriteValue(checked: boolean, schema: PlainObject): unknown {
  return checked ? checkboxTrueValue(schema) : checkboxFalseValue(schema)
}

/** Amis `doAction('clear')` 写成空串，不是 falseValue。 */
export function checkboxClearValue(): unknown {
  return ''
}

/** 源码：pristine ?? resetValue ?? ''。 */
export function checkboxResetValue(schema: PlainObject, pristine: unknown): unknown {
  if (pristine !== undefined) return pristine
  if (schema.resetValue !== undefined) return schema.resetValue
  return ''
}

/** setValue 经 componentId 落到 `{ value }` 或按 name 取值。 */
export function checkboxSetDataValue(
  values: Record<string, unknown> | undefined,
  name?: string,
): unknown | undefined {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return undefined
  if (Object.prototype.hasOwnProperty.call(values, 'value')) return values.value
  if (name && Object.prototype.hasOwnProperty.call(values, name)) return values[name]
  return undefined
}
