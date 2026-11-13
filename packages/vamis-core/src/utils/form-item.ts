/** FormItem 通用契约：必填表达式、默认值、隐藏清值、改值校验。 */

import { evalExpression, filterTpl, isVisible, resolveValue } from '../formula'
import type { Payload, SchemaApi, SchemaObject } from '../types'
import type { PlainObject } from '../types'
import { dataMapping } from './data-mapping'
import {
  getSelectedOptions,
  normalizeOptions,
  optionsLabelField,
  optionsMultiple,
  optionsValueConfig,
  optionsValueField,
} from './options'
import { deletePathValue, getPathValue, setPathValue } from './path-value'

/** Amis StaticHoc：这些 type 静态展示走 `type: tags`（WordsField + inTag）。 */
export const FORM_ITEM_STATIC_TAGS_TYPES = new Set(['input-tag'])

/** Amis StaticHoc：这些 type 静态展示走 `type: words`。 */
export const FORM_ITEM_STATIC_WORDS_TYPES = new Set([
  'select',
  'checkboxes',
  'button-group-select',
  'input-tree',
  'tree-select',
  'nested-select',
  'cascader-select',
  'radios',
  'multi-select',
  'transfer',
  'transfer-picker',
  'tabs-transfer',
  'tabs-transfer-picker',
  'picker',
])

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

/**
 * 静态展示。动作覆盖（`statusStore`）最高；否则 `static: true` 钉死；
 * `static: false` 为输入态；`staticOn`；再跟随表单级。
 */
export function formItemStatic(
  schema: SchemaObject,
  data: PlainObject = {},
  formStatic = false,
  override?: boolean,
): boolean {
  if (typeof override === 'boolean') return override
  if (schema.static === false) return false
  if (schema.static === true) return true
  if (typeof schema.staticOn === 'string' && schema.staticOn) {
    return evalExpression(schema.staticOn, data)
  }
  return formStatic
}

export function formItemSubmitOnChange(item: SchemaObject, form: SchemaObject): boolean {
  if (item.submitOnChange === true) return true
  if (item.submitOnChange === false) return false
  return form.submitOnChange === true
}

/**
 * 水平表单里标签列：只有 `label: false` 才去掉。
 * 未写 label / 空字符串仍占位，对齐 Amis `label !== false`。
 */
export function formItemHideLabel(schema: SchemaObject): boolean {
  return schema.label === false
}

/**
 * Amis `render('description')`：字符串走 Tpl innerHTML（含 `text-danger` 这类 helper），
 * 不要当纯文本插值。对象 / 数组当 SchemaNode。
 */
export function formItemDescriptionHtml(schema: SchemaObject, data: PlainObject = {}): string {
  const raw = schema.description ?? schema.desc
  if (typeof raw !== 'string' || raw === '') return ''
  return filterTpl(raw, data)
}

export function formItemDescriptionNode(schema: SchemaObject): SchemaObject | null {
  const raw = schema.description ?? schema.desc
  if (raw == null || typeof raw !== 'object') return null
  if (Array.isArray(raw)) return { type: 'wrapper', body: raw }
  const rec = raw as SchemaObject
  if (rec.type) return rec
  if (typeof rec.tpl === 'string' || typeof rec.html === 'string') {
    return { type: 'tpl', ...rec }
  }
  return rec
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

function formItemStaticSelectorKind(type: string): 'tags' | 'words' | null {
  if (FORM_ITEM_STATIC_TAGS_TYPES.has(type)) return 'tags'
  if (FORM_ITEM_STATIC_WORDS_TYPES.has(type)) return 'words'
  return null
}

function formItemStaticSelectorMultiple(schema: SchemaObject): boolean {
  const type = String(schema.type ?? '')
  if (type === 'input-tag' || type === 'checkboxes' || type === 'multi-select') return true
  if (
    type === 'transfer' ||
    type === 'transfer-picker' ||
    type === 'tabs-transfer' ||
    type === 'tabs-transfer-picker'
  ) {
    return true
  }
  if (type === 'picker') return schema.multiple !== false
  return optionsMultiple(schema)
}

/** 选择器静态展示用的词条（优先 option.label）。 */
export function formItemStaticWords(schema: SchemaObject, value: unknown): string[] {
  const labelField = optionsLabelField(schema)
  const valueField = optionsValueField(schema)
  const options = normalizeOptions(schema.options, labelField, valueField)
  const selected = getSelectedOptions(value, options, {
    ...optionsValueConfig(schema),
    multiple: formItemStaticSelectorMultiple(schema),
  })
  return selected
    .map((item) => String(item[labelField] ?? item.label ?? item.value ?? ''))
    .filter((item) => item !== '')
}

/**
 * `{ limit }` 这类无 type 的 staticSchema 不是自定义节点。
 * 对齐 Amis StaticHoc：input-tag → tags，select 家族 → words，limit 当展示条数。
 */
export function formItemStaticSelectorNode(schema: SchemaObject, value: unknown): SchemaObject | null {
  const kind = formItemStaticSelectorKind(String(schema.type ?? ''))
  if (!kind) return null
  const words = formItemStaticWords(schema, value)
  if (!words.length) return null
  const node: SchemaObject = { type: kind, words }
  const extra = schema.staticSchema
  if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
    const rec = extra as SchemaObject
    if (!rec.type) {
      Object.assign(node, rec)
      node.type = kind
      node.words = words
    }
  }
  return node
}

