import type { RendererSchema, SchemaFieldInput } from './types'
import { SCHEMA_TYPE_DOCS, type SchemaDoc } from './schema-type-docs'
import { TYPE_CATALOGS, type TypeCatalog } from './schema-type-catalogs'

export type { TypeCatalog }
export { TYPE_CATALOGS }

function doc(title: string, category: string, description: string, detail?: string): SchemaDoc {
  return { title, category, description, detail }
}

export type SchemaFieldKind = 'prop' | 'event' | 'action'

export const TYPE_ALIASES: Record<string, string> = {
  button: 'action',
  submit: 'action',
  reset: 'action',
  html: 'tpl',
  'json-editor': 'editor',
  'yaml-editor': 'editor',
  'js-editor': 'editor',
  'ts-editor': 'editor',
  'json-schema-editor': 'json-schema',
  'input-datetime': 'input-date',
  'input-time': 'input-date',
  'input-datetime-range': 'input-date-range',
  'input-password': 'input-text',
  'tabs-transfer-picker': 'tabs-transfer',
}

export const FORM_ITEM_TYPES = new Set([
  'checkbox',
  'checkboxes',
  'combo',
  'chained-select',
  'editor',
  'diff-editor',
  'fieldset',
  'formula',
  'group',
  'hidden',
  'input-array',
  'input-city',
  'input-color',
  'input-date',
  'input-date-range',
  'input-datetime',
  'input-datetime-range',
  'input-excel',
  'input-file',
  'input-formula',
  'input-group',
  'input-image',
  'input-kv',
  'input-kvs',
  'input-month',
  'input-month-range',
  'input-number',
  'input-password',
  'input-quarter',
  'input-quarter-range',
  'input-range',
  'input-rating',
  'input-repeat',
  'input-rich-text',
  'input-signature',
  'input-sub-form',
  'input-table',
  'input-tag',
  'input-text',
  'input-time',
  'input-time-range',
  'input-tree',
  'input-verification-code',
  'input-year',
  'input-year-range',
  'json-schema',
  'json-schema-editor',
  'list-select',
  'location-picker',
  'matrix-checkboxes',
  'nested-select',
  'picker',
  'radio',
  'radios',
  'select',
  'static',
  'switch',
  'textarea',
  'transfer',
  'transfer-picker',
  'tabs-transfer',
  'tree-select',
  'uuid',
])

export const COMMON_PROPS: Record<string, SchemaDoc> = {
  type: doc('type', '通用', '组件种类。决定用哪套渲染器。'),
  id: doc('id', '通用', '组件 id，动作用 componentId 查找。'),
  name: doc('name', '通用', '组件名。表单项同时作为写入数据的字段路径。'),
  className: doc('className', '样式', '附加 class。可用 w-* / h-full / m-t-xs 等 helper，以及 m: / pc: 响应式。'),
  style: doc('style', '样式', '行内样式对象或字符串。'),
  visible: doc('visible', '通用', '是否渲染。false 不输出。'),
  visibleOn: doc('visibleOn', '表达式', '表达式为真才渲染。'),
  hidden: doc('hidden', '通用', '隐藏。true 时不渲染。'),
  hiddenOn: doc('hiddenOn', '表达式', '表达式为真时隐藏。'),
  disabled: doc('disabled', '通用', '禁用。Editor 用它控制 readOnly，不要写在 options 里。'),
  disabledOn: doc('disabledOn', '表达式', '表达式为真时禁用，如 ${status == 0}。'),
  onEvent: doc('onEvent', '事件', '本组件事件到动作。键是该 type 的事件名，不要把别的组件事件写过来。'),
  data: doc('data', '数据域', '静态数据。容器上写 data 会建子域（inherit 节点除外）。'),
}

