<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import {
  SchemaRenderer,
  copyToClipboard,
  createVamisEvent,
  eventEvalData,
  filterTpl,
  resolveClassName,
  resolveIcon,
  runAction,
  runOnEvent,
  table2ColumnsTogglable,
  table2Source,
  useEnv,
  useScoped,
  type ActionSchema,
  type SchemaObject,
} from '@vamis/core'
import IconMark from './IconMark.vue'
import PopOverHost from './PopOverHost.vue'
import ColumnToggler from './data/ColumnToggler.vue'
import { provideColumnToggle, useColumnToggle } from './data/crudHost'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
  items?: Record<string, any>[]
}>()

const env = useEnv()
const scoped = useScoped()
const selectable = computed(() => props.schema.selectable === true)
const multiple = computed(() => props.schema.multiple === true)
const showIndex = computed(() => props.schema.showIndex === true)
const draggable = computed(() => props.schema.draggable === true)
const checkOnItemClick = computed(() => props.schema.checkOnItemClick === true)
const resizable = computed(() => props.schema.resizable !== false)
const colWidths = ref<Record<number, number>>({})
const resizingCol = ref(-1)
const emptyUid = useId().replace(/:/g, '')
const tableFixed = computed(
  () => props.schema.tableLayout === 'fixed' || Object.keys(colWidths.value).length > 0,
)
const extraCols = computed(() => (draggable.value ? 1 : 0) + (selectable.value ? 1 : 0) + (showIndex.value ? 1 : 0))
const localRows = ref<Record<string, any>[] | null>(null)
const selected = ref<number[]>([])
const columnFilters = ref<Record<string, string>>({})
const editingCell = ref('')
const draftValue = ref('')
const copyIcon = resolveIcon('copy', { vendor: 'fa' })

function quickEditConfig(col: SchemaObject) {
  const raw = col.quickEdit
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : raw === true ? {} : null
}

function quickEditType(col: SchemaObject): string {
  const conf = quickEditConfig(col)
  return String(conf?.type || 'input-text')
}

function quickEditOptions(col: SchemaObject): Array<{ label: string; value: string }> {
  const raw = quickEditConfig(col)?.options
  if (!Array.isArray(raw)) return []
  return raw.map((item) =>
    item && typeof item === 'object'
      ? { label: String((item as Record<string, unknown>).label ?? (item as Record<string, unknown>).value ?? ''), value: String((item as Record<string, unknown>).value ?? '') }
      : { label: String(item), value: String(item) },
  )
}

function quickEditable(col: SchemaObject) {
  return quickEditConfig(col) != null
}

function cellKey(row: Record<string, any>, col: SchemaObject) {
  return `${row.id ?? row.name ?? ''}-${String(col.name || '')}`
}

function startEdit(row: Record<string, any>, col: SchemaObject) {
  const conf = quickEditConfig(col)
  if (!conf || row[String(col.name || '')] == null) return
  editingCell.value = cellKey(row, col)
  draftValue.value = String(row[String(col.name || '')] ?? '')
}

async function commitEdit(row: Record<string, any>, col: SchemaObject) {
  const field = String(col.name || '')
  if (!field || !editingCell.value) return
  const value = draftValue.value
  row[field] = value
  editingCell.value = ''
  const payload = { ...(props.data || {}), ...row, name: field, value }
  const event = createVamisEvent('quickEdit', payload)
  await runOnEvent(props.schema, 'quickEdit', { env, data: eventEvalData(payload, event), scoped, event })
}

function cancelEdit() {
  editingCell.value = ''
}
const filterableColumns = computed(() =>
  columns.value.filter((col) => col.searchable === true || (col.filterable && typeof col.filterable === 'object')),
)
const filteredRows = computed(() => {
  const active = Object.entries(columnFilters.value).filter(([, value]) => value !== '')
  if (!active.length) return rows.value
  return rows.value.filter((row) =>
    active.every(([field, query]) => String(row?.[field] ?? '').toLowerCase().includes(query.toLowerCase())),
  )
})

async function setColumnFilter(col: SchemaObject, value: string) {
  const field = String(col.name || '')
  if (!field) return
  columnFilters.value = { ...columnFilters.value, [field]: value }
  const isSearch = col.searchable === true
  const payload = isSearch
    ? { ...(props.data || {}), searchName: field, searchValue: value }
    : { ...(props.data || {}), filterName: field, filterValue: value }
  const eventName = isSearch ? 'columnSearch' : 'columnFilter'
  const event = createVamisEvent(eventName, payload)
  await runOnEvent(props.schema, eventName, { env, data: eventEvalData(payload, event), scoped, event })
}

