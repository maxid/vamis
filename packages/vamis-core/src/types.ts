import type { Component } from 'vue'

export type PlainObject = Record<string, any>

export type SchemaCollection = SchemaNode | SchemaNode[]

export type SchemaNode = string | SchemaObject

export interface SchemaObject extends PlainObject {
  type?: string
  name?: string
  id?: string
  title?: string
  label?: string
  className?: string | Record<string, boolean | string>
  style?: string | Record<string, string>
  cssVars?: Record<string, string>
  density?: 'compact' | 'comfortable'
  body?: SchemaCollection
  visible?: boolean
  visibleOn?: string
  hidden?: boolean
  hiddenOn?: string
  disabled?: boolean
  disabledOn?: string
  onEvent?: Record<string, { actions: ActionSchema[] }>
}

export interface ActionSchema extends SchemaObject {
  actionType?: string
  api?: SchemaApi
  dialog?: SchemaObject
  url?: string
  link?: string
  confirmText?: string
  dataMergeMode?: 'merge' | 'override'
}

export type SchemaApi = string | ApiObject

export type RequestAdaptor = (
  api: ApiObject,
  context: PlainObject,
) => ApiObject | Promise<ApiObject>

export type ResponseAdaptor = (
  payload: any,
  response: any,
  api: ApiObject,
  context: PlainObject,
) => any

export interface ApiObject {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete'
  url: string
  data?: PlainObject | string
  headers?: Record<string, string>
  dataType?: 'json' | 'form' | 'form-data'
  responseType?: 'json' | 'blob' | 'text'
  sendOn?: string
  cache?: number
  requestAdaptor?: string | RequestAdaptor
  adaptor?: string | ResponseAdaptor
  responseData?: PlainObject
  replaceData?: boolean
  convertKeyToPath?: boolean
  autoRefresh?: boolean
  trackExpression?: string
  qsOptions?: PlainObject | string
  graphql?: string
  mockResponse?: any
  messages?: { success?: string; failed?: string }
  query?: PlainObject
  context?: PlainObject
  /** GET 时是否把 data 拼进 query，默认 true */
  attachDataToQuery?: boolean
  /** 即使 url 含 `$` 也把当前域拼进 query */
  forceAppendDataToQuery?: boolean
}

export interface Payload {
  status: number
  msg?: string
  data?: any
  ok?: boolean
  msgTimeout?: number
  errors?: any
}

export type RendererTest = RegExp | ((path: string, schema?: SchemaObject) => boolean)

/** `registerRenderer({ schema })` 字段说明。字符串当作 description。 */
export type SchemaFieldInput = string | {
  title?: string
  description: string
  category?: string
  detail?: string
}

/** 组件自述。写在 `registerRenderer` 上即进入 schema 智能感知，不必另维护一份目录。 */
export interface RendererSchema {
  category?: string
  formItem?: boolean
  slots?: string[]
  properties?: Record<string, SchemaFieldInput>
  events?: Record<string, SchemaFieldInput>
  actions?: Record<string, SchemaFieldInput>
}

export interface RendererConfig {
  type: string
  alias?: string[]
  component: Component
  isFormItem?: boolean
  isolateScope?: boolean
  /** D1：inherit 沿用父域；self 建子域仍可向上查；isolate 不向上查 */
  scope?: 'inherit' | 'self' | 'isolate'
  /** 无精确 type 时的兜底匹配；与 Amis 一样 weight 越低越先命中 */
  test?: RendererTest
  weight?: number
  /** 感知补全 / 悬停用的显示名。低码应用注册自定义 type 时写入 */
  name?: string
  /** 感知补全 / 悬停用的文档说明。也可事后 `registerSchemaTypeDoc` */
  description?: string
  /** 属性 / 事件 / 动作自述。`isFormItem` 自动带上表单项通用字段。 */
  schema?: RendererSchema
}

export interface RendererEnv {
  fetcher: (api: ApiObject, data?: PlainObject) => Promise<Payload>
  notify: (type: 'info' | 'success' | 'warning' | 'error', msg: string) => void
  jumpTo: (to: string) => void
  alert: (msg: string, title?: string) => void
  confirm: (msg: string, title?: string) => Promise<boolean>
  session?: string
  theme?: string
  initialData?: PlainObject
  debug?: boolean
  /** 允许 schema 里的 requestAdaptor / adaptor 字符串函数体。Playground 文档预览默认开。 */
  trusted?: boolean
}

export interface RenderContextValue {
  env: RendererEnv
  data: PlainObject
  path: string
}
