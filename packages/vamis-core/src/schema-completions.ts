import { isMap, isPair, isScalar, isSeq, parseDocument } from 'yaml'
import type { Document, Node, Pair } from 'yaml'
import {
  COMMON_PROPS,
  TYPE_CATALOGS,
  catalogFor,
  registerSchemaFieldDoc,
  registerSchemaTypeCatalog,
  resolveTypeAlias,
  type SchemaFieldKind,
} from './schema-type-catalog'
import { SCHEMA_TYPE_DOCS, type SchemaDoc } from './schema-type-docs'

export type { SchemaDoc, SchemaFieldKind }
export {
  SCHEMA_TYPE_DOCS,
  TYPE_CATALOGS,
  catalogFor,
  registerSchemaFieldDoc,
  registerSchemaTypeCatalog,
  resolveTypeAlias,
}

/** 通用字段。会随 type 撞名的 size / options / actions 不放这里，见 catalogFor(type)。 */
export const SCHEMA_PROPERTY_DOCS = COMMON_PROPS
export const SCHEMA_PROPERTY_KEYS = Object.keys(SCHEMA_PROPERTY_DOCS)

export type SchemaCompletionKind = 'type' | 'key' | 'event' | 'action'

export type SchemaCompletion = {
  label: string
  kind: SchemaCompletionKind
  title?: string
  detail?: string
  documentation: string
}

const extraTypeDocs = new Map<string, SchemaDoc>()

export function registerSchemaTypeDoc(type: string, doc: SchemaDoc): void {
  extraTypeDocs.set(type.toLowerCase(), doc)
}

export function unregisterSchemaTypeDoc(type: string): void {
  extraTypeDocs.delete(type.toLowerCase())
}

export function registerSchemaPropertyDoc(key: string, doc: SchemaDoc): void {
  registerSchemaFieldDoc('*', key, doc, 'prop')
}

export function resolveSchemaTypeDoc(type: string): SchemaDoc {
  return extraTypeDocs.get(type.toLowerCase()) ?? SCHEMA_TYPE_DOCS[type] ?? SCHEMA_TYPE_DOCS[type.toLowerCase()] ?? fallbackTypeDoc(type)
}

export function resolveSchemaFieldDoc(
  type: string | undefined,
  field: string,
  kind: SchemaFieldKind = 'prop',
): SchemaDoc | undefined {
  const cat = catalogFor(type)
  if (kind === 'event') return cat.events[field]
  if (kind === 'action') return cat.actions[field]
  return cat.properties[field] ?? cat.events[field] ?? cat.actions[field]
}

export function resolveSchemaPropertyDoc(key: string, type?: string): SchemaDoc | undefined {
  return resolveSchemaFieldDoc(type, key, 'prop') ?? COMMON_PROPS[key]
}

function fallbackTypeDoc(type: string): SchemaDoc {
  return {
    title: type,
    category: '组件',
    description: `组件 type \`${type}\`。未内置文档时，在 registerRenderer({ name, description, schema }) 自述即可，不必另写目录。`,
  }
}

export function formatSchemaTypeMarkdown(type: string, doc = resolveSchemaTypeDoc(type)): string {
  const lines = [`### ${doc.title || type}`, '', `组件 type \`${type}\`${doc.category ? ` · ${doc.category}` : ''}`]
  if (doc.description) lines.push('', doc.description)
  if (doc.detail) lines.push('', doc.detail)
  return lines.join('\n')
}

