import type { SchemaNode, SchemaObject } from './types'
import { asArray } from './context'

export const CHILD_COLLECTION_KEYS = [
  'body',
  'columns',
  'tabs',
  'steps',
  'items',
  'actions',
  'controls',
  'buttons',
  'links',
] as const

const LEAF_TYPES = new Set([
  'tpl',
  'html',
  'plain',
  'divider',
  'alert',
  'hidden',
  'static',
  'input-text',
  'input-email',
  'input-password',
  'input-url',
  'text',
  'textarea',
  'input-number',
  'select',
  'multi-select',
  'nested-select',
  'tree-select',
  'checkbox',
  'checkboxes',
  'radios',
  'switch',
  'input-date',
  'input-datetime',
  'input-date-range',
  'input-datetime-range',
  'action',
  'button',
  'submit',
  'reset',
  'image',
  'images',
  'progress',
  'status',
  'mapping',
  'link',
  'icon',
  'avatar',
  'spinner',
  'search-box',
  'pagination',
  'chart',
  'transfer',
  'input-file',
  'input-image',
  'input-tree',
  'breadcrumb',
])

export interface PathSegment {
  key: string
  index: number
}

export function cloneSchema<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export function parsePath(path: string): PathSegment[] {
  if (!path) return []
  const parts = path.split('.')
  const segments: PathSegment[] = []
  for (let i = 0; i + 1 < parts.length; i += 2) {
    segments.push({ key: parts[i], index: Number(parts[i + 1]) })
  }
  return segments
}

export function joinPath(parentPath: string, key: string, index: number): string {
  const tail = `${key}.${index}`
  return parentPath ? `${parentPath}.${tail}` : tail
}

export function parentPathOf(path: string): string {
  const segments = parsePath(path)
  if (segments.length <= 1) return ''
  return segments
    .slice(0, -1)
    .map((segment) => `${segment.key}.${segment.index}`)
    .join('.')
}

export function childCollections(schema: SchemaObject): { key: string; nodes: SchemaNode[] }[] {
  const collections: { key: string; nodes: SchemaNode[] }[] = []
  for (const key of CHILD_COLLECTION_KEYS) {
    if (schema[key] != null) {
      collections.push({ key, nodes: asArray(schema[key]) })
    }
  }
  if (schema.filter != null) {
    collections.push({ key: 'filter', nodes: asArray(schema.filter) })
  }
  return collections
}

export function insertKeyFor(schema: SchemaObject): string {
  switch (schema.type) {
    case 'tabs':
      return 'tabs'
    case 'wizard':
      return 'steps'
    case 'flex':
      return 'items'
    case 'combo':
    case 'input-table':
    case 'each':
      return schema.columns ? 'columns' : 'items'
    case 'crud':
    case 'table':
      return 'columns'
    case 'button-group':
    case 'button-toolbar':
      return 'buttons'
    case 'nav':
    case 'breadcrumb':
      return 'links'
    default:
      return 'body'
  }
}

export function canInsertChild(schema: SchemaObject): boolean {
  const type = schema.type || ''
  if (LEAF_TYPES.has(type)) return false
  return true
}

export function ensureArray(schema: SchemaObject, key: string): SchemaNode[] {
  if (!Array.isArray(schema[key])) {
    schema[key] = schema[key] == null ? [] : [schema[key]]
  }
  return schema[key] as SchemaNode[]
}

export function getNodeAt(root: SchemaObject, path: string): SchemaObject {
  if (!path) return root
  let current: SchemaNode = root
  for (const segment of parsePath(path)) {
    if (!current || typeof current !== 'object') {
      throw new Error(`invalid schema path: ${path}`)
    }
    const collection = asArray((current as SchemaObject)[segment.key])
    current = collection[segment.index]
  }
  if (current == null) throw new Error(`missing node at ${path}`)
  if (typeof current !== 'object') return { type: 'tpl', tpl: String(current) }
  return current
}

export function getParentInfo(
  root: SchemaObject,
  path: string,
): { parent: SchemaObject; key: string; index: number; parentPath: string } | null {
  const segments = parsePath(path)
  if (!segments.length) return null
  const last = segments[segments.length - 1]
  const parentPath = parentPathOf(path)
  return {
    parent: getNodeAt(root, parentPath),
    key: last.key,
    index: last.index,
    parentPath,
  }
}

