import type { SchemaObject } from '../types'

export type FileItemState = 'init' | 'pending' | 'uploading' | 'error' | 'uploaded' | 'ready' | 'invalid'

export type FileItem = {
  id: string
  name?: string
  filename?: string
  value?: unknown
  url?: string
  state: FileItemState
  error?: string
  progress?: number
  size?: number
  file?: File
  [key: string]: unknown
}

const VALUE_STATES = new Set<FileItemState>(['uploaded', 'init', 'ready'])

export const FILE_STATE_TEXT: Record<FileItemState, string> = {
  init: '',
  pending: '等待上传',
  uploading: '上传中',
  error: '上传出错',
  uploaded: '已上传',
  ready: '',
  invalid: '',
}

export function fileFieldName(schema: SchemaObject, kind: 'name' | 'value' | 'url' | 'file'): string {
  if (kind === 'name') return String(schema.nameField || 'name')
  if (kind === 'value') return String(schema.valueField || 'value')
  if (kind === 'url') return String(schema.urlField || 'url')
  return String(schema.fileField || 'file')
}

export function fileDelimiter(schema: SchemaObject): string {
  return schema.delimiter == null ? ',' : String(schema.delimiter)
}

export function fileJoinValues(schema: SchemaObject): boolean {
  return schema.joinValues !== false
}

export function fileGuid(): string {
  return `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function getNameFromUrl(url: string): string {
  const text = String(url || '')
  if (/(?:\/|^)([^/]+?)$/.test(text)) {
    try {
      return decodeURIComponent(RegExp.$1)
    } catch {
      return RegExp.$1
    }
  }
  return text
}

/** Amis `prettyBytes(n, 1024)`：B / KB / MB。 */
export function prettyBytes(num: number, units = 1024): string {
  if (!Number.isFinite(num)) return '0 B'
  const neg = num < 0
  let n = Math.abs(num)
  const names = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (n >= units && i < names.length - 1) {
    n /= units
    i += 1
  }
  const text = i === 0 ? String(Math.round(n)) : n >= 10 ? n.toFixed(0) : n.toFixed(1)
  return `${neg ? '-' : ''}${text} ${names[i]}`
}

export function interpolateFileMsg(tpl: string, vars: Record<string, unknown>): string {
  return String(tpl).replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    vars[key] == null ? '' : String(vars[key]),
  )
}

export function fileAcceptOf(schema: SchemaObject): string {
  const raw = schema.accept
  if (raw == null) return ''
  const text = String(raw)
  return text === '*' ? '' : text
}

export function fileMatchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (!rules.length) return true
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return rules.some((rule) => {
    const token = rule.toLowerCase()
    if (token === '*' || token === '*/*') return true
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token || name.endsWith(`.${token}`)
  })
}

export function fileShouldChunk(size: number, schema: SchemaObject): boolean {
  const useChunk = schema.useChunk
  const chunkSize = Number(schema.chunkSize) > 0 ? Number(schema.chunkSize) : 5 * 1024 * 1024
  if (useChunk === true) return true
  if (useChunk === false) return false
  return size > chunkSize
}

export function fileChunkSize(schema: SchemaObject): number {
  const n = Number(schema.chunkSize)
  return Number.isFinite(n) && n > 0 ? n : 5 * 1024 * 1024
}

export function fileConcurrency(schema: SchemaObject): number {
  const n = Number(schema.concurrency)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3
}

export function fileItemName(item: FileItem, schema: SchemaObject): string {
  const nameField = fileFieldName(schema, 'name')
  const raw = item[nameField] ?? item.filename ?? item.name
  return raw == null ? '' : String(raw)
}

export function fileItemUrl(item: FileItem, schema: SchemaObject): unknown {
  const urlField = fileFieldName(schema, 'url')
  const valueField = fileFieldName(schema, 'value')
  return item[urlField] ?? item[valueField]
}

export function isFileValueState(state: unknown): boolean {
  return typeof state === 'string' && VALUE_STATES.has(state as FileItemState)
}

export function filesToFormValue(files: FileItem[], schema: SchemaObject): unknown {
  const kept = files.filter((item) => isFileValueState(item.state))
  const valueField = fileFieldName(schema, 'value')
  const multiple = schema.multiple === true
  const asBlob = schema.asBlob === true
  const extract = schema.extractValue === true || asBlob
  let value: unknown = multiple ? kept : kept[0]
  if (!value) return schema.resetValue === undefined ? '' : schema.resetValue
  if (extract) {
    return Array.isArray(value)
      ? (value as FileItem[]).map((item) => item[valueField])
      : (value as FileItem)[valueField]
  }
  if (fileJoinValues(schema)) {
    return Array.isArray(value)
      ? (value as FileItem[]).map((item) => item[valueField]).join(fileDelimiter(schema))
      : (value as FileItem)[valueField]
  }
  return value
}

export function valueToFileItem(
  value: unknown,
  schema: SchemaObject,
  prev?: FileItem[],
): FileItem | undefined {
  if (value == null || value === '') return undefined
  const valueField = fileFieldName(schema, 'value')
  const urlField = fileFieldName(schema, 'url')
  const nameField = fileFieldName(schema, 'name')
  if (typeof File !== 'undefined' && value instanceof File) {
    return {
      state: 'ready',
      [valueField]: value,
      [urlField]: value,
      [nameField]: value.name,
      name: value.name,
      size: value.size,
      id: fileGuid(),
      file: value,
    }
  }
  if (typeof value === 'string') {
    const hit = prev?.find((item) => String(item[valueField] ?? '') === value)
    return {
      state: (hit?.state as FileItemState) || 'init',
      [valueField]: value,
      [urlField]: value,
      [nameField]: hit?.name || (/^data:/.test(value) ? 'base64数据' : getNameFromUrl(value)),
      name: hit?.name || (/^data:/.test(value) ? 'base64数据' : getNameFromUrl(value)),
      id: hit?.id || fileGuid(),
      ...(hit?.size != null ? { size: hit.size } : {}),
    }
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const rec = value as FileItem
    return {
      ...rec,
      id: rec.id ? String(rec.id) : fileGuid(),
      state: (rec.state as FileItemState) || 'init',
    }
  }
  return undefined
}

export function parseFileValue(value: unknown, schema: SchemaObject, prev: FileItem[] = []): FileItem[] {
  if (value == null || value === '') return []
  if (typeof Blob !== 'undefined' && value instanceof Blob && !(value instanceof File)) {
    const item = valueToFileItem(value, schema, prev)
    return item ? [item] : []
  }
  const join = fileJoinValues(schema)
  const delimiter = fileDelimiter(schema)
  const list = Array.isArray(value)
    ? value
    : join && typeof value === 'string'
      ? value.split(delimiter).filter((item) => item !== '')
      : [value]
  return list.map((item) => valueToFileItem(item, schema, prev)).filter(Boolean) as FileItem[]
}

export function nativeFilesFromList(list: FileList | File[] | null | undefined): File[] {
  if (!list) return []
  return Array.prototype.slice.call(list) as File[]
}

export function fileEventSnapshot(item: FileItem): Record<string, unknown> {
  return {
    name: item.name,
    value: item.value,
    state: item.state,
    error: item.error,
  }
}