export function formatSchemaFieldMarkdown(
  field: string,
  kind: SchemaFieldKind,
  type: string | undefined,
  doc?: SchemaDoc,
): string {
  const resolved = doc ?? resolveSchemaFieldDoc(type, field, kind)
  const title = resolved?.title || field
  const role = kind === 'event' ? '事件' : kind === 'action' ? '动作' : '字段'
  const owner = type ? ` · \`${type}\`` : ''
  const lines = [`### ${title}`, '', `${role} \`${field}\`${owner}${resolved?.category ? ` · ${resolved.category}` : ''}`]
  if (resolved?.description) lines.push('', resolved.description)
  if (resolved?.detail) lines.push('', resolved.detail)
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

function fieldCompletion(label: string, kind: SchemaFieldKind, type?: string): SchemaCompletion {
  const doc = resolveSchemaFieldDoc(type, label, kind)
  return {
    label,
    kind: kind === 'event' ? 'event' : kind === 'action' ? 'action' : 'key',
    title: doc?.title,
    detail: type ? `${doc?.category || kind} · ${type}` : doc?.category,
    documentation: formatSchemaFieldMarkdown(label, kind, type, doc),
  }
}

function startsWith(items: readonly string[], prefix: string): string[] {
  const p = prefix.toLowerCase()
  return items.filter((item) => item.toLowerCase().startsWith(p))
}

function tokenPrefixAt(text: string, offset: number): string {
  return text.slice(0, offset).match(/[A-Za-z0-9_-]*$/)?.[0] ?? ''
}

type CursorKind = 'key' | 'type' | 'event' | 'action' | 'none'

type SchemaCursor = {
  type?: string
  kind: CursorKind
  prefix: string
  word?: string
}

function rangeContains(range: [number, number, number] | null | undefined, offset: number): boolean {
  if (!range) return false
  return range[0] <= offset && offset <= range[2]
}

function scalarString(node: unknown): string | undefined {
  if (isScalar(node) && node.value != null) return String(node.value)
}

function pairKeyName(pair: Pair): string {
  return isScalar(pair.key) ? String(pair.key.value ?? '') : ''
}

function prefixFromRange(text: string, range: [number, number, number] | null | undefined, offset: number): string {
  if (!range) return tokenPrefixAt(text, offset)
  const raw = text.slice(range[0], Math.max(range[0], offset)).replace(/^["']/, '')
  return raw.match(/[A-Za-z0-9_-]*$/)?.[0] ?? ''
}

function walk(
  node: Node | null | undefined,
  offset: number,
  enclosingType: string | undefined,
  path: string[],
  text: string,
): SchemaCursor | null {
  if (!node) return null
  if (isMap(node)) {
    const typeVal = node.get('type')
    const thisType = typeof typeVal === 'string' ? typeVal : enclosingType
    for (const pair of node.items) {
      if (!isPair(pair)) continue
      const key = pairKeyName(pair)
      const keyNode = pair.key as Node | null
      const val = pair.value as Node | null
      if (rangeContains(keyNode?.range, offset)) {
        const prefix = prefixFromRange(text, keyNode?.range, offset)
        const kind: CursorKind = path[path.length - 1] === 'onEvent' ? 'event' : 'key'
        return { type: thisType, kind, prefix, word: key }
      }
      if (key === 'type' && rangeContains(val?.range, offset)) {
        return {
          type: thisType,
          kind: 'type',
          prefix: prefixFromRange(text, val?.range, offset),
          word: scalarString(val),
        }
      }
      if (key === 'actionType' && rangeContains(val?.range, offset)) {
        return {
          type: enclosingType ?? thisType,
          kind: 'action',
          prefix: prefixFromRange(text, val?.range, offset),
          word: scalarString(val),
        }
      }
      if (key === 'onEvent' && isScalar(val) && rangeContains(val.range, offset)) {
        return {
          type: thisType,
          kind: 'event',
          prefix: prefixFromRange(text, val.range, offset),
          word: scalarString(val),
        }
      }
      if (val && rangeContains(val.range, offset)) {
        const inner = walk(val, offset, thisType, key ? [...path, key] : path, text)
        if (inner) return inner
      }
    }
    if (rangeContains(node.range, offset)) {
      const kind: CursorKind = path[path.length - 1] === 'onEvent' ? 'event' : 'key'
      return { type: thisType, kind, prefix: tokenPrefixAt(text, offset) }
    }
  }
  if (isSeq(node)) {
    for (const item of node.items) {
      const child = item as Node | null
      if (child && rangeContains(child.range, offset)) {
        const inner = walk(child, offset, enclosingType, path, text)
        if (inner) return inner
      }
    }
    if (rangeContains(node.range, offset)) {
      return { type: enclosingType, kind: 'key', prefix: tokenPrefixAt(text, offset) }
    }
  }
  return null
}

function fallbackType(text: string, offset: number): string | undefined {
  const lines = text.slice(0, offset).split('\n')
  let indent = (lines[lines.length - 1].match(/^(\s*)/) || ['', ''])[1].length
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (!line.trim()) continue
    const ind = (line.match(/^(\s*)/) || ['', ''])[1].length
    if (ind > indent) continue
    indent = Math.min(indent, ind)
    const hit = line.match(/^(?:\s*(?:-\s*)?)type\s*:\s*["']?([A-Za-z0-9_-]+)/)
    if (hit) return hit[1]
  }
}

function inOnEvent(text: string, offset: number): boolean {
  const lines = text.slice(0, offset).split('\n')
  let indent = (lines[lines.length - 1].match(/^(\s*)/) || ['', ''])[1].length
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]
    if (!line.trim()) continue
    const ind = (line.match(/^(\s*)/) || ['', ''])[1].length
    if (ind > indent) continue
    if (/^\s*onEvent\s*:/.test(line) && ind < indent) return true
    if (ind < indent && !/^\s*onEvent\s*:/.test(line) && !/^\s*-\s/.test(line)) indent = ind
  }
  return false
}

function fallbackCursor(text: string, offset: number): SchemaCursor {
  const prefix = tokenPrefixAt(text, offset)
  const line = text.slice(0, offset).split('\n').pop() ?? ''
  const type = fallbackType(text, offset)
  if (/type\s*:\s*["']?[A-Za-z0-9_-]*$/.test(line) || /"type"\s*:\s*"[A-Za-z0-9_-]*$/.test(line)) {
    return { type, kind: 'type', prefix }
  }
  if (/actionType\s*:\s*["']?[A-Za-z0-9_-]*$/.test(line) || /"actionType"\s*:\s*"[A-Za-z0-9_-]*$/.test(line)) {
    return { type, kind: 'action', prefix }
  }
  if (/:\s+\S/.test(line) || (/:\s*$/.test(line) && !/onEvent\s*:\s*$/.test(line))) {
    return { type, kind: 'none', prefix }
  }
  if (inOnEvent(text, offset) || /onEvent\s*:\s*$/.test(line)) {
    return { type, kind: 'event', prefix }
  }
  return { type, kind: 'key', prefix }
}

export function locateSchemaCursor(text: string, offset: number): SchemaCursor {
  const clamped = Math.max(0, Math.min(offset, text.length))
  const doc: Document.Parsed = parseDocument(text, {
    prettyErrors: true,
    schema: 'core',
    version: '1.2',
    strict: false,
  })
  const fromAst = walk(doc.contents as Node | null, clamped, undefined, [], text)
  if (fromAst) {
    if (!fromAst.prefix) fromAst.prefix = tokenPrefixAt(text, clamped)
    return fromAst
  }
  return fallbackCursor(text, clamped)
}

export function schemaCompletionsAt(
  text: string,
  offset: number,
  _language: 'yaml' | 'json',
  types: readonly string[],
): SchemaCompletion[] {
  const cursor = locateSchemaCursor(text, offset)
  if (cursor.kind === 'none') return []
  if (cursor.kind === 'type') return startsWith(types, cursor.prefix).map(typeCompletion)
  const cat = catalogFor(cursor.type)
  if (cursor.kind === 'event') {
    return startsWith(Object.keys(cat.events), cursor.prefix).map((name) => fieldCompletion(name, 'event', cursor.type))
  }
  if (cursor.kind === 'action') {
    return startsWith(Object.keys(cat.actions), cursor.prefix).map((name) =>
      fieldCompletion(name, 'action', cursor.type),
    )
  }
  return startsWith(Object.keys(cat.properties), cursor.prefix).map((name) => fieldCompletion(name, 'prop', cursor.type))
}

export function schemaHoverAt(text: string, offset: number, _language: 'yaml' | 'json'): SchemaCompletion | null {
  const cursor = locateSchemaCursor(text, offset)
  if (cursor.kind === 'none') return null
  if (cursor.kind === 'type') {
    const name = cursor.word || cursor.prefix || cursor.type
    return name ? typeCompletion(name) : null
  }
  if (cursor.kind === 'key' && cursor.word === 'type' && cursor.type) {
    return typeCompletion(cursor.type)
  }
  const kind: SchemaFieldKind = cursor.kind === 'event' ? 'event' : cursor.kind === 'action' ? 'action' : 'prop'
  const cat = catalogFor(cursor.type)
  const bucket = kind === 'event' ? cat.events : kind === 'action' ? cat.actions : cat.properties
  if (cursor.word && bucket[cursor.word]) return fieldCompletion(cursor.word, kind, cursor.type)
  const stem = cursor.word || cursor.prefix || ''
  const matches = startsWith(Object.keys(bucket), stem)
  if (matches.length === 1) return fieldCompletion(matches[0], kind, cursor.type)
  return null
}

/** @deprecated 用 schemaCompletionsAt；无组件树上下文时同名字段会串文档。 */
export function yamlCompletionsForLine(until: string, types: readonly string[]): SchemaCompletion[] {
  return schemaCompletionsAt(until, until.length, 'yaml', types)
}

/** @deprecated 用 schemaCompletionsAt */
export function jsonCompletionsForLine(until: string, types: readonly string[]): SchemaCompletion[] {
  return schemaCompletionsAt(until, until.length, 'json', types)
}

/** @deprecated 用 schemaHoverAt */
export function schemaHoverForLine(line: string, word: string, language: 'yaml' | 'json'): SchemaCompletion | null {
  const idx = line.lastIndexOf(word)
  return schemaHoverAt(line, idx >= 0 ? idx + Math.floor(word.length / 2) : line.length, language)
}

function defId(type: string): string {
  return `type_${type}`
}

function slotSchema(): Record<string, unknown> {
  return {
    oneOf: [
      { $ref: '#/$defs/node' },
      { type: 'array', items: { $ref: '#/$defs/node' } },
      { type: 'string' },
    ],
  }
}

function typeJsonSchema(type: string): Record<string, unknown> {
  const cat = catalogFor(type)
  const properties: Record<string, Record<string, unknown>> = {}
  for (const [key, fieldDoc] of Object.entries(cat.properties)) {
    properties[key] = {
      markdownDescription: formatSchemaFieldMarkdown(key, 'prop', type, fieldDoc),
    }
    if (cat.slots.includes(key)) Object.assign(properties[key], slotSchema())
  }
  if (Object.keys(cat.events).length) {
    properties.onEvent = {
      type: 'object',
      additionalProperties: true,
      markdownDescription: formatSchemaFieldMarkdown('onEvent', 'prop', type, cat.properties.onEvent),
      properties: Object.fromEntries(
        Object.entries(cat.events).map(([name, fieldDoc]) => [
          name,
          {
            type: 'object',
            additionalProperties: true,
            markdownDescription: formatSchemaFieldMarkdown(name, 'event', type, fieldDoc),
            properties: {
              actions: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: true,
                  properties: {
                    actionType: {
                      type: 'string',
                      enum: Object.keys(cat.actions),
                      markdownDescription: '动作种类。说明随封装组件 type 变。',
                    },
                  },
                },
              },
            },
          },
        ]),
      ),
    }
  }
  return { type: 'object', additionalProperties: true, properties }
}

export function componentJsonSchema(types: readonly string[]): Record<string, unknown> {
  const defs: Record<string, unknown> = {
    node: {
      type: 'object',
      additionalProperties: true,
      properties: {
        type: {
          type: 'string',
          enum: [...types],
          markdownDescription: formatSchemaFieldMarkdown('type', 'prop', undefined, COMMON_PROPS.type),
        },
      },
      allOf: types.map((type) => ({
        if: { properties: { type: { const: type } }, required: ['type'] },
        then: { $ref: `#/$defs/${defId(type)}` },
      })),
    },
  }
  for (const type of types) defs[defId(type)] = typeJsonSchema(type)
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Vamis Schema',
    markdownDescription: '组件树。按节点 type 分支，同名属性 / 事件 / 动作用该组件自己的说明。',
    $ref: '#/$defs/node',
    $defs: defs,
  }
}