export function formItemValidateOnChange(item: SchemaObject, form: SchemaObject): boolean {
  if (item.validateOnChange === true) return true
  if (item.validateOnChange === false) return false
  return form.validateOnChange === true
}

function nestedFormNodes(item: SchemaObject): unknown[] {
  // Each 的 items 是循环体，要等渲染时按成员 clone；不要把 `text${index}` 收成一个字段。
  if (String(item.type || '').toLowerCase() === 'each') return []
  const out: unknown[] = []
  for (const key of ['body', 'controls', 'columns', 'items'] as const) {
    const raw = item[key]
    if (raw == null) continue
    out.push(...(Array.isArray(raw) ? raw : [raw]))
  }
  return out
}

export function collectFormItems(nodes: unknown[]): SchemaObject[] {
  const out: SchemaObject[] = []
  for (const node of nodes) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) continue
    const item = node as SchemaObject
    if (item.name) out.push(item)
    const nested = nestedFormNodes(item)
    if (nested.length) out.push(...collectFormItems(nested))
  }
  return out
}

/** Amis：value 表达式优先；否则已有 name 映射；再否则用普通 value 当默认。lookup 给表达式读父域，写入仍只打 data。 */
export function applyFormItemDefaults(
  items: SchemaObject[],
  data: PlainObject,
  lookup: PlainObject = data,
): PlainObject {
  for (const item of items) {
    const name = String(item.name || '')
    if (!name) continue
    const raw = item.value
    if (isFormValueExpr(raw)) {
      setPathValue(data, name, resolveValue(raw, lookup))
    } else if (getPathValue(data, name) === undefined && raw != null && raw !== '') {
      setPathValue(data, name, raw)
    }
  }
  return data
}

function asOwnObject(value: unknown): PlainObject {
  if (value && typeof value === 'object' && !Array.isArray(value)) return { ...(value as PlainObject) }
  return {}
}

/**
 * Amis FormStore：本域 = schema.data（经 dataMapping）+ 表单项默认值。
 * 父域不摊进 store（debug / persist / 提交只见本域）。
 * `canAccessSuperData` 默认 true：只把**同名**表单项从父域拷进来；Each 的 `${arr}` 仍走 SchemaRenderer 父域 overlay。
 */
export function initFormStoreData(
  items: SchemaObject[],
  parentData: PlainObject = {},
  schemaData?: unknown,
  canAccessSuperData = true,
): PlainObject {
  const own = asOwnObject(dataMapping(schemaData || {}, parentData))
  if (canAccessSuperData) {
    for (const item of items) {
      const name = String(item.name || '')
      if (!name) continue
      if (getPathValue(own, name) !== undefined) continue
      const fromParent = getPathValue(parentData, name)
      if (fromParent !== undefined) setPathValue(own, name, fromParent)
    }
  }
  const lookup = canAccessSuperData ? { ...parentData, ...own } : own
  return applyFormItemDefaults(items, own, lookup)
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
