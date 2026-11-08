/** Options 选择器表单项契约：对齐 Amis 6.13.0 `OptionsControl`。 */

import { dataMapping } from './data-mapping'
import { resolveValue } from '../formula'
import { getPathValue } from './path-value'
import { SELECT_POPUP_HEIGHT } from './overlay-layer'
import type { PlainObject, SchemaApi, SchemaObject } from '../types'

export interface OptionItem {
  label: string
  value: unknown
  disabled?: boolean
  children?: OptionItem[]
  defer?: boolean
  [key: string]: unknown
}

export interface OptionsValueConfig {
  multiple?: boolean
  joinValues?: boolean
  extractValue?: boolean
  delimiter?: string
  labelField?: string
  valueField?: string
  clearable?: boolean
  resetValue?: unknown
}

export interface OptionsControlConfig extends OptionsValueConfig {
  searchable?: boolean
  checkAll?: boolean
  checkAllBySearch?: boolean
  defaultCheckAll?: boolean
  selectFirst?: boolean
  creatable?: boolean
  editable?: boolean
  removable?: boolean
  valuesNoWrap?: boolean
  createBtnLabel?: string
  optionLabel?: string
  clearValueOnSourceChange?: boolean
  initAutoFill?: boolean | 'fillIfNotSet'
}

function isPlainObject(value: unknown): value is PlainObject {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function optionsLabelField(schema: PlainObject = {}): string {
  return schema.labelField != null && String(schema.labelField) ? String(schema.labelField) : 'label'
}

export function optionsValueField(schema: PlainObject = {}): string {
  return schema.valueField != null && String(schema.valueField) ? String(schema.valueField) : 'value'
}

export function optionsDelimiter(schema: PlainObject = {}): string {
  return schema.delimiter != null && schema.delimiter !== '' ? String(schema.delimiter) : ','
}

export function optionsJoinValues(schema: PlainObject = {}): boolean {
  return schema.joinValues !== false
}

export function optionsExtractValue(schema: PlainObject = {}): boolean {
  return schema.extractValue === true
}

export function optionsMultiple(schema: PlainObject = {}): boolean {
  return schema.multiple === true || schema.type === 'multi-select'
}

export function optionsResetValue(schema: PlainObject = {}): unknown {
  return schema.resetValue !== undefined ? schema.resetValue : ''
}

export function optionsValueConfig(schema: PlainObject = {}): OptionsValueConfig {
  return {
    multiple: optionsMultiple(schema),
    joinValues: optionsJoinValues(schema),
    extractValue: optionsExtractValue(schema),
    delimiter: optionsDelimiter(schema),
    labelField: optionsLabelField(schema),
    valueField: optionsValueField(schema),
    clearable: schema.clearable === true,
    resetValue: optionsResetValue(schema),
  }
}

export function optionsControlConfig(schema: PlainObject = {}): OptionsControlConfig {
  return {
    ...optionsValueConfig(schema),
    searchable: schema.searchable === true,
    checkAll: schema.checkAll === true,
    checkAllBySearch: schema.checkAllBySearch !== false,
    defaultCheckAll: schema.defaultCheckAll === true,
    selectFirst: schema.selectFirst === true,
    creatable: schema.creatable === false ? false : schema.creatable === true || schema.addApi != null,
    editable: schema.editable === false ? false : schema.editable === true || schema.editApi != null,
    removable: schema.removable === false ? false : schema.removable === true || schema.deleteApi != null,
    valuesNoWrap: schema.valuesNoWrap === true,
    createBtnLabel: schema.createBtnLabel != null ? String(schema.createBtnLabel) : undefined,
    optionLabel: schema.optionLabel != null ? String(schema.optionLabel) : undefined,
    clearValueOnSourceChange: schema.clearValueOnSourceChange === true,
    initAutoFill: schema.initAutoFill as boolean | 'fillIfNotSet' | undefined,
  }
}

export function optionsKindLabel(schema: PlainObject = {}): string {
  return schema.optionLabel != null && String(schema.optionLabel) ? String(schema.optionLabel) : '选项'
}

export function optionsCreateBtnLabel(schema: PlainObject = {}): string {
  if (schema.createBtnLabel != null && String(schema.createBtnLabel)) return String(schema.createBtnLabel)
  return `新增${optionsKindLabel(schema)}`
}

export function optionsEditDialogTitle(schema: PlainObject = {}): string {
  return `编辑${optionsKindLabel(schema)}`
}

/** 在选项树里按 value 合并一项，对齐 Amis `spliceTree` 编辑。 */
export function updateOptionInTree(
  list: OptionItem[],
  origin: OptionItem,
  patch: PlainObject,
  valueField = 'value',
): OptionItem[] {
  return list.map((item) => {
    if (item === origin || matchOptionValue(origin.value, item, valueField)) {
      const next = { ...item, ...patch } as OptionItem
      const label = next.label != null && String(next.label) !== '' ? String(next.label) : item.label
      const value = next[valueField] !== undefined ? next[valueField] : next.value
      return { ...next, label, value, [valueField]: value }
    }
    if (item.children?.length) {
      return { ...item, children: updateOptionInTree(item.children, origin, patch, valueField) }
    }
    return item
  })
}

/** 从选项树里按 value 去掉一项，对齐 Amis `spliceTree` 删除。 */
export function removeOptionFromTree(
  list: OptionItem[],
  origin: OptionItem,
  valueField = 'value',
): OptionItem[] {
  const out: OptionItem[] = []
  for (const item of list) {
    if (item === origin || matchOptionValue(origin.value, item, valueField)) continue
    const next = { ...item }
    if (item.children?.length) next.children = removeOptionFromTree(item.children, origin, valueField)
    out.push(next)
  }
  return out
}

export function getOptionValue(value: unknown, valueField = 'value'): unknown {
  if (isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, valueField)) {
    return value[valueField]
  }
  return value
}

