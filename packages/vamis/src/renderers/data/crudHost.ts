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
  /** 全选 / 全不选（`toggable: false` 的列不动）。 */
  setAll: (visible: boolean) => void
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

/**
 * 列显隐。key 按列在 `columns` 里的原始下标取（没有 name / label 的列才落到 `col-i`），
 * 调用方不用自己传下标。`onChange` 在作者点了显隐之后回调（Table 用它派 `columnToggled`）。
 */
export function useColumnToggle(
  columns: ComputedRef<SchemaObject[]>,
  onChange?: (visible: SchemaObject[]) => void,
  /** 作者没点过时的显隐（Table `persistKey` 从本地缓存恢复）；返回 `undefined` 落回 `toggled`。 */
  preset?: (col: SchemaObject, index: number) => boolean | undefined,
): ColumnToggleApi {
  const visibility = reactive<Record<string, boolean>>({})

  function keyOf(col: SchemaObject, index?: number) {
    const at = columns.value.indexOf(col)
    return colKey(col, at >= 0 ? at : index)
  }

  function isVisible(col: SchemaObject, index?: number) {
    const key = keyOf(col, index)
    // 必须读 `visibility[key]`：hasOwnProperty 不会收集依赖，点了显隐表格不重绘。
    const stored = visibility[key]
    if (stored !== undefined) return stored
    if (preset && col.toggable !== false) {
      const at = columns.value.indexOf(col)
      const saved = preset(col, at >= 0 ? at : index ?? 0)
      if (saved !== undefined) return saved
    }
    return col.toggled !== false
  }

  function setVisible(col: SchemaObject, visible: boolean, index?: number) {
    if (col.toggable === false) return
    visibility[keyOf(col, index)] = visible
    onChange?.(visibleColumns.value)
  }

  function setAll(visible: boolean) {
    for (const col of columns.value) {
      if (col.toggable === false) continue
      visibility[keyOf(col)] = visible
    }
    onChange?.(visibleColumns.value)
  }

  const visibleColumns = computed(() => columns.value.filter((col, i) => isVisible(col, i)))
  const togglableColumns = computed(() => columns.value.filter((col) => col.toggable !== false))

  return { columns, togglableColumns, visibleColumns, isVisible, setVisible, setAll }
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
  return { items, total: Number(payloadData?.total ?? payloadData?.count ?? items.length) }
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