function filterOptions(col: SchemaObject): Array<{ label: string; value: string }> {
  const raw = col.filterable && typeof col.filterable === 'object' ? (col.filterable as Record<string, unknown>).options : undefined
  if (!Array.isArray(raw)) return []
  return raw.map((item) =>
    item && typeof item === 'object'
      ? { label: String((item as Record<string, unknown>).label ?? (item as Record<string, unknown>).value ?? ''), value: String((item as Record<string, unknown>).value ?? '') }
      : { label: String(item), value: String(item) },
  )
}
const prefixRow = computed(() => (Array.isArray(props.schema.prefixRow) ? props.schema.prefixRow : []) as SchemaObject[])
const affixRow = computed(() => (Array.isArray(props.schema.affixRow) ? props.schema.affixRow : []) as SchemaObject[])
const summaryData = computed(() => ({ ...(props.data || {}), rows: rows.value }))
function summaryCell(cell: SchemaObject): SchemaObject {
  return cell?.type === 'text' && cell.text != null ? { type: 'tpl', tpl: cell.text } : cell
}
function summaryClass(expr: unknown) {
  if (expr == null || expr === '') return ''
  return typeof expr === 'string' && expr.includes('${') ? resolveClassName(expr, summaryData.value) : String(expr)
}

const hasGroups = computed(() => columns.value.some((col) => col.groupName != null && col.groupName !== ''))
const headerGroups = computed(() => {
  const groups: Array<{ label: string; span: number }> = []
  for (const col of columns.value) {
    const label = col.groupName != null ? String(col.groupName) : ''
    if (!label) {
      groups.push({ label: '', span: 1 })
      continue
    }
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.span += 1
    else groups.push({ label, span: 1 })
  }
  return groups
})
const combineNum = computed(() => {
  const n = Number(props.schema.combineNum)
  return Number.isFinite(n) && n > 0 ? n : 0
})
const combineFrom = computed(() => {
  const n = Number(props.schema.combineFromIndex)
  return Number.isFinite(n) && n >= 0 ? n : 0
})
const mergeMap = computed(() => {
  const map: Record<string, { skip: boolean; rowspan: number }> = {}
  const rows = displayRows.value
  const cols = columns.value
  const num = combineNum.value
  if (!num) return map
  const from = combineFrom.value
  const same = (a: Record<string, any>, b: Record<string, any>) => {
    for (let i = from; i < from + num && i < cols.length; i++) {
      const key = String(cols[i]?.name || '')
      if (!key) continue
      if (String(a?.[key] ?? '') !== String(b?.[key] ?? '')) return false
    }
    return true
  }
  let i = 0
  while (i < rows.length) {
    let span = 1
    while (i + span < rows.length && same(rows[i], rows[i + span])) span++
    for (let r = i; r < i + span; r++) {
      for (let c = from; c < from + num && c < cols.length; c++) {
        map[`${r}-${c}`] = { skip: r > i, rowspan: r === i ? span : 0 }
      }
    }
    i += span
  }
  return map
})

function cellMeta(rowIndex: number, colIndex: number) {
  return mergeMap.value[`${rowIndex}-${colIndex}`]
}
const sortState = ref<{ key: string; dir: 'asc' | 'desc' } | null>(null)
const sortedRows = computed(() => {
  const state = sortState.value
  if (!state) return filteredRows.value
  const field = state.key
  return [...filteredRows.value].sort((a, b) => {
    const av = a?.[field]
    const bv = b?.[field]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    const diff = String(av).localeCompare(String(bv), 'zh-CN', { numeric: true })
    return state.dir === 'asc' ? diff : -diff
  })
})

const childrenField = computed(() => String(props.schema.childrenColumnName || 'children'))
const expandedKeys = ref<Set<string>>(new Set())

function childrenOf(row: Record<string, any>) {
  const list = row?.[childrenField.value]
  return Array.isArray(list) ? (list as Record<string, any>[]) : []
}

function rowIdOf(row: Record<string, any>, index: number) {
  return String(row?.id ?? index)
}

function isExpanded(row: Record<string, any>, index: number) {
  return expandedKeys.value.has(rowIdOf(row, index))
}

