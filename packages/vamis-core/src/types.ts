import type { Component } from 'vue'

export type PlainObject = Record<string, any>

export type SchemaCollection = SchemaNode | SchemaNode[]

/** YAML/JSON 子节点可以是字符串、数字、布尔；`false` 表示不渲染。 */
export type SchemaNode = string | number | boolean | SchemaObject

export interface SchemaObject extends PlainObject {
  type?: string
  name?: string
  id?: string
  /** Amis 表单/面板：`false` 隐藏标题；对象走子渲染器。 */
  title?: string | false | SchemaObject
  /** Amis 表单项：`false` 隐藏 label。 */
  label?: string | false
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
  static?: boolean
  staticOn?: string
  staticSchema?: unknown
  staticPlaceholder?: string
  onEvent?: Record<string, { actions: ActionSchema[] }>
}

export interface JumpToOptions {
  blank?: boolean
  actionType?: string
}

export interface ActionSchema extends SchemaObject {
  actionType?: string
  /** 目标组件：componentId 优先，其次 componentName（name），最后 target。 */
  componentName?: string
  api?: SchemaApi
  dialog?: SchemaObject
  drawer?: SchemaObject
  url?: string
  link?: string
  blank?: boolean
  confirmText?: string
  confirmTitle?: string
  dataMergeMode?: 'merge' | 'override'
  redirect?: string
  feedback?: SchemaObject | string
  reload?: string
  copy?: string
  content?: string
  copyFormat?: string
  fileName?: string
  downloadFileName?: string
  close?: boolean | string
  required?: string[]
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
  /** download 时覆盖文件名；仍建议接口返回 Content-Disposition */
  downloadFileName?: string
}

export interface Payload {
  status: number
  msg?: string
  data?: any
  ok?: boolean
  msgTimeout?: number
  errors?: any
  fileName?: string
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

export type NotifyType = 'info' | 'success' | 'warning' | 'error'

export type NotifyConf = {
  title?: string
  position?: string
  timeout?: number
  closeButton?: boolean
  showIcon?: boolean
  allowHtml?: boolean
  /** 对齐 Amis Toast `mobileUI`；缺省时按 `isMobileToast()`（max-width 768）。 */
  mobile?: boolean
  /** Amis `render('title', title)`：有 type 的 SchemaNode 进 ToastMessage。 */
  titleSchema?: SchemaObject
  /** Amis `render('body', body)`：有 type 的 SchemaNode 进 ToastMessage。 */
  bodySchema?: SchemaObject
  /** 弹出时的数据快照，给 schema body/title 插值。 */
  data?: PlainObject
}

export interface RendererEnv {
  /** 返回原始响应体；`requestApi` 再 `normalizePayload`。 */
  fetcher: (api: ApiObject, data?: PlainObject) => Promise<unknown>
  notify: (type: NotifyType, msg: string, conf?: NotifyConf) => void
  jumpTo: (to: string, opts?: JumpToOptions) => void
  alert: (msg: string, title?: string) => void
  /** 对齐 Amis `Alert.confirm`：默认 Modal，不是 `window.confirm`。第三参为按钮文案 / Esc / size。 */
  confirm: (
    msg: string,
    title?: string,
    options?: import('./confirm-store').ConfirmOptions,
  ) => Promise<boolean>
  session?: string
  theme?: string
  initialData?: PlainObject
  /**
   * 是否把 `location.search` 并进根数据域（对齐 Amis `parseQuery`）。
   * 对照 `embed-case`、文档 PreviewFrame / SchemaPreview 关掉：宿主 URL 上的
   * `engine` / `case` / `vp` / `dark` / `density` / `accent` 不是表单字段。
   * 正式 `vamis.embed` 默认仍吃 query。
   */
  parseLocation?: boolean
  debug?: boolean
  /** 允许 schema 里的 requestAdaptor / adaptor 字符串函数体。Playground 文档预览默认开。 */
  trusted?: boolean
  /** 浮层挂载点。对齐 Amis `env.getModalContainer`，默认 `document.body`。 */
  getModalContainer?: () => HTMLElement | undefined
  /** 对齐 Amis `env.mobileUI`。Remark 等只认这个开关，不要用 768 视口误判。 */
  mobileUI?: boolean
}

export interface RenderContextValue {
  env: RendererEnv
  data: PlainObject
  path: string
}