export const FORM_ITEM_PROPS: Record<string, SchemaDoc> = {
  name: doc('name', '表单', '字段名。表单项把值写到这个路径。'),
  label: doc('label', '表单', '表单项标签。false 不画标签。'),
  value: doc('value', '表单', '初始值。'),
  required: doc('required', '表单', '必填。'),
  description: doc('description', '表单', '字段说明，画在控件下方。'),
  placeholder: doc('placeholder', '表单', '空值占位。'),
  size: doc('size', '表单', '表单项**宽度**档：xs / sm / md / lg / full。未写则吃满布局槽。'),
  mode: doc('mode', '表单', '布局：normal / horizontal / inline。'),
  labelClassName: doc('labelClassName', '表单', '标签 class，走 resolveClassName。'),
  inputClassName: doc('inputClassName', '表单', '控件槽 class，走 resolveClassName。'),
  descriptionClassName: doc('descriptionClassName', '表单', '说明文字 class，走 resolveClassName。'),
  validations: doc('validations', '表单', '校验规则。'),
  validateOnChange: doc('validateOnChange', '表单', '变化时是否校验。'),
}

export const FORM_ITEM_EVENTS: Record<string, SchemaDoc> = {
  change: doc('change', '事件', '值变化。公式可读 ${event.data.字段}。'),
  focus: doc('focus', '事件', '获得焦点。'),
  blur: doc('blur', '事件', '失去焦点。'),
}

export const GLOBAL_ACTIONS: Record<string, SchemaDoc> = {
  ajax: doc('ajax', '动作', '发请求。配 api。'),
  dialog: doc('dialog', '动作', '弹对话框。'),
  drawer: doc('drawer', '动作', '打开抽屉。'),
  toast: doc('toast', '动作', '轻提示。'),
  closeDialog: doc('closeDialog', '动作', '关闭对话框。'),
  copy: doc('copy', '动作', '复制文本。'),
  link: doc('link', '动作', '跳转链接。'),
  goBack: doc('goBack', '动作', '返回上一页。'),
  refresh: doc('refresh', '动作', '刷新页面。'),
  confirm: doc('confirm', '动作', '确认框。'),
  custom: doc('custom', '动作', '自定义动作名，需已注册。'),
  broadcast: doc('broadcast', '动作', '广播事件。'),
  reload: doc('reload', '动作', '重载目标组件。'),
  submit: doc('submit', '动作', '提交表单。'),
  reset: doc('reset', '动作', '重置表单。'),
  setValue: doc('setValue', '动作', '给目标组件设值。具体参数随目标 type 变。'),
}

const NODE_SLOTS = ['body', 'aside', 'toolbar', 'header', 'footer', 'items', 'tabs', 'tab', 'columns', 'filter', 'dialog', 'drawer', 'pages']

const registeredAliases: Record<string, string> = {}
const builtinFormItemTypes = new Set(FORM_ITEM_TYPES)
const extraFields = new Map<string, TypeCatalog>()

export function resolveTypeAlias(type?: string): string | undefined {
  if (!type) return type
  const key = type.toLowerCase()
  return registeredAliases[key] ?? TYPE_ALIASES[key] ?? key
}

export function registerTypeAlias(alias: string, target: string): void {
  registeredAliases[alias.toLowerCase()] = target.toLowerCase()
}

export function unregisterTypeAlias(alias: string): void {
  delete registeredAliases[alias.toLowerCase()]
}

export function markFormItemType(type: string, yes = true): void {
  const key = type.toLowerCase()
  if (yes) FORM_ITEM_TYPES.add(key)
  else if (!builtinFormItemTypes.has(key)) FORM_ITEM_TYPES.delete(key)
}

function fieldDoc(key: string, value: SchemaFieldInput, category: string): SchemaDoc {
  if (typeof value === 'string') return doc(key, category, value)
  return {
    title: value.title || key,
    category: value.category || category,
    description: value.description,
    detail: value.detail,
  }
}

function mapFieldDocs(
  fields: Record<string, SchemaFieldInput> | undefined,
  category: string,
): Record<string, SchemaDoc> | undefined {
  if (!fields) return undefined
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fieldDoc(key, value, category)]))
}

export function normalizeRendererSchema(schema?: RendererSchema, formItem?: boolean): TypeCatalog {
  const category = schema?.category || '组件'
  return {
    formItem: schema?.formItem ?? formItem,
    slots: schema?.slots,
    properties: mapFieldDocs(schema?.properties, category),
    events: mapFieldDocs(schema?.events, `${category} 事件`),
    actions: mapFieldDocs(schema?.actions, `${category} 动作`),
  }
}

