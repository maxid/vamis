import { computed, inject, provide, reactive, type ComputedRef, type InjectionKey } from 'vue'
import type { PlainObject, SchemaObject } from '@vamis/core'

export interface CrudHostApi {
  name?: string
  reload: (extra?: PlainObject) => Promise<void> | void
  primaryField: string
  selectedItems: PlainObject[]
  setSelectedItems: (items: PlainObject[]) => void
  getIds: () => string
}

export interface ColumnToggleApi {
  columns: ComputedRef<SchemaObject[]>
  togglableColumns: ComputedRef<SchemaObject[]>
  visibleColumns: ComputedRef<SchemaObject[]>
  isVisible: (col: SchemaObject, index?: number) => boolean
  setVisible: (col: SchemaObject, visible: boolean, index?: number) => void
}

export const CrudHostKey: InjectionKey<CrudHostApi> = Symbol('vamis-crud-host')
export const ColumnToggleKey: InjectionKey<ColumnToggleApi> = Symbol('vamis-column-toggle')

export function useCrudHost(): CrudHostApi | undefined {
  return inject(CrudHostKey, undefined)
}

export function useInjectedColumnToggle(): ColumnToggleApi | undefined {
  return inject(ColumnToggleKey, undefined)
}

export function colKey(col: SchemaObject, index = 0): string {
  return String(col.name || col.title || col.label || `col-${index}`)
}

export function useColumnToggle(columns: ComputedRef<SchemaObject[]>): ColumnToggleApi {
  const visibility = reactive<Record<string, boolean>>({})

  function isVisible(col: SchemaObject, index = 0) {
    const key = colKey(col, index)
    if (Object.prototype.hasOwnProperty.call(visibility, key)) return visibility[key]
    return col.toggled !== false
  }

  function setVisible(col: SchemaObject, visible: boolean, index = 0) {
    if (col.toggable === false) return
    visibility[colKey(col, index)] = visible
  }

  const visibleColumns = computed(() => columns.value.filter((col, i) => isVisible(col, i)))
  const togglableColumns = computed(() => columns.value.filter((col) => col.toggable !== false))

  return { columns, togglableColumns, visibleColumns, isVisible, setVisible }
}

export function provideColumnToggle(api: ColumnToggleApi) {
  provide(ColumnToggleKey, api)
  return api
}

export function provideCrudHost(api: CrudHostApi) {
  provide(CrudHostKey, api)
  return api
}

export function parseListPayload(payloadData: any): { items: any[]; total: number } {
  if (Array.isArray(payloadData)) return { items: payloadData, total: payloadData.length }
  const items = payloadData?.items || payloadData?.rows || payloadData?.list || []
  return { items, total: Number(payloadData?.total ?? items.length) }
}

export function resolveTableSource(
  schema: SchemaObject,
  data?: Record<string, any>,
  items?: Record<string, any>[],
): Record<string, any>[] {
  if (Array.isArray(items)) return items
  const source = schema.source
  if (typeof source === 'string' && source.includes('$') && data) {
    const key = source.replace(/^\$\{?|\}$/g, '')
    const value = data[key]
    if (Array.isArray(value)) return value
  }
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.rows)) return data.rows
  if (Array.isArray(schema.data)) return schema.data
  return []
}

export function toolbarType(node: unknown): string {
  if (typeof node === 'string') return node
  if (node && typeof node === 'object' && 'type' in (node as object)) {
    return String((node as SchemaObject).type || '')
  }
  return ''
}

export function asToolbarSchema(node: unknown): SchemaObject {
  if (typeof node === 'string') return { type: node }
  if (node && typeof node === 'object') return node as SchemaObject
  return { type: 'tpl', tpl: '' }
}

export function isBulkToolbar(node: unknown): boolean {
  const type = toolbarType(node)
  return type === 'bulkActions' || type === 'bulk-actions'
}

export function isPagerToolbar(node: unknown): boolean {
  const type = toolbarType(node)
  return type === 'pagination' || type === 'pagination-wrapper'
}

export function selectedIdsOf(items: PlainObject[], primaryField = 'id'): string {
  return items
    .map((item) => item[primaryField])
    .filter((id) => id != null && id !== '')
    .join(',')
}
