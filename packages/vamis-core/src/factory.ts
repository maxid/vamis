import { registerSchemaTypeDoc, resolveSchemaTypeDoc, unregisterSchemaTypeDoc } from './schema-completions'
import {
  TYPE_CATALOGS,
  markFormItemType,
  mergeTypeCatalogs,
  normalizeRendererSchema,
  registerSchemaTypeCatalog,
  registerTypeAlias,
  unregisterSchemaTypeCatalog,
  unregisterTypeAlias,
} from './schema-type-catalog'
import type { RendererConfig, SchemaObject } from './types'

const renderers: RendererConfig[] = []
const byType = new Map<string, RendererConfig>()

function insertByWeight(renderer: RendererConfig) {
  const weight = renderer.weight ?? 0
  const idx = renderers.findIndex((item) => weight < (item.weight ?? 0))
  if (idx >= 0) renderers.splice(idx, 0, renderer)
  else renderers.push(renderer)
}

export function rendererScopeMode(def?: RendererConfig | null): 'inherit' | 'self' | 'isolate' {
  if (!def) return 'inherit'
  if (def.scope) return def.scope
  if (def.isolateScope) return 'isolate'
  return 'inherit'
}

/** 注册即写入 schema 智能感知。低码应用不必再另维护一份目录。 */
export function publishRendererIntellisense(renderer: RendererConfig) {
  const type = renderer.type.toLowerCase()
  const base = resolveSchemaTypeDoc(type)
  const category = renderer.schema?.category || base.category || '扩展'
  const doc = {
    title: renderer.name || base.title,
    category,
    description: renderer.description || base.description,
    detail: base.detail,
  }
  registerSchemaTypeDoc(type, doc)
  const catalog = mergeTypeCatalogs(
    TYPE_CATALOGS[type],
    normalizeRendererSchema(renderer.schema, renderer.isFormItem),
    { formItem: renderer.isFormItem || renderer.schema?.formItem || TYPE_CATALOGS[type]?.formItem },
  )
  registerSchemaTypeCatalog(type, catalog)
  if (catalog.formItem) markFormItemType(type, true)
  for (const alias of renderer.alias || []) {
    const key = alias.toLowerCase()
    registerTypeAlias(key, type)
    registerSchemaTypeDoc(key, doc)
    registerSchemaTypeCatalog(key, catalog)
    if (catalog.formItem) markFormItemType(key, true)
  }
}

function forgetRendererIntellisense(renderer: RendererConfig) {
  const type = renderer.type.toLowerCase()
  unregisterSchemaTypeCatalog(type)
  unregisterSchemaTypeDoc(type)
  markFormItemType(type, false)
  for (const alias of renderer.alias || []) {
    const key = alias.toLowerCase()
    unregisterSchemaTypeCatalog(key)
    unregisterSchemaTypeDoc(key)
    unregisterTypeAlias(key)
    markFormItemType(key, false)
  }
}

export function registerRenderer(config: RendererConfig): RendererConfig {
  const type = config.type.toLowerCase()
  const renderer: RendererConfig = { ...config, type, weight: config.weight ?? 0 }
  const exists = byType.get(type)
  if (exists) {
    Object.assign(exists, renderer)
    publishRendererIntellisense(exists)
    return exists
  }
  insertByWeight(renderer)
  byType.set(type, renderer)
  for (const alias of renderer.alias || []) {
    byType.set(alias.toLowerCase(), { ...renderer, type: alias.toLowerCase() })
  }
  publishRendererIntellisense(renderer)
  return renderer
}

export function unRegisterRenderer(type: string) {
  const key = type.toLowerCase()
  const renderer = byType.get(key)
  if (!renderer) return
  byType.delete(key)
  for (const alias of renderer.alias || []) byType.delete(alias.toLowerCase())
  const idx = renderers.findIndex((item) => item.type === renderer.type)
  if (idx >= 0) renderers.splice(idx, 1)
  forgetRendererIntellisense(renderer)
}

export function resolveRenderer(type?: string, schema?: SchemaObject): RendererConfig | null {
  const key = (type || schema?.type || '').toLowerCase()
  if (key) {
    const exact = byType.get(key)
    if (exact) return exact
  }
  const path = key
  for (const item of renderers) {
    if (!item.test) continue
    const matched =
      item.test instanceof RegExp
        ? item.test.test(path)
        : typeof item.test === 'function'
          ? item.test(path, schema)
          : false
    if (matched) return item
  }
  return null
}

export function getRenderers(): RendererConfig[] {
  return renderers.slice()
}

export function hasRenderer(type: string): boolean {
  return byType.has(type.toLowerCase())
}