export function mergeTypeCatalogs(...parts: Array<TypeCatalog | undefined>): TypeCatalog {
  const out: TypeCatalog = {}
  for (const part of parts) {
    if (!part) continue
    if (part.formItem) out.formItem = true
    if (part.slots) out.slots = part.slots
    if (part.properties) out.properties = { ...out.properties, ...part.properties }
    if (part.events) out.events = { ...out.events, ...part.events }
    if (part.actions) out.actions = { ...out.actions, ...part.actions }
  }
  return out
}

export function registerSchemaTypeCatalog(type: string, catalog: TypeCatalog): void {
  const key = type.toLowerCase()
  extraFields.set(key, mergeTypeCatalogs(extraFields.get(key), catalog))
}

export function unregisterSchemaTypeCatalog(type: string): void {
  extraFields.delete(type.toLowerCase())
}

export function registerSchemaFieldDoc(
  type: string,
  field: string,
  fieldDocInput: SchemaDoc,
  kind: SchemaFieldKind = 'prop',
): void {
  const key = type.toLowerCase()
  const cur = extraFields.get(key) ?? {}
  const bucket = kind === 'event' ? 'events' : kind === 'action' ? 'actions' : 'properties'
  extraFields.set(key, { ...cur, [bucket]: { ...(cur[bucket] || {}), [field]: fieldDocInput } })
}

function aliasesOf(type: string): string[] {
  const resolved = resolveTypeAlias(type) || type
  const fromSeed = Object.entries(TYPE_ALIASES)
    .filter(([, target]) => target === resolved)
    .map(([alias]) => alias)
  const fromReg = Object.entries(registeredAliases)
    .filter(([, target]) => target === resolved)
    .map(([alias]) => alias)
  return [...new Set([...fromSeed, ...fromReg])]
}

function typePropertyDoc(type?: string): SchemaDoc {
  if (!type) return COMMON_PROPS.type
  const resolved = resolveTypeAlias(type) || type
  const info = SCHEMA_TYPE_DOCS[type] ?? SCHEMA_TYPE_DOCS[resolved]
  const aliases = aliasesOf(resolved)
  const aliasNote =
    resolved === 'editor'
      ? '可写成 `json-editor` / `yaml-editor` / `js-editor` / `ts-editor` 这种 `xxx-editor` 别名。'
      : aliases.length && aliases.length <= 6
        ? `别名 \`${aliases.join('` / `')}\`。`
        : ''
  if (!info) {
    return doc('type', '组件', `指定为 \`${type}\`。${aliasNote}`.trim())
  }
  return doc(
    'type',
    info.category || '组件',
    `指定为 ${info.title}（\`${type}\`）。${info.description}${aliasNote ? ` ${aliasNote}` : ''}`,
  )
}

export function catalogFor(type?: string): Required<Pick<TypeCatalog, 'properties' | 'events' | 'actions' | 'slots'>> {
  const key = type?.toLowerCase()
  const resolved = resolveTypeAlias(key)
  const extra = (key && extraFields.get(key)) || (resolved ? extraFields.get(resolved) : undefined)
  const builtin = (resolved && TYPE_CATALOGS[resolved]) || {}
  const spec = mergeTypeCatalogs(builtin, extra)
  const star = extraFields.get('*')
  const formItem =
    spec.formItem || !!(resolved && FORM_ITEM_TYPES.has(resolved)) || !!(key && FORM_ITEM_TYPES.has(key))
  return {
    properties: {
      ...COMMON_PROPS,
      type: typePropertyDoc(type),
      ...(formItem ? FORM_ITEM_PROPS : {}),
      ...spec.properties,
      ...star?.properties,
    },
    events: {
      ...(formItem ? FORM_ITEM_EVENTS : {}),
      ...spec.events,
      ...star?.events,
    },
    actions: {
      ...GLOBAL_ACTIONS,
      ...spec.actions,
      ...star?.actions,
    },
    slots: spec.slots ?? NODE_SLOTS,
  }
}

export { SCHEMA_TYPE_DOCS }