export function matchOptionValue(a: unknown, option: OptionItem, valueField = 'value'): boolean {
  const aValue = getOptionValue(a, valueField)
  const bValue = option[valueField] !== undefined ? option[valueField] : option.value
  if (isPlainObject(aValue) && isPlainObject(bValue)) {
    try {
      return JSON.stringify(aValue) === JSON.stringify(bValue)
    } catch {
      return false
    }
  }
  return aValue !== undefined && bValue !== undefined && String(bValue) === String(aValue)
}

export function optionValuesEqual(a: unknown, b: unknown, valueField = 'value'): boolean {
  const left = getOptionValue(a, valueField)
  const right = getOptionValue(b, valueField)
  if (isPlainObject(left) && isPlainObject(right)) {
    try {
      return JSON.stringify(left) === JSON.stringify(right)
    } catch {
      return false
    }
  }
  return String(left ?? '') === String(right ?? '')
}

function readLabel(node: PlainObject, labelField: string): string {
  const raw = node[labelField]
  if (raw != null && raw !== '') return String(raw)
  if (labelField !== 'label') return ''
  if (node.label != null && node.label !== '') return String(node.label)
  return ''
}

function readValue(node: PlainObject, valueField: string, label: string): unknown {
  if (Object.prototype.hasOwnProperty.call(node, valueField) && node[valueField] !== undefined) {
    return node[valueField]
  }
  if (valueField !== 'value' && node.value !== undefined) return node.value
  if (node.id !== undefined) return node.id
  if (label !== '') return label
  return ''
}

function asOptionItem(item: unknown, labelField: string, valueField: string): OptionItem {
  if (item == null) return { label: '', value: '' }
  if (typeof item !== 'object') {
    return { label: String(item), value: item, [valueField]: item }
  }
  const node = item as PlainObject
  const label = readLabel(node, labelField)
  const value = readValue(node, valueField, label)
  const children = Array.isArray(node.children)
    ? normalizeOptions(node.children, labelField, valueField)
    : undefined
  const option: OptionItem = {
    ...node,
    label,
    value,
    [valueField]: value,
  }
  if (node.disabled) option.disabled = true
  if (node.defer) option.defer = true
  if (children) option.children = children
  return option
}

