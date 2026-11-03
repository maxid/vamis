/** FormItem 通用契约：必填表达式、默认值、隐藏清值、改值校验。 */

import { evalExpression, isVisible, resolveValue } from '../formula'
import type { Payload, SchemaApi, SchemaObject } from '../types'
import type { PlainObject } from '../types'
import { deletePathValue, getPathValue, setPathValue } from './path-value'

export function isFormValueExpr(value: unknown): boolean {
  return typeof value === 'string' && value.includes('${') && !value.startsWith('\\${')
}

export function formItemRequired(schema: SchemaObject, data: PlainObject = {}): boolean {
  if (schema.required === true) return true
  if (typeof schema.requiredOn === 'string' && schema.requiredOn) {
    return evalExpression(schema.requiredOn, data)
  }
  return false
}

/** Amis：`static` / `staticOn` 优先于表单级静态。 */
export function formItemStatic(
  schema: SchemaObject,
  data: PlainObject = {},
  formStatic = false,
): boolean {
  if (schema.static === false) return false
  if (schema.static === true) return true
  if (typeof schema.staticOn === 'string' && schema.staticOn) {
    return evalExpression(schema.staticOn, data)
  }
  return formStatic
}

/** 有 type / 数组 / 字符串才当自定义静态 schema；`{ limit }` 留给选择器自己读。 */
export function formItemStaticSchema(schema: SchemaObject): SchemaObject[] | null {
  const raw = schema.staticSchema
  if (raw == null) return null
  const wrap = (item: unknown): SchemaObject => {
    if (typeof item === 'string' || typeof item === 'number') {
      return { type: 'tpl', tpl: String(item), inline: true }
    }
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const rec = item as SchemaObject
      return rec.type ? rec : { type: 'tpl', tpl: String(rec.tpl ?? ''), inline: true }
    }
    return { type: 'tpl', tpl: String(item ?? ''), inline: true }
  }
  if (typeof raw === 'string' || typeof raw === 'number') return [wrap(raw)]
  if (Array.isArray(raw)) return raw.map(wrap)
  if (typeof raw === 'object' && (raw as SchemaObject).type) return [raw as SchemaObject]
  return null
}

export function formItemValidateOnChange(item: SchemaObject, form: SchemaObject): boolean {
  if (item.validateOnChange === true) return true
  if (item.validateOnChange === false) return false
  return form.validateOnChange === true
}

export function collectFormItems(nodes: unknown[]): SchemaObject[] {
  const out: SchemaObject[] = []
  for (const node of nodes) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) continue
    const item = node as SchemaObject
    if (item.name) out.push(item)
    const nested = item.body ?? item.controls
    if (nested) out.push(...collectFormItems(Array.isArray(nested) ? nested : [nested]))
  }
  return out
}

/** Amis：value 表达式优先；否则已有 name 映射；再否则用普通 value 当默认。 */
export function applyFormItemDefaults(items: SchemaObject[], data: PlainObject): PlainObject {
  for (const item of items) {
    const name = String(item.name || '')
    if (!name) continue
    const raw = item.value
    if (isFormValueExpr(raw)) {
      setPathValue(data, name, resolveValue(raw, data))
    } else if (getPathValue(data, name) === undefined && raw != null && raw !== '') {
      setPathValue(data, name, raw)
    }
  }
  return data
}

export function hiddenFieldsToClear(items: SchemaObject[], data: PlainObject): string[] {
  const names: string[] = []
  for (const item of items) {
    if (!item.clearValueOnHidden || !item.name) continue
    if (isVisible(item, data)) continue
    if (getPathValue(data, String(item.name)) === undefined) continue
    names.push(String(item.name))
  }
  return names
}

export function clearHiddenFormValues(items: SchemaObject[], data: PlainObject): string[] {
  const names = hiddenFieldsToClear(items, data)
  for (const name of names) deletePathValue(data, name)
  return names
}

function errorText(value: unknown): string {
  if (Array.isArray(value)) return value.filter(Boolean).map(String).join('；')
  if (value == null) return ''
  return String(value)
}

/** 提交接口 `errors: { name: msg }` 写到表单项。字符串 errors 不当字段错误。 */
export function applyServerErrors(errors: unknown, target: PlainObject): boolean {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return false
  let applied = false
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    const msg = errorText(value)
    if (!key || !msg) continue
    target[key] = msg
    applied = true
  }
  return applied
}

export function validateApiMessage(payload: Payload | undefined, fallback: string): string {
  const errors = payload?.errors
  if (typeof errors === 'string' && errors) return errors
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const first = errorText(Object.values(errors as Record<string, unknown>)[0])
    if (first) return first
  }
  return payload?.msg || fallback
}

/** Amis：rows/items 只有一项才当填充结果，否则退回 data 对象。 */
export function autoFillRow(data: unknown): PlainObject | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const rec = data as PlainObject
  const list = rec.items || rec.rows
  if (Array.isArray(list)) {
    if (list.length === 1 && list[0] && typeof list[0] === 'object' && !Array.isArray(list[0])) {
      return list[0] as PlainObject
    }
    return null
  }
  return rec
}

export function autoFillApi(schema: SchemaObject): SchemaApi | undefined {
  const raw = schema.autoFill
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const api = (raw as PlainObject).api
  return api == null ? undefined : (api as SchemaApi)
}

/** `showSuggestion` 是参照录入弹层，不在本轮。有 api 用 fillMapping，否则整份当映射。 */
export function autoFillMapping(schema: SchemaObject): PlainObject | null {
  const raw = schema.autoFill
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const rec = raw as PlainObject
  if (rec.showSuggestion === true) return null
  if ('fillMapping' in rec) {
    return rec.fillMapping && typeof rec.fillMapping === 'object' && !Array.isArray(rec.fillMapping)
      ? (rec.fillMapping as PlainObject)
      : { '&': '$$' }
  }
  if ('api' in rec) return { '&': '$$' }
  return rec
}