export function insertSnippet(root: SchemaObject, selectedPath: string, snippet: SchemaObject): string {
  const selected = getNodeAt(root, selectedPath)
  if (canInsertChild(selected)) {
    const key = insertKeyFor(selected)
    const collection = ensureArray(selected, key)
    collection.push(snippet)
    return joinPath(selectedPath, key, collection.length - 1)
  }
  const info = getParentInfo(root, selectedPath)
  if (!info) {
    const collection = ensureArray(root, 'body')
    collection.push(snippet)
    return `body.${collection.length - 1}`
  }
  const collection = ensureArray(info.parent, info.key)
  collection.splice(info.index + 1, 0, snippet)
  return joinPath(info.parentPath, info.key, info.index + 1)
}

export function removeAt(root: SchemaObject, path: string): string {
  const info = getParentInfo(root, path)
  if (!info) return ''
  const collection = ensureArray(info.parent, info.key)
  collection.splice(info.index, 1)
  if (!collection.length && info.key !== 'body') {
    delete info.parent[info.key]
  }
  if (!collection.length) return info.parentPath
  const nextIndex = Math.min(info.index, collection.length - 1)
  return joinPath(info.parentPath, info.key, nextIndex)
}

export function moveAt(root: SchemaObject, path: string, direction: -1 | 1): string {
  const info = getParentInfo(root, path)
  if (!info) return path
  const collection = ensureArray(info.parent, info.key)
  const nextIndex = info.index + direction
  if (nextIndex < 0 || nextIndex >= collection.length) return path
  const [item] = collection.splice(info.index, 1)
  collection.splice(nextIndex, 0, item)
  return joinPath(info.parentPath, info.key, nextIndex)
}

export function patchAt(root: SchemaObject, path: string, patch: Record<string, unknown>): SchemaObject {
  const node = getNodeAt(root, path)
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete node[key]
    else node[key] = value
  }
  return node
}

export function isAncestorPath(ancestor: string, candidate: string): boolean {
  if (ancestor === candidate) return true
  if (!ancestor) return true
  return candidate.startsWith(`${ancestor}.`)
}

export function annotateEditorPaths(root: SchemaObject, path = ''): SchemaObject {
  root.__editorPath = path
  for (const { key, nodes } of childCollections(root)) {
    nodes.forEach((node, index) => {
      if (!node || typeof node === 'string') return
      annotateEditorPaths(node as SchemaObject, joinPath(path, key, index))
    })
  }
  return root
}

export function movePathTo(
  root: SchemaObject,
  fromPath: string,
  toPath: string,
  position: 'before' | 'after' | 'inside' = 'inside',
): string {
  if (!fromPath || fromPath === toPath) return fromPath
  if (isAncestorPath(fromPath, toPath)) return fromPath

  const fromInfo = getParentInfo(root, fromPath)
  if (!fromInfo) return fromPath
  const source = ensureArray(fromInfo.parent, fromInfo.key)
  const [item] = source.splice(fromInfo.index, 1)
  if (item == null) return fromPath

  const sameCollection =
    fromInfo.parentPath === parentPathOf(toPath) && fromInfo.key === parsePath(toPath).at(-1)?.key
  let destPath = toPath
  if (sameCollection) {
    const destIndex = parsePath(toPath).at(-1)!.index
    if (fromInfo.index < destIndex) {
      destPath = joinPath(parentPathOf(toPath), fromInfo.key, destIndex - 1)
    }
  }

  if (position === 'inside') {
    const dest = getNodeAt(root, destPath)
    const key = insertKeyFor(dest)
    const collection = ensureArray(dest, key)
    collection.push(item)
    return joinPath(destPath, key, collection.length - 1)
  }

  const toInfo = getParentInfo(root, destPath)
  if (!toInfo) {
    const collection = ensureArray(root, 'body')
    collection.push(item)
    return `body.${collection.length - 1}`
  }
  const destCollection = ensureArray(toInfo.parent, toInfo.key)
  const insertIndex = position === 'before' ? toInfo.index : toInfo.index + 1
  destCollection.splice(insertIndex, 0, item)
  return joinPath(toInfo.parentPath, toInfo.key, insertIndex)
}
