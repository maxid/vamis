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

export interface ApiObject {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete'
  url: string
  data?: PlainObject
  headers?: Record<string, string>
}

export interface Payload {
  status: number
  msg?: string
  data?: any
}

export interface RendererConfig {
  type: string
  alias?: string[]
  component: Component
  isFormItem?: boolean
  isolateScope?: boolean
}

export interface RendererEnv {
  fetcher: (api: ApiObject, data?: PlainObject) => Promise<Payload>
  notify: (type: 'info' | 'success' | 'warning' | 'error', msg: string) => void
  jumpTo: (to: string) => void
  alert: (msg: string, title?: string) => void
  confirm: (msg: string, title?: string) => Promise<boolean>
  session?: string
  theme?: string
}

export interface RenderContextValue {
  env: RendererEnv
  data: PlainObject
  path: string
}
