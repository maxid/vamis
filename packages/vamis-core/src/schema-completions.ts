import { SCHEMA_PROPERTY_DOCS, SCHEMA_TYPE_DOCS, type SchemaDoc } from './schema-type-docs'

export type { SchemaDoc }
export { SCHEMA_PROPERTY_DOCS, SCHEMA_TYPE_DOCS }

export type SchemaCompletionKind = 'type' | 'key'

export type SchemaCompletion = {
  label: string
  kind: SchemaCompletionKind
  title?: string
  detail?: string
  documentation: string
}

const extraTypeDocs = new Map<string, SchemaDoc>()
const extraPropertyDocs = new Map<string, SchemaDoc>()

export const SCHEMA_PROPERTY_KEYS = Object.keys(SCHEMA_PROPERTY_DOCS)

export function registerSchemaTypeDoc(type: string, doc: SchemaDoc): void {
  extraTypeDocs.set(type, doc)
}

export function registerSchemaPropertyDoc(key: string, doc: SchemaDoc): void {
  extraPropertyDocs.set(key, doc)
}

export function resolveSchemaTypeDoc(type: string): SchemaDoc {
  return extraTypeDocs.get(type) ?? SCHEMA_TYPE_DOCS[type] ?? fallbackTypeDoc(type)
}

export function resolveSchemaPropertyDoc(key: string): SchemaDoc | undefined {
  return extraPropertyDocs.get(key) ?? SCHEMA_PROPERTY_DOCS[key]
}

function fallbackTypeDoc(type: string): SchemaDoc {
  return {
    title: type,
    category: '组件',
    description: `组件 type \`${type}\`。未内置文档时，低码应用可用 registerSchemaTypeDoc 或 registerRenderer({ description }) 补充。`,
  }
}

export function formatSchemaTypeMarkdown(type: string, doc = resolveSchemaTypeDoc(type)): string {
  const lines = [`### ${doc.title || type}`, '', `组件 type \`${type}\`${doc.category ? ` · ${doc.category}` : ''}`]
  if (doc.description) lines.push('', doc.description)
  if (doc.detail) lines.push('', doc.detail)
  return lines.join('\n')
}

export function formatSchemaPropertyMarkdown(key: string, doc = resolveSchemaPropertyDoc(key)): string {
  const title = doc?.title || key
  const lines = [`### ${title}`, '', `schema 字段 \`${key}\`${doc?.category ? ` · ${doc.category}` : ''}`]
  if (doc?.description) lines.push('', doc.description)
  if (doc?.detail) lines.push('', doc.detail)
  return lines.join('\n')
}

function typeCompletion(label: string): SchemaCompletion {
  const doc = resolveSchemaTypeDoc(label)
  return {
    label,
    kind: 'type',
    title: doc.title,
    detail: doc.category,
    documentation: formatSchemaTypeMarkdown(label, doc),
  }
}

function keyCompletion(label: string): SchemaCompletion {
  const doc = resolveSchemaPropertyDoc(label)
  return {
    label,
    kind: 'key',
    title: doc?.title,
    detail: doc?.category,
    documentation: formatSchemaPropertyMarkdown(label, doc),
  }
}

const TYPE_VALUE = /(?:^|\s|-)\s*type\s*:\s*(["']?)([A-Za-z0-9_-]*)$/
const JSON_TYPE_VALUE = /"type"\s*:\s*"([A-Za-z0-9_-]*)$/
const YAML_KEY = /^(?:\s*(?:-\s*)?)([A-Za-z0-9_-]*)$/
const JSON_KEY = /(?:[{,]\s*|"\s*,\s*)"([A-Za-z0-9_-]*)$/

function startsWith(items: readonly string[], prefix: string): string[] {
  const p = prefix.toLowerCase()
  return items.filter((item) => item.toLowerCase().startsWith(p))
}

export function yamlCompletionsForLine(until: string, types: readonly string[]): SchemaCompletion[] {
  const typeHit = until.match(TYPE_VALUE)
  if (typeHit) return startsWith(types, typeHit[2] ?? '').map(typeCompletion)
  if (/:\s+\S/.test(until) || /:\s*$/.test(until)) return []
  const keyHit = until.match(YAML_KEY)
  if (keyHit) return startsWith(SCHEMA_PROPERTY_KEYS, keyHit[1] ?? '').map(keyCompletion)
  return []
}

export function jsonCompletionsForLine(until: string, types: readonly string[]): SchemaCompletion[] {
  const typeHit = until.match(JSON_TYPE_VALUE)
  if (typeHit) return startsWith(types, typeHit[1] ?? '').map(typeCompletion)
  const keyHit = until.match(JSON_KEY)
  if (keyHit) return startsWith(SCHEMA_PROPERTY_KEYS, keyHit[1] ?? '').map(keyCompletion)
  return []
}

const YAML_TYPE_WORD = /(?:^|\s|-)\s*type\s*:\s*(["']?)([A-Za-z0-9_-]+)/
const JSON_TYPE_WORD = /"type"\s*:\s*"([A-Za-z0-9_-]+)/
const YAML_KEY_WORD = /^(?:\s*(?:-\s*)?)([A-Za-z0-9_-]+)\s*:/
const JSON_KEY_WORD = /"([A-Za-z0-9_-]+)"\s*:/

export function schemaHoverForLine(
  line: string,
  word: string,
  language: 'yaml' | 'json',
): SchemaCompletion | null {
  if (!word) return null
  const typeHit = language === 'json' ? line.match(JSON_TYPE_WORD) : line.match(YAML_TYPE_WORD)
  if (typeHit && (typeHit[language === 'json' ? 1 : 2] === word || word === 'type')) {
    if (word === 'type') return keyCompletion('type')
    return typeCompletion(word)
  }
  const keyHit = language === 'json' ? line.match(JSON_KEY_WORD) : line.match(YAML_KEY_WORD)
  if (keyHit && keyHit[1] === word) return keyCompletion(word)
  const prop = resolveSchemaPropertyDoc(word)
  if (prop) return keyCompletion(word)
  if (SCHEMA_TYPE_DOCS[word] || extraTypeDocs.has(word)) return typeCompletion(word)
  return null
}

export function componentJsonSchema(types: readonly string[]): Record<string, unknown> {
  const properties: Record<string, Record<string, unknown>> = {
    type: {
      type: 'string',
      enum: [...types],
      description: formatSchemaPropertyMarkdown('type'),
    },
  }
  for (const key of SCHEMA_PROPERTY_KEYS) {
    if (key === 'type') continue
    properties[key] = {
      description: formatSchemaPropertyMarkdown(key),
    }
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Vamis Schema',
    description: 'Vamis 组件 schema。YAML 与 JSON 共用同一套字段。未列出的字段仍允许出现。',
    type: 'object',
    additionalProperties: true,
    properties,
  }
}