function toggleExpand(row: Record<string, any>, index: number) {
  const key = rowIdOf(row, index)
  const next = new Set(expandedKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedKeys.value = next
}

function toggleKey(key: string) {
  const next = new Set(expandedKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedKeys.value = next
}

function nestedRowsFor(row: Record<string, any>, index: number) {
  const out: Array<{
    child: Record<string, any>
    depth: number
    key: string
    hasChildren: boolean
    expanded: boolean
    indexPath: number[]
  }> = []
  const walk = (children: Record<string, any>[], base: string, depth: number, parentPath: number[]) => {
    children.forEach((child, ci) => {
      const key = `${base}/${ci}`
      const kids = childrenOf(child)
      const expanded = expandedKeys.value.has(key)
      const indexPath = [...parentPath, ci]
      out.push({ child, depth, key, hasChildren: kids.length > 0, expanded, indexPath })
      if (kids.length && expanded) walk(kids, key, depth + 1, indexPath)
    })
  }
  walk(childrenOf(row), rowIdOf(row, index), 1, [index])
  return out
}

function indexText(path: number[]) {
  return path.map((n) => n + 1).join('.')
}

const dragFrom = ref(-1)
const dragOrder = ref<number[] | null>(null)
const displayRows = computed(() => {
  if (!dragOrder.value) return sortedRows.value
  return dragOrder.value.map((i) => sortedRows.value[i]).filter(Boolean)
})

function onDragStartRow(index: number, event: DragEvent) {
  if (!draggable.value) return
  dragFrom.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

async function onDropRow(index: number, event: DragEvent) {
  event.preventDefault()
  if (!draggable.value || dragFrom.value < 0 || dragFrom.value === index) return
  const base = dragOrder.value || displayRows.value.map((_, i) => i)
  const next = [...base]
  const [moved] = next.splice(dragFrom.value, 1)
  next.splice(index, 0, moved)
  dragOrder.value = next
  dragFrom.value = -1
  const movedItems = next.map((i) => sortedRows.value[i]).filter(Boolean)
  const payload = { ...(props.data || {}), movedItems }
  const ev = createVamisEvent('orderChange', payload)
  await runOnEvent(props.schema, 'orderChange', { env, data: eventEvalData(payload, ev), scoped, event: ev })
}

async function sortBy(col: SchemaObject) {
  if (col.sortable !== true) return
  const field = String(col.sortBy || col.name || '')
  if (!field) return
  const next =
    !sortState.value || sortState.value.key !== field
      ? { key: field, dir: 'asc' as const }
      : sortState.value.dir === 'asc'
        ? { key: field, dir: 'desc' as const }
        : null
  sortState.value = next
  const payload = {
    ...(props.data || {}),
    orderBy: next?.key || '',
    orderDir: next?.dir || '',
  }
  const event = createVamisEvent('columnSort', payload)
  await runOnEvent(props.schema, 'columnSort', { env, data: eventEvalData(payload, event), scoped, event })
}

function sortIcon(col: SchemaObject) {
  const field = String(col.sortBy || col.name || '')
  if (sortState.value?.key !== field) return '↕'
  return sortState.value.dir === 'asc' ? '↑' : '↓'
}

async function emitSelected() {
  const selectedItems = selected.value.map((i) => displayRows.value[i]).filter(Boolean)
  const unSelectedItems = displayRows.value.filter((_, i) => !selected.value.includes(i))
  const payload = {
    ...(props.data || {}),
    selectedItems,
    selectedIndexes: selected.value.map(String),
    unSelectedItems,
  }
  const ev = createVamisEvent('selectedChange', payload)
  await runOnEvent(props.schema, 'selectedChange', { env, data: eventEvalData(payload, ev), scoped, event: ev })
}

function toggle(i: number) {
  if (multiple.value) selected.value = selected.value.includes(i) ? selected.value.filter((n) => n !== i) : [...selected.value, i]
  else selected.value = selected.value[0] === i ? [] : [i]
  void emitSelected()
}

function allSelected() {
  return displayRows.value.length > 0 && selected.value.length === displayRows.value.length
}

function toggleAll() {
  if (!multiple.value) return
  selected.value = allSelected() ? [] : displayRows.value.map((_, i) => i)
  void emitSelected()
}

function isSelected(i: number) {
  return selected.value.includes(i)
}

async function emitRowEvent(name: string, row: Record<string, any>, i: number, event?: Event) {
  const payload = { ...(props.data || {}), ...row, item: row, index: i, indexPath: String(i) }
  const ev = createVamisEvent(name, payload, event)
  await runOnEvent(props.schema, name, { env, data: eventEvalData(payload, ev), scoped, event: ev })
  return ev
}

async function handleRowClick(row: Record<string, any>, i: number, event: MouseEvent) {
  if (selectable.value && checkOnItemClick.value && !props.schema.itemAction) toggle(i)
  const ev = await emitRowEvent('rowClick', row, i, event)
  if (ev.prevented) return
  await onRowClick(row, event)
}

const tableApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => ({
    items: displayRows.value,
    rows: displayRows.value,
    total: rows.value.length,
    selectedItems: selected.value.map((i) => displayRows.value[i]).filter(Boolean),
  }),
  setData(values: Record<string, unknown>) {
    if (Array.isArray(values)) {
      localRows.value = values as Record<string, any>[]
      selected.value = []
      return
    }
    if (!values || typeof values !== 'object') return
    const next = (values as Record<string, unknown>).items ?? (values as Record<string, unknown>).rows
    if (Array.isArray(next)) {
      localRows.value = next as Record<string, any>[]
      selected.value = []
    }
  },
  async doAction(action: { actionType?: string; args?: { index?: string | number } }) {
    const type = action?.actionType
    if (type === 'selectAll') {
      selected.value = displayRows.value.map((_, i) => i)
      void emitSelected()
    } else if (type === 'clearAll') {
      selected.value = []
      void emitSelected()
    } else if (type === 'select') {
      selected.value = String(action.args?.index ?? '')
        .split(',')
        .map((part) => Number(part.trim()))
        .filter((n) => Number.isFinite(n) && displayRows.value[n])
      void emitSelected()
    }
  },
}
scoped?.register(tableApi as never)
let resizeStartX = 0
let resizeStartW = 0
let resizeIndex = -1

function onColResizeMove(event: MouseEvent) {
  if (resizeIndex < 0) return
  const next = Math.max(30, resizeStartW + event.clientX - resizeStartX)
  colWidths.value = { ...colWidths.value, [resizeIndex]: next }
}

function onColResizeUp() {
  resizingCol.value = -1
  resizeIndex = -1
  document.removeEventListener('mousemove', onColResizeMove)
  document.removeEventListener('mouseup', onColResizeUp)
}

function onColResizeDown(index: number, event: MouseEvent) {
  if (!resizable.value) return
  event.preventDefault()
  event.stopPropagation()
  const th = (event.currentTarget as HTMLElement).closest('th')
  resizeStartX = event.clientX
  resizeStartW = colWidths.value[index] ?? th?.getBoundingClientRect().width ?? 80
  resizeIndex = index
  resizingCol.value = index
  document.addEventListener('mousemove', onColResizeMove)
  document.addEventListener('mouseup', onColResizeUp)
}

onBeforeUnmount(() => {
  onColResizeUp()
  scoped?.unregister(tableApi as never)
})
const allColumns = computed(() => (props.schema.columns || []) as SchemaObject[])
const columnToggle = useColumnToggle(allColumns)
provideColumnToggle(columnToggle)
const showToggler = computed(() => table2ColumnsTogglable(props.schema, allColumns.value.length))
const columns = computed(() => columnToggle.visibleColumns.value)

function cellIsRenderer(col: SchemaObject) {
  const type = String(col.type || '')
  return !!type && type !== 'text' && type !== 'plain'
}

/** 对齐 Amis TableCell：内层走列 type，非 button 去掉 label，避免 FormItem 再画「开关」。
 *  列 `name` 只用来从行上取值，不传给内层（对照 named 探针、原生 [name]）。 */
function cellSchema(col: SchemaObject, row: Record<string, any> = {}): SchemaObject {
  const type = String(col.type || 'plain')
  const next: SchemaObject = { ...col, type }
  if (type !== 'button' && type !== 'dropdown-button' && type !== 'action') next.label = false
  const field = col.name != null ? String(col.name) : ''
  if (field && Object.prototype.hasOwnProperty.call(row, field)) {
    if (next.value == null) next.value = row[field]
    if ((type === 'image' || type === 'static-image') && next.src == null) next.src = row[field]
  }
  delete next.name
  return next
}

function colWidth(col: SchemaObject): number {
  const w = Number(col.width)
  return Number.isFinite(w) && w > 0 ? w : 120
}

function fixedStyle(col: SchemaObject, index: number) {
  const side = col.fixed === 'left' || col.fixed === 'right' ? col.fixed : ''
  if (!side) return undefined
  const fixedCols = columns.value
    .slice(0, side === 'left' ? index : columns.value.length)
    .filter((item, i) => item.fixed === side && (side === 'left' ? i < index : i > index))
  const offset = extraCols.value * 30 + fixedCols.reduce((sum, item) => sum + colWidth(item), 0)
  return {
    position: 'sticky' as const,
    left: side === 'left' ? `${offset}px` : undefined,
    right: side === 'right' ? `${offset}px` : undefined,
    zIndex: 1,
    background: 'var(--card)',
  }
}

function colWidthStyle(col: SchemaObject, index?: number) {
  if (index != null && colWidths.value[index] != null) {
    const value = `${colWidths.value[index]}px`
    return { width: value, minWidth: value }
  }
  const w = col.width
  if (w == null || w === '') return undefined
  const value = typeof w === 'number' ? `${w}px` : String(w)
  return { width: value, maxWidth: value, overflow: 'hidden' }
}

function colAlignStyle(col: SchemaObject, isHead = false) {
  const align = isHead ? col.headerAlign || col.align : col.align
  const vAlign = isHead ? undefined : col.vAlign
  const style: Record<string, string> = {}
  if (align) style.textAlign = String(align)
  if (vAlign) style.verticalAlign = String(vAlign)
  return Object.keys(style).length ? style : undefined
}

function colHeadClass(col: SchemaObject) {
  return [
    resolveClassName(col.className, props.data || {}),
    resolveClassName(col.labelClassName, props.data || {}),
    col.sortable === true ? 'cursor-pointer select-none' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function colCellClass(col: SchemaObject, row: Record<string, any>, rowIndex: number, colIndex: number) {
  return [
    resolveClassName(col.className, row),
    resolveClassName(col.classNameExpr, row),
    cellMeta(rowIndex, colIndex)?.skip ? 'invisible' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function cellStyle(col: SchemaObject, colIndex: number, isHead = false) {
  return [colWidthStyle(col, colIndex), fixedStyle(col, colIndex), colAlignStyle(col, isHead)]
}

function colCopyable(col: SchemaObject) {
  return col.copyable === true || (col.copyable != null && typeof col.copyable === 'object')
}

function copyContentOf(col: SchemaObject, row: Record<string, any>) {
  const conf = col.copyable
  const raw =
    conf && typeof conf === 'object' && !Array.isArray(conf) && (conf as SchemaObject).content != null
      ? String((conf as SchemaObject).content)
      : col.name != null
        ? '${' + String(col.name) + ' | raw}'
        : String(row[String(col.name || '')] ?? '')
  return filterTpl(raw, { ...(props.data || {}), ...row })
}

function copyTipOf(col: SchemaObject, row: Record<string, any>) {
  const conf = col.copyable
  if (conf && typeof conf === 'object' && !Array.isArray(conf) && conf.tooltip != null) {
    return filterTpl(String(conf.tooltip), { ...(props.data || {}), ...row })
  }
  return '复制'
}

async function copyCell(col: SchemaObject, row: Record<string, any>) {
  const content = copyContentOf(col, row)
  if (!content) return
  try {
    await copyToClipboard(content)
  } catch {
    /* 宿主禁用剪贴板时静默失败 */
  }
}

const rows = computed<Record<string, any>[]>(() => {
  if (localRows.value) return localRows.value
  return table2Source(props.schema, props.data || {}, props.items)
})
const colSpan = computed(() => Math.max(columns.value.length + extraCols.value, 1))
const wrapClass = computed(() =>
  [
    'vamis-table-wrap',
    tableFixed.value ? 'is-fixed' : '',
    resizingCol.value >= 0 ? 'is-col-resizing' : '',
    resolveClassName(props.schema.className, props.data || {}),
  ]
    .filter(Boolean)
    .join(' '),
)
const tableClass = computed(() => resolveClassName(props.schema.tableClassName, props.data || {}))

async function onRowClick(row: Record<string, any>, event: MouseEvent) {
  const action = props.schema.itemAction
  if (!action || typeof action !== 'object') return
  await runAction(action as ActionSchema, {
    env,
    data: { ...(props.data || {}), ...row },
    scoped,
  })
}

function rowClass(row: Record<string, any>) {
  return [
    resolveClassName(props.schema.rowClassName, row),
    resolveClassName(props.schema.rowClassNameExpr, row),
  ]
    .filter(Boolean)
    .join(' ')
}

function cellText(col: SchemaObject, row: Record<string, any>) {
  if (col.name == null) return ''
  const value = row[col.name]
  if (value == null || value === '') return String(col.placeholder ?? '')
  return String(value)
}
</script>

<template>
  <div :class="wrapClass">
  <div v-if="filterableColumns.length" class="vamis-table__filters">
    <label v-for="col in filterableColumns" :key="col.name || col.label" class="vamis-table__filter">
      <span>{{ col.label || col.name }}</span>
      <select
        v-if="col.filterable && filterOptions(col).length"
        class="vamis-table__filter-input"
        :value="columnFilters[String(col.name || '')] || ''"
        @change="setColumnFilter(col, ($event.target as HTMLSelectElement).value)"
      >
        <option value="">全部</option>
        <option v-for="opt in filterOptions(col)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input
        v-else
        class="vamis-table__filter-input vamis-table__filter-input--search"
        :value="columnFilters[String(col.name || '')] || ''"
        :placeholder="`搜索${col.label || col.name || ''}`"
        @input="setColumnFilter(col, ($event.target as HTMLInputElement).value)"
      >
    </label>
  </div>
  <div v-if="schema.title || showToggler" class="vamis-table__title">
    <ColumnToggler v-if="showToggler" :schema="{ type: 'column-toggler', label: false }" />
    <span v-if="schema.title">{{ schema.title }}</span>
  </div>
  <Table :class="tableClass">
    <TableHeader>
      <TableRow v-if="hasGroups">
        <TableHead v-if="draggable" :rowspan="2" class="vamis-table__drag-cell" />
        <TableHead v-if="selectable" :rowspan="2" class="vamis-table__check-cell">
          <input
            v-if="multiple"
            type="checkbox"
            :checked="allSelected()"
            @change="toggleAll"
          >
        </TableHead>
        <TableHead v-if="showIndex" :rowspan="2" class="vamis-table__index-cell">序号</TableHead>
        <TableHead v-for="(group, gi) in headerGroups" :key="'g' + gi" :colspan="group.span" class="text-center">
          {{ group.label }}
        </TableHead>
      </TableRow>
      <TableRow>
        <TableHead v-if="draggable && !hasGroups" class="vamis-table__drag-cell" />
        <TableHead v-if="selectable && !hasGroups" class="vamis-table__check-cell">
          <input
            v-if="multiple"
            type="checkbox"
            :checked="allSelected()"
            @change="toggleAll"
          >
        </TableHead>
        <TableHead v-if="showIndex && !hasGroups" class="vamis-table__index-cell">序号</TableHead>
        <TableHead
          v-for="(col, ci) in columns"
          :key="`${col.name || col.label || ''}`"
          :style="cellStyle(col, ci, true)"
          :class="colHeadClass(col)"
          @click="sortBy(col)"
        >
          {{ col.label || col.name }}
          <span v-if="col.sortable === true" class="vamis-table__sort">{{ sortIcon(col) }}</span>
          <div
            v-if="resizable"
            class="vamis-table__col-resizer"
            :class="{ 'is-resizing': resizingCol === ci, 'is-last': ci === columns.length - 1 }"
            @mousedown="onColResizeDown(ci, $event)"
            @click.stop
          />
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="prefixRow.length" :class="summaryClass(schema.prefixRowClassName)">
        <TableCell v-for="(cell, ci) in prefixRow" :key="'p' + ci" :colspan="cell.colSpan ?? 1">
          <SchemaRenderer :schema="summaryCell(cell)" :extra-data="summaryData" />
        </TableCell>
      </TableRow>
      <TableRow v-if="!rows.length" class="vamis-table__placeholder">
        <TableCell :colspan="colSpan" class="vamis-table__empty">
          <svg
            class="vamis-table__empty-icon icon"
            data-icon="desk-empty"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient x1="16.498%" y1="38.528%" x2="56.262%" y2="63.185%" :id="emptyUid + '-a'">
                <stop stop-color="#DCE0EF" offset="0%" />
                <stop stop-color="#DCDFEA" offset="100%" />
              </linearGradient>
              <linearGradient x1="28.893%" y1="55.707%" x2="93.898%" y2="48.876%" :id="emptyUid + '-b'">
                <stop stop-color="#F1F3FA" offset="0%" />
                <stop stop-color="#E8EAF0" offset="100%" />
              </linearGradient>
            </defs>
            <g fill="none" fill-rule="evenodd">
              <path d="M0 0h100v100H0z" />
              <ellipse :fill="`url(#${emptyUid}-a)`" fill-rule="nonzero" cx="50" cy="60.8" rx="44.4" ry="22.8" />
              <ellipse :fill="`url(#${emptyUid}-b)`" fill-rule="nonzero" cx="50" cy="58.4" rx="44.4" ry="22.8" />
              <path
                d="M69.343 42.018c6.904 3.985 10.08 11.235 10.057 19.162-.011 3.963-1.42 6.745-3.683 8.05-2.275 1.284-5.406 1.082-8.853-.9L34.857 50.868C27.953 46.882 22.377 37.22 22.4 29.294c.023-7.927 5.643-11.113 12.547-7.127.89.506 1.746 1.103 2.579 1.79.766-8.096 7.05-11.136 14.675-6.745 7.614 4.392 13.865 14.672 14.574 23.623.823.27 1.69.676 2.568 1.183Z"
                fill="#E0E3EF"
                fill-rule="nonzero"
              />
              <path
                d="M42.92 29.682a.81.81 0 0 1 1.263-.671l4.86 3.274a.81.81 0 0 1 .357.672v8.163l-1.129-.715 1.129.761v7.123a.81.81 0 0 1-1.243.684l-4.86-3.076a.81.81 0 0 1-.377-.684v-15.53Z"
                fill="#FFF"
                fill-rule="nonzero"
              />
              <path
                d="m53.903 44.13 4.86 3.275a.81.81 0 0 1 .357.672v6.692a.81.81 0 0 1-1.243.684l-4.86-3.076a.81.81 0 0 1-.377-.684v-6.89a.81.81 0 0 1 1.263-.672Z"
                fill="#F7F8FB"
                fill-rule="nonzero"
              />
            </g>
          </svg>
          {{ schema.placeholder || '暂无数据' }}
        </TableCell>
      </TableRow>
      <template v-for="(row, i) in displayRows" :key="row.id ?? i">
        <TableRow
          :class="[rowClass(row), { 'is-checked': isSelected(i) }]"
          :data-state="isSelected(i) ? 'selected' : undefined"
          :draggable="draggable"
          @click="handleRowClick(row, i, $event)"
          @dblclick="emitRowEvent('rowDbClick', row, i, $event)"
          @mouseenter="emitRowEvent('rowMouseEnter', row, i, $event)"
          @mouseleave="emitRowEvent('rowMouseLeave', row, i, $event)"
          @dragstart="onDragStartRow(i, $event)"
          @dragover.prevent
          @drop="onDropRow(i, $event)"
        >
          <TableCell v-if="draggable" class="vamis-table__drag-cell">
            <span class="vamis-table__drag" title="拖动排序" @click.stop>
              <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
                <g transform="translate(5 1)" fill="currentColor">
                  <circle cx="1" cy="1" r="1" />
                  <circle cx="5" cy="1" r="1" />
                  <circle cx="1" cy="5" r="1" />
                  <circle cx="5" cy="5" r="1" />
                  <circle cx="1" cy="9" r="1" />
                  <circle cx="5" cy="9" r="1" />
                  <circle cx="1" cy="13" r="1" />
                  <circle cx="5" cy="13" r="1" />
                </g>
              </svg>
            </span>
          </TableCell>
          <TableCell v-if="selectable" class="vamis-table__check-cell">
            <button
              v-if="!multiple"
              type="button"
              class="vamis-radio-dot"
              role="radio"
              :aria-checked="isSelected(i)"
              @click.stop="toggle(i)"
            />
            <input
              v-else
              type="checkbox"
              :checked="isSelected(i)"
              @click.stop
              @change="toggle(i)"
            >
          </TableCell>
          <TableCell v-if="showIndex" class="vamis-table__index-cell">{{ indexText([i]) }}</TableCell>
          <TableCell
            v-for="(col, ci) in columns"
            :key="`${col.name || col.label || ''}`"
            :style="cellStyle(col, ci)"
            :rowspan="cellMeta(i, ci)?.rowspan"
            :class="colCellClass(col, row, i, ci)"
          >
            <button
              v-if="ci === 0 && childrenOf(row).length"
              type="button"
              class="vamis-table__expand"
              :aria-label="isExpanded(row, i) ? '收起' : '展开'"
              @click.stop="toggleExpand(row, i)"
            >{{ isExpanded(row, i) ? '▾' : '▸' }}</button>
            <template v-if="quickEditable(col)">
              <select
                v-if="editingCell === cellKey(row, col) && quickEditType(col) === 'select'"
                v-model="draftValue"
                class="vamis-table__edit"
                autofocus
                @click.stop
                @change="commitEdit(row, col)"
                @blur="commitEdit(row, col)"
              >
                <option v-for="opt in quickEditOptions(col)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <textarea
                v-else-if="editingCell === cellKey(row, col) && quickEditType(col) === 'textarea'"
                v-model="draftValue"
                class="vamis-table__edit vamis-table__edit--area"
                autofocus
                @click.stop
                @blur="commitEdit(row, col)"
              />
              <input
                v-else-if="editingCell === cellKey(row, col)"
                v-model="draftValue"
                :type="quickEditType(col) === 'input-number' ? 'number' : 'text'"
                class="vamis-table__edit"
                autofocus
                @click.stop
                @blur="commitEdit(row, col)"
                @keydown.enter.prevent="commitEdit(row, col)"
                @keydown.esc.prevent="cancelEdit"
              >
              <span v-else class="vamis-table__quick">
                {{ row[String(col.name || '')] ?? '' }}
                <button type="button" class="vamis-table__edit-btn" aria-label="编辑" @click.stop="startEdit(row, col)">✎</button>
              </span>
            </template>
            <template v-else-if="cellIsRenderer(col)">
              <SchemaRenderer :schema="cellSchema(col, row)" :extra-data="row" />
              <button
                v-if="colCopyable(col) && copyContentOf(col, row)"
                type="button"
                class="vamis-static__copy"
                :data-tooltip="copyTipOf(col, row)"
                data-position="right"
                :aria-label="copyTipOf(col, row)"
                @click.stop="copyCell(col, row)"
              >
                <IconMark :icon="copyIcon" img-class="inline-block size-4" />
              </button>
            </template>
            <PopOverHost v-else :schema="col" :data="row">
              <span>{{ cellText(col, row) }}</span>
              <button
                v-if="colCopyable(col) && copyContentOf(col, row)"
                type="button"
                class="vamis-static__copy"
                :data-tooltip="copyTipOf(col, row)"
                data-position="right"
                :aria-label="copyTipOf(col, row)"
                @click.stop="copyCell(col, row)"
              >
                <IconMark :icon="copyIcon" img-class="inline-block size-4" />
              </button>
            </PopOverHost>
          </TableCell>
        </TableRow>
        <TableRow
          v-for="item in isExpanded(row, i) ? nestedRowsFor(row, i) : []"
          :key="item.key"
          class="vamis-table__nested"
        >
          <TableCell v-if="draggable" class="vamis-table__drag-cell" />
          <TableCell v-if="selectable" class="vamis-table__check-cell" />
          <TableCell v-if="showIndex" class="vamis-table__index-cell">{{ indexText(item.indexPath) }}</TableCell>
            <TableCell v-for="(col, ci) in columns" :key="`c-${ci}`" :style="colWidthStyle(col, ci)">
            <span :style="ci === 0 ? { paddingLeft: `${(item.depth - 1) * 16 + 20}px` } : undefined">
              <button
                v-if="ci === 0 && item.hasChildren"
                type="button"
                class="vamis-table__expand"
                @click.stop="toggleKey(item.key)"
              >{{ item.expanded ? '▾' : '▸' }}</button>
              <SchemaRenderer v-if="cellIsRenderer(col)" :schema="cellSchema(col, item.child)" :extra-data="item.child" />
              <template v-else>{{ item.child[String(col.name || '')] ?? '' }}</template>
            </span>
          </TableCell>
        </TableRow>
      </template>
      <TableRow v-if="affixRow.length" :class="summaryClass(schema.affixRowClassName)">
        <TableCell v-for="(cell, ci) in affixRow" :key="'a' + ci" :colspan="cell.colSpan ?? 1">
          <SchemaRenderer :schema="summaryCell(cell)" :extra-data="summaryData" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
  </div>
</template>