/** 对齐 Amis `normalizeOptions`：字符串 / 数字数组 / 对象数组 / 字典；可按 labelField/valueField 映射。 */
export function normalizeOptions(
  raw: unknown,
  labelField = 'label',
  valueField = 'value',
): OptionItem[] {
  if (raw == null || raw === '') return []
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => ({ label: item, value: item, [valueField]: item }))
  }
  if (Array.isArray(raw)) {
    return raw.filter((item) => item != null).map((item) => asOptionItem(item, labelField, valueField))
  }
  if (isPlainObject(raw)) {
    return Object.keys(raw).map((key) => ({
      label: String(raw[key] ?? ''),
      value: key,
      [valueField]: key,
    }))
  }
  return []
}

export function flattenOptions(options: OptionItem[], prefix = ''): OptionItem[] {
  const out: OptionItem[] = []
  for (const item of options) {
    const label = `${prefix}${item.label}`
    if (item.children?.length) {
      out.push(...flattenOptions(item.children, `${label} / `))
    } else {
      out.push({ ...item, label })
    }
  }
  return out
}

export function walkOptions(options: OptionItem[]): OptionItem[] {
  const out: OptionItem[] = []
  for (const item of options) {
    out.push(item)
    if (item.children?.length) out.push(...walkOptions(item.children))
  }
  return out
}

export function findOption(
  options: OptionItem[],
  value: unknown,
  valueField = 'value',
): OptionItem | undefined {
  for (const item of options) {
    if (matchOptionValue(value, item, valueField)) return item
    if (item.children?.length) {
      const hit = findOption(item.children, value, valueField)
      if (hit) return hit
    }
  }
  return undefined
}

export function isOptionsEmpty(value: unknown): boolean {
  if (value == null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function parseJoined(
  value: unknown,
  multiple: boolean,
  joinValues = true,
  delimiter = ',',
): unknown[] {
  if (value == null || value === '') return []
  if (Array.isArray(value)) return value
  if (multiple && joinValues && typeof value === 'string') {
    return value.split(delimiter).map((item) => item.trim()).filter((item) => item !== '')
  }
  return [value]
}

export function dumpJoined(
  values: unknown[],
  multiple: boolean,
  joinValues = true,
  delimiter = ',',
): unknown {
  if (!multiple) return values[0] ?? ''
  return joinValues ? values.map((item) => String(item)).join(delimiter) : values
}

export function parseOptionsValue(value: unknown, config: OptionsValueConfig = {}): unknown[] {
  const multiple = !!config.multiple
  const joinValues = config.joinValues !== false
  const delimiter = config.delimiter || ','
  return parseJoined(value, multiple, joinValues, delimiter)
}

function optionFromRaw(raw: unknown, options: OptionItem[], valueField: string): OptionItem {
  if (isPlainObject(raw)) {
    const key = raw[valueField] ?? raw.value
    const hit = key !== undefined ? findOption(options, key, valueField) : undefined
    if (hit) return hit
    const label = raw.label != null ? String(raw.label) : String(key ?? '')
    return { ...raw, label, value: key ?? raw.label ?? '' }
  }
  const hit = findOption(options, raw, valueField)
  return hit || { label: String(raw ?? ''), value: raw }
}

export function getSelectedOptions(
  value: unknown,
  options: OptionItem[],
  config: OptionsValueConfig = {},
): OptionItem[] {
  const valueField = config.valueField || 'value'
  return parseOptionsValue(value, config).map((item) => optionFromRaw(item, options, valueField))
}

export function dumpOptionsValue(selected: OptionItem[], config: OptionsValueConfig = {}): unknown {
  const multiple = !!config.multiple
  const joinValues = config.joinValues !== false
  const extractValue = config.extractValue === true
  const delimiter = config.delimiter || ','
  const resetValue = config.resetValue !== undefined ? config.resetValue : ''
  if (!multiple) {
    const item = selected[0]
    if (!item) return resetValue
    if (joinValues || extractValue) return item.value
    return item
  }
  if (joinValues) {
    return selected
      .map((item) => item.value)
      .filter((item) => item != null)
      .map((item) => String(item))
      .join(delimiter)
  }
  if (extractValue) return selected.map((item) => item.value)
  return selected.slice()
}

export function toggleOption(
  option: OptionItem,
  selected: OptionItem[],
  config: OptionsValueConfig = {},
): OptionItem[] {
  const valueField = config.valueField || 'value'
  const idx = selected.findIndex((item) => matchOptionValue(option.value, item, valueField))
  if (config.multiple) {
    if (idx >= 0) return selected.filter((_, i) => i !== idx)
    return [...selected, option]
  }
  if (idx >= 0 && config.clearable) return []
  return [option]
}

export function selectableOptions(options: OptionItem[]): OptionItem[] {
  return walkOptions(options).filter((item) => !item.disabled && item.value != null && item.value !== '')
}

export function isAllSelected(selected: OptionItem[], options: OptionItem[], valueField = 'value'): boolean {
  const pool = selectableOptions(options)
  if (!pool.length) return false
  return pool.every((item) => selected.some((cur) => matchOptionValue(item.value, cur, valueField)))
}

export function toggleAllOptions(selected: OptionItem[], options: OptionItem[], valueField = 'value'): OptionItem[] {
  return isAllSelected(selected, options, valueField) ? [] : selectableOptions(options)
}

export function firstEnabledOption(options: OptionItem[]): OptionItem | undefined {
  return selectableOptions(options)[0]
}

function optionMatchesKeyword(item: OptionItem, q: string): boolean {
  return String(item.label).toLowerCase().includes(q) || String(item.value ?? '').toLowerCase().includes(q)
}

export function filterOptions(options: OptionItem[], keyword: string): OptionItem[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return options
  return flattenOptions(options).filter((item) => optionMatchesKeyword(item, q))
}

export function isGroupOption(item: OptionItem): boolean {
  return Array.isArray(item.children)
}

/** 检索时保留分组树，不要把 children 拍扁。组名命中时仍展示全部子项，避免组头变成可选项。 */
export function filterOptionTree(options: OptionItem[], keyword: string): OptionItem[] {
  const q = keyword.trim().toLowerCase()
  if (!q) return options
  const out: OptionItem[] = []
  for (const item of options) {
    if (isGroupOption(item)) {
      const children = filterOptionTree(item.children || [], keyword)
      if (children.length) out.push({ ...item, children })
      else if (optionMatchesKeyword(item, q)) out.push({ ...item, children: item.children || [] })
    } else if (optionMatchesKeyword(item, q)) {
      out.push(item)
    }
  }
  return out
}

/** Amis `filterOption` 字符串函数体，参数 options / inputValue / option。只在 trusted 编译。 */
export function runSelectFilterOption(
  options: OptionItem[],
  inputValue: string,
  filterOption: unknown,
  trusted: boolean,
): OptionItem[] | null {
  if (typeof filterOption !== 'string' || !filterOption.trim() || !trusted) return null
  try {
    const fn = new Function('options', 'inputValue', 'option', filterOption) as (
      list: OptionItem[],
      q: string,
      meta: { keys: string[] },
    ) => unknown
    const out = fn(options, inputValue, { keys: ['label', 'value'] })
    return Array.isArray(out) ? (out as OptionItem[]) : null
  } catch {
    return null
  }
}

export function omitSelectedOptions(
  options: OptionItem[],
  selected: OptionItem[],
  valueField = 'value',
): OptionItem[] {
  const out: OptionItem[] = []
  for (const item of options) {
    if (item.children?.length) {
      const children = omitSelectedOptions(item.children, selected, valueField)
      if (children.length) out.push({ ...item, children })
    } else if (!selected.some((cur) => matchOptionValue(item.value, cur, valueField))) {
      out.push(item)
    }
  }
  return out
}

export function splitOverflowTags<T>(items: T[], maxTagCount?: number): { visible: T[]; rest: T[] } {
  if (!Number.isFinite(maxTagCount as number) || (maxTagCount as number) <= 0 || items.length <= (maxTagCount as number)) {
    return { visible: items, rest: [] }
  }
  const cap = maxTagCount as number
  return { visible: items.slice(0, cap), rest: items.slice(cap) }
}

/** 对齐 Amis `AutoFoldedList`：按容器宽度决定可见标签数，不够再收成 +N。 */
export function countVisibleTagsByWidth(opts: {
  containerWidth: number
  itemWidths: number[]
  moreWidth: number
  gap?: number
  chipGap?: number
  maxVisibleCount?: number
}): number {
  const { containerWidth, itemWidths, moreWidth, maxVisibleCount } = opts
  const gap = opts.gap ?? 10
  const chipGap = opts.chipGap ?? 4
  const n = itemWidths.length
  if (n === 0) return 0
  if (!(containerWidth > 0)) return n
  const cap =
    Number.isFinite(maxVisibleCount as number) && (maxVisibleCount as number) > 0
      ? Math.min(maxVisibleCount as number, n)
      : n
  const moreReserve = Math.max(moreWidth, 30) + gap
  if (cap >= n) {
    let total = 0
    for (let i = 0; i < n; i++) total += itemWidths[i] + (i ? chipGap : 0)
    if (total <= containerWidth) return n
  }
  let used = 0
  let count = 0
  for (let i = 0; i < cap; i++) {
    const next = used + (count ? chipGap : 0) + itemWidths[i]
    if (next + moreReserve > containerWidth) break
    used = next
    count++
  }
  return count
}

export type SelectOverlay = {
  width?: string | number
  align?: 'left' | 'center' | 'right'
  /** 移动端底栏高度。Amis 是 CSS `.Select-popup { height: 320px }`，schema 未列；Vamis 可写 px。 */
  height?: string | number
}

/** 对齐 Amis `PopOverContainer.calcOverlayWidth`。 */
export function calcSelectOverlayWidth(overlay: unknown, targetWidth: number): number | string | undefined {
  if (!overlay || typeof overlay !== 'object' || !(targetWidth > 0)) return
  const width = (overlay as SelectOverlay).width
  if (width == null || width === '') return
  if (typeof width === 'number' || /^\d+$/.test(String(width))) return Number(width)
  const raw = String(width)
  if (/^\d+%$/.test(raw)) return (targetWidth * Number.parseFloat(raw)) / 100
  if (/^\d+(px|rem|em|vw)$/.test(raw)) return raw
  if (/^[+-]\d+(px|%|rem|em|vw)$/.test(raw)) {
    return raw.replace(/^([+-])(.*)$/, `calc(${targetWidth}px $1 $2)`)
  }
}

/**
 * 移动端 Select PopUp 高度：`overlay.height` 覆盖。
 * 默认：普通 Select / 滚轮 320（`.Select-popup`）；分组 Transfer 传 400（`.PopUp`，对照 800 看起来像半屏，不是 50vh）。
 */
export function selectPopupHeight(overlay: unknown, fallback = SELECT_POPUP_HEIGHT): number {
  if (overlay && typeof overlay === 'object' && overlay !== null && 'height' in overlay) {
    const raw = (overlay as SelectOverlay).height
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw
    if (typeof raw === 'string' && raw.trim()) {
      const n = Number.parseFloat(raw)
      if (Number.isFinite(n) && n > 0) return n
    }
  }
  return fallback
}

/** 对齐 Amis `alignToPlacement`。 */
export function selectOverlayPlacement(overlay: unknown): string {
  const align = overlay && typeof overlay === 'object' ? (overlay as SelectOverlay).align : undefined
  if (align === 'right') return 'right-bottom-right-top'
  if (align === 'center') return 'center-bottom-center-top'
  if (align === 'left') return 'left-bottom-left-top'
  return 'auto'
}

/** `${items}` / `$items` 这类数据域变量，不是接口 url。 */
export function isOptionsVariableSource(source: unknown): source is string {
  if (typeof source !== 'string' || !source) return false
  if (source.includes('/') || /^[a-z][a-z0-9+.-]*:/i.test(source)) return false
  return source.includes('$')
}

export function resolveOptionsSource(source: unknown, data: PlainObject = {}): unknown {
  if (typeof source !== 'string') return undefined
  return resolveValue(source, data)
}

export function optionsFromPayload(data: unknown): { list: unknown; value?: unknown } {
  if (Array.isArray(data)) return { list: data }
  if (!isPlainObject(data)) return { list: [] }
  if (Array.isArray(data.options)) return { list: data.options, value: data.value }
  if (Array.isArray(data.items)) return { list: data.items, value: data.value }
  return { list: [], value: data.value }
}

export function optionsFillData(
  selected: OptionItem[],
  multiple: boolean,
  data: PlainObject = {},
): PlainObject {
  if (multiple) return { ...data, items: selected }
  const item = selected[0]
  if (!item) return { ...data, items: selected }
  return { ...data, ...item, items: selected }
}

export function isOptionsControlSchema(schema: SchemaObject): boolean {
  return !!(schema.options || schema.source || schema.autoComplete || schema.multiple || schema.joinValues === false)
}

/** 选项 autoFill 的映射上下文：单选展开当前项，多选走 `items`。 */
export function optionsAutoFillContext(
  schema: SchemaObject,
  value: unknown,
  data: PlainObject = {},
  options: OptionItem[] = [],
): PlainObject | null {
  if (!isOptionsControlSchema(schema) && !options.length) return null
  const config = optionsValueConfig(schema)
  const list = options.length ? options : normalizeOptions(schema.options, config.labelField, config.valueField)
  const selected = getSelectedOptions(value, list, config)
  return optionsFillData(selected, !!config.multiple, data)
}

export function applyOptionsAutoFill(
  mapping: PlainObject,
  selected: OptionItem[],
  multiple: boolean,
  data: PlainObject = {},
  initAutoFill: boolean | 'fillIfNotSet' = 'fillIfNotSet',
): PlainObject {
  const ctx = optionsFillData(selected, multiple, data)
  const out: PlainObject = {}
  for (const [key, expr] of Object.entries(mapping)) {
    if (!key || key.startsWith('__')) continue
    if (initAutoFill === false) continue
    if (initAutoFill === 'fillIfNotSet' || initAutoFill == null) {
      const current = getPathValue(data, key)
      if (current !== undefined) continue
    }
    const next =
      typeof expr === 'string' ? resolveValue(expr, ctx) : dataMapping(expr, ctx)
    if (next === undefined) continue
    out[key] = next
  }
  return out
}

export function optionsClearValue(schema: PlainObject = {}): unknown {
  return optionsResetValue(schema)
}

export function optionsSetDataValue(
  values: Record<string, unknown> | undefined,
  name?: string,
): unknown | undefined {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return undefined
  if (Object.prototype.hasOwnProperty.call(values, 'value')) return values.value
  if (name && Object.prototype.hasOwnProperty.call(values, name)) return values[name]
  return undefined
}

export function isOptionsAutoComplete(schema: PlainObject): boolean {
  const raw = schema.autoComplete
  return !!raw && raw !== false
}

export type OptionsSource = SchemaApi | string | false | null | undefined
