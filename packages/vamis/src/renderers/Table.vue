<script setup lang="ts">
/**
 * Table。对齐 Amis 6.13 `renderers/Table`：行树（嵌套 / Footable）、表头排序 / 搜索 / 过滤、
 * 固定列、合并单元格、超级表头、总结行、行角标、行悬浮按钮、拖拽排序、快速编辑与组件动作。
 * 纯逻辑在 `@vamis/core` 的 `utils/table.ts`，这里只管状态和 DOM。
 */
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, shallowRef, toRaw, watch, type Slot } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createVamisEvent,
  evalExpression,
  eventEvalData,
  filterTpl,
  getByPath,
  isVisible,
  overlayContainerFrom,
  requestApi,
  resolveClassName,
  resolveInlineStyle,
  runAction,
  runOnEvent,
  setByPathCopy,
  table2ColumnsTogglable,
  table2Source,
  tableAutoFillHeight,
  tableBackgroundScale,
  tableBordered,
  tableBreakpointMatch,
  tableBuildRows,
  tableColumnGroups,
  tableCombineKeys,
  tableCombineNum,
  tableCombineSpans,
  tableFilterOptions,
  tableFlattenRows,
  tableFootable,
  tableIndexText,
  tableMatchRows,
  tableRowPasses,
  tableSortRows,
  tableSummaryRow,
  tableSummaryRows,
  useEnv,
  useOverlay,
  useScoped,
  type ActionSchema,
  type SchemaApi,
  type SchemaNode,
  type SchemaObject,
  type TableRowNode,
  type TableSummaryCell,
} from '@vamis/core'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  VamisCaret,
  VamisSpinnerMark,
  VamisTableEmptyIcon,
  VamisTableIcon,
} from '@vamis/ui'
import BadgeHost from './BadgeHost.vue'
import ColumnToggler from './data/ColumnToggler.vue'
import { provideColumnToggle, useColumnToggle } from './data/crudHost'
import TableCellBody from './table/TableCellBody.vue'
import TableHeadFilter from './table/TableHeadFilter.vue'
import TableHeadSearch from './table/TableHeadSearch.vue'
import VamisTooltipLayer from '../overlay/VamisTooltipLayer.vue'

type Row = Record<string, any>

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
  items?: Record<string, any>[]
  /** SchemaRenderer 统一下发；声明掉以免落成根节点的 `disabled="false"`。 */
  disabled?: boolean
}>()

const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const ctx = computed<Row>(() => props.data || {})
const popContainer = computed(() => overlayContainerFrom({ popOverContainerSelector: props.schema.popOverContainerSelector }, env))

const selectable = computed(() => props.schema.selectable === true)
// Amis TableStore 默认 `multiple: true`（文档表里写 false 是笔误），只有显式 false 才是单选圆点。
const multiple = computed(() => props.schema.multiple !== false)
const showIndex = computed(() => props.schema.showIndex === true)
const draggable = computed(() => props.schema.draggable === true)
const checkOnItemClick = computed(() => props.schema.checkOnItemClick === true)
const resizable = computed(() => props.schema.resizable !== false)
const footable = computed(() => tableFootable(props.schema))
const childrenField = computed(() => String(props.schema.childrenColumnName || 'children'))

async function dispatch(name: string, payload: Row, native?: Event) {
  const full = { ...ctx.value, ...payload }
  const event = createVamisEvent(name, full, native)
  await runOnEvent(props.schema, name, { env, data: eventEvalData(full, event), scoped, overlay, event })
  return event
}

/* ------------------------------------------------------------------ 列 */

const rawColumns = computed(() => asArray(props.schema.columns).filter((col) => col && typeof col === 'object') as SchemaObject[])
const allColumns = computed(() => rawColumns.value.filter((col) => isVisible(col, ctx.value)))
/**
 * Amis `persistKey`：把藏起来的列记进 localStorage（`unToggledColumns`，key 取 name / label / 下标）。
 * Amis 没写时按页面路径缓存；Vamis 只有写了 `persistKey` 才缓存。
 */
const persistKey = computed(() => {
  const raw = props.schema.persistKey
  return typeof raw === 'string' && raw ? String(filterTpl(raw, ctx.value) || '') : ''
})

function persistColKey(col: SchemaObject, index: number) {
  return String(col.name || col.label || index)
}

function readPersistedHidden(): Set<string> | null {
  if (!persistKey.value || typeof localStorage === 'undefined') return null
  try {
    const meta = JSON.parse(localStorage.getItem(persistKey.value) || 'null')
    return Array.isArray(meta?.unToggledColumns) ? new Set<string>(meta.unToggledColumns.map(String)) : null
  } catch {
    return null
  }
}

const persistedHidden = shallowRef(readPersistedHidden())
watch(persistKey, () => {
  persistedHidden.value = readPersistedHidden()
})

function savePersistedHidden(visible: SchemaObject[]) {
  if (!persistKey.value || typeof localStorage === 'undefined') return
  const all = allColumns.value
  const hidden = all.filter((col) => !visible.includes(col)).map((col) => persistColKey(col, all.indexOf(col)))
  try {
    localStorage.setItem(
      persistKey.value,
      JSON.stringify({ unToggledColumns: hidden, columnOrder: all.map((col, i) => persistColKey(col, i)) }),
    )
  } catch {
    // 隐私模式 / 配额满：不缓存即可
  }
}

const columnToggle = useColumnToggle(
  allColumns,
  (visible) => {
    savePersistedHidden(visible)
    void dispatch('columnToggled', { columns: visible })
  },
  (col, index) => (persistedHidden.value ? !persistedHidden.value.has(persistColKey(col, index)) : undefined),
)
provideColumnToggle(columnToggle)
const showToggler = computed(() => table2ColumnsTogglable(props.schema, allColumns.value.length))

const viewport = ref(typeof window === 'undefined' ? 1280 : window.innerWidth)
/** Footable：命中 `breakpoint` 的列挪到展开行里（Amis `footableColumns`）。 */
const footColumns = computed(() =>
  footable.value.enabled
    ? columnToggle.visibleColumns.value.filter(
        (col) => col.breakpoint && tableBreakpointMatch(col.breakpoint, viewport.value),
      )
    : [],
)
const columns = computed(() =>
  footColumns.value.length
    ? columnToggle.visibleColumns.value.filter((col) => !footColumns.value.includes(col))
    : columnToggle.visibleColumns.value,
)

function colKey(col: SchemaObject) {
  const at = rawColumns.value.indexOf(col)
  return `${at}-${String(col.name ?? col.label ?? '')}`
}

function colLabel(col: SchemaObject) {
  const label = col.label ?? col.title
  return label == null || label === false ? '' : filterTpl(String(label), ctx.value)
}

/* ------------------------------------------------------------------ 行 */

const rowIds = new WeakMap<object, string>()
let rowSeq = 0

function idOfData(data: object): string {
  const raw = toRaw(data)
  let id = rowIds.get(raw)
  if (!id) {
    id = `r${++rowSeq}`
    rowIds.set(raw, id)
  }
  return id
}

/** 行被替换成新对象时把 id 带过去，勾选 / 展开 / 修改标记不丢。 */
function carryId(from: object, to: object) {
  rowIds.set(toRaw(to), idOfData(from))
}

const localRows = shallowRef<Row[] | null>(null)
const propItems = computed(() => table2Source(props.schema, ctx.value, props.items) as Row[])
const sourceItems = computed<Row[]>(() => localRows.value ?? propItems.value)

const searchValues = ref<Record<string, unknown>>({})
const filterValues = ref<Record<string, unknown>>({})
const sortState = ref<{ key: string; dir: 'asc' | 'desc' } | null>(null)

/** 表头搜索 / 过滤 / 排序的本地结果（只动顶层行）。 */
const baseItems = computed<Row[]>(() => {
  let list = sourceItems.value
  const searching = Object.values(searchValues.value).some((v) => v != null && v !== '')
  const filtering = Object.values(filterValues.value).some((v) => v != null && v !== '')
  if (searching || filtering) {
    list = list.filter((row) => tableRowPasses(row, searchValues.value, filterValues.value))
  }
  const sort = sortState.value
  if (sort) list = tableSortRows(list, sort.dir, (row) => row?.[sort.key])
  return list
})

const dragOrder = shallowRef<Row[] | null>(null)
const orderedItems = computed<Row[]>(() => dragOrder.value ?? baseItems.value)

const tree = computed<TableRowNode[]>(() => {
  const seen = new Set<string>()
  return tableBuildRows(orderedItems.value, childrenField.value, (row, path) => {
    let id = idOfData(row)
    if (seen.has(id)) id = `${id}@${path}`
    seen.add(id)
    return id
  })
})
const allRows = computed(() => tableFlattenRows(tree.value))

/* 懒加载子行。对齐 Amis：行数据 `defer: true` 且还没拉过时也算可展开，展开后用 `deferApi` 补全这一行。 */
const deferLoaded = ref<Set<string>>(new Set())
const deferLoading = ref<Set<string>>(new Set())
const deferErrors = ref<Record<string, string>>({})

function isDeferred(row: TableRowNode) {
  return !!row.data.defer && !deferLoaded.value.has(row.id)
}

const isNested = computed(() => tree.value.some((row) => row.children.length > 0 || isDeferred(row)))

function rowScope(row: TableRowNode): Row {
  return { ...ctx.value, index: row.index, ...row.data }
}

/* ------------------------------------------------------------------ 展开（嵌套 + Footable 共用） */

const expandedIds = ref<Set<string>>(new Set())

function rowExpandable(row: TableRowNode) {
  return row.children.length > 0 || isDeferred(row) || (footColumns.value.length > 0 && row.depth === 1)
}

function isExpanded(row: TableRowNode) {
  return expandedIds.value.has(row.id)
}

const expandConf = computed(() => {
  const conf = props.schema.expandConfig
  const own = conf && typeof conf === 'object' ? (conf as Row) : {}
  return {
    expand: footable.value.enabled && footable.value.expand !== 'none' ? footable.value.expand : String(own.expand || 'none'),
    accordion: footable.value.accordion || own.accordion === true,
  }
})

function initExpanded() {
  const next = new Set<string>()
  const { expand, accordion } = expandConf.value
  if (expand === 'first') {
    if (tree.value[0]) next.add(tree.value[0].id)
  } else if (expand === 'all' && !accordion) {
    for (const row of allRows.value) if (rowExpandable(row)) next.add(row.id)
  }
  expandedIds.value = next
}

function setExpanded(row: TableRowNode, value: boolean) {
  const next = new Set(expandedIds.value)
  if (!value) {
    next.delete(row.id)
  } else if (expandConf.value.accordion) {
    // 手风琴：同一层只留一行
    for (const other of allRows.value) if (other.depth === row.depth) next.delete(other.id)
    next.add(row.id)
  } else {
    next.add(row.id)
  }
  expandedIds.value = next
}

function toggleExpanded(row: TableRowNode) {
  setExpanded(row, !isExpanded(row))
}

const expandableTop = computed(() => tree.value.filter(rowExpandable))
const allExpanded = computed(
  () => expandableTop.value.length > 0 && expandableTop.value.every((row) => isExpanded(row)),
)

function toggleExpandAll() {
  expandedIds.value = allExpanded.value ? new Set() : new Set(expandableTop.value.map((row) => row.id))
}

const visibleRows = computed(() => tableFlattenRows(tree.value, isExpanded))

/* ------------------------------------------------------------------ 勾选 */

const selectedIds = ref<Set<string>>(new Set())
const dragging = ref(false)

function rowCheckable(row: TableRowNode) {
  const expr = props.schema.itemCheckableOn
  return typeof expr === 'string' && expr ? evalExpression(expr, rowScope(row)) : true
}

const checkableRows = computed(() => allRows.value.filter(rowCheckable))
const selectedRows = computed(() => allRows.value.filter((row) => selectedIds.value.has(row.id)))
const allChecked = computed(
  () => checkableRows.value.length > 0 && checkableRows.value.every((row) => selectedIds.value.has(row.id)),
)
const someChecked = computed(() => selectedRows.value.length > 0)
const showCheckCol = computed(
  () => selectable.value && !dragging.value && props.schema.hideCheckToggler !== true && tree.value.length > 0,
)

function isSelected(row: TableRowNode) {
  return selectedIds.value.has(row.id)
}

async function emitSelected() {
  const picked = selectedRows.value
  await dispatch('selectedChange', {
    selectedItems: picked.map((row) => row.data),
    selectedIndexes: picked.map((row) => row.path),
    unSelectedItems: allRows.value.filter((row) => !selectedIds.value.has(row.id)).map((row) => row.data),
  })
}

let lastChecked: TableRowNode | null = null

function toggle(row: TableRowNode, value = !isSelected(row), shift = false) {
  if (!rowCheckable(row)) return
  let next = new Set(selectedIds.value)
  if (!multiple.value) {
    next = value ? new Set([row.id]) : new Set()
  } else if (shift && lastChecked && lastChecked !== row) {
    // Shift 连选：从上一次点的那行到这一行
    const list = checkableRows.value
    const from = list.indexOf(lastChecked)
    const to = list.indexOf(row)
    if (from >= 0 && to >= 0) {
      for (const item of list.slice(Math.min(from, to), Math.max(from, to) + 1)) {
        if (value) next.add(item.id)
        else next.delete(item.id)
      }
    }
  } else if (value) {
    next.add(row.id)
  } else {
    next.delete(row.id)
  }
  lastChecked = row
  selectedIds.value = next
  void emitSelected()
}

function toggleAll() {
  if (!multiple.value) return
  selectedIds.value = allChecked.value ? new Set() : new Set(checkableRows.value.map((row) => row.id))
  void emitSelected()
}

function selectRows(rows: TableRowNode[]) {
  const picks = rows.filter(rowCheckable)
  selectedIds.value = new Set((multiple.value ? picks : picks.slice(0, 1)).map((row) => row.id))
  void emitSelected()
}

/* ------------------------------------------------------------------ 表头：排序 / 搜索 / 过滤 */

function sortKey(col: SchemaObject) {
  return String(col.name || '')
}

function sortDir(col: SchemaObject): '' | 'asc' | 'desc' {
  return sortState.value && sortState.value.key === sortKey(col) ? sortState.value.dir : ''
}

async function sortBy(col: SchemaObject) {
  const key = sortKey(col)
  if (!col.sortable || !key) return
  const current = sortDir(col)
  // 默认 → 升序 → 降序 → 默认
  const next = current === '' ? ({ key, dir: 'asc' } as const) : current === 'asc' ? ({ key, dir: 'desc' } as const) : null
  const event = await dispatch('columnSort', { orderBy: next?.key || '', orderDir: next?.dir || '' })
  if (event.prevented) return
  sortState.value = next
}

async function searchBy(col: SchemaObject, values: Record<string, unknown>) {
  const event = await dispatch('columnSearch', { searchName: String(col.name || ''), searchValue: values })
  if (event.prevented) return false
  searchValues.value = { ...searchValues.value, ...values }
  return true
}

function resetSearch(names: string[]) {
  const next = { ...searchValues.value }
  for (const name of names) delete next[name]
  searchValues.value = next
}

async function filterBy(col: SchemaObject, value: string | undefined) {
  const name = String(col.name || '')
  const event = await dispatch('columnFilter', { filterName: name, filterValue: value })
  if (event.prevented) return
  const next = { ...filterValues.value }
  if (value == null || value === '') delete next[name]
  else next[name] = value
  filterValues.value = next
}

/** `filterable.source` 是接口时拉回来的选项（Amis `HeadCellFilterDropdown.fetchOptions`：取 `data.options`）。 */
const remoteFilterOptions = ref<Record<string, unknown[]>>({})

function filterSourceApi(col: SchemaObject): SchemaApi | null {
  const conf = col.filterable
  if (!conf || typeof conf !== 'object' || Array.isArray((conf as Row).options)) return null
  const source = (conf as Row).source
  if (!source) return null
  // `${options}` / `$options` 是取变量，其余（地址或 API 对象）才发请求
  if (typeof source === 'string' && /^\$(\{[^}]*\}|[\w.]+)$/.test(source.trim())) return null
  return source as SchemaApi
}

const filterSourceKeys = computed(() =>
  columns.value
    .map((col) => {
      const api = filterSourceApi(col)
      return api ? `${String(col.name)}::${typeof api === 'string' ? filterTpl(api, ctx.value) : JSON.stringify(api)}` : ''
    })
    .filter(Boolean)
    .join('|'),
)

async function loadFilterOptions() {
  for (const col of columns.value) {
    const api = filterSourceApi(col)
    const name = col.name == null ? '' : String(col.name)
    if (!api || !name) continue
    try {
      const result = await requestApi(api, { env, data: ctx.value, reason: 'init' })
      if (result.skipped || !result.ok) continue
      const data = result.data as Row | unknown[] | undefined
      const options = Array.isArray(data) ? data : Array.isArray(data?.options) ? data.options : []
      remoteFilterOptions.value = { ...remoteFilterOptions.value, [name]: options }
    } catch {
      // 请求失败时保持上一份选项，表头照常可用
    }
  }
}

watch(filterSourceKeys, (keys) => {
  if (keys) void loadFilterOptions()
})

function filterOptionsOf(col: SchemaObject) {
  const remote = remoteFilterOptions.value[String(col.name)]
  if (remote && filterSourceApi(col)) {
    return tableFilterOptions({ ...col, filterable: { ...(col.filterable as Row), options: remote } }, sourceItems.value, ctx.value)
  }
  return tableFilterOptions(col, sourceItems.value, ctx.value)
}

function remarkOf(col: SchemaObject): SchemaObject | null {
  const raw = col.remark
  if (!raw) return null
  if (typeof raw === 'string') return { type: 'remark', content: raw }
  if (typeof raw === 'object') {
    const rec = raw as SchemaObject
    return rec.type ? rec : { type: 'remark', ...rec }
  }
  return null
}

/* ------------------------------------------------------------------ 拖拽排序 */

function rowDraggable(row: TableRowNode) {
  if (row.depth !== 1) return false
  const expr = props.schema.itemDraggableOn
  return typeof expr === 'string' && expr ? evalExpression(expr, rowScope(row)) : true
}

const dragId = ref('')
const movedIds = computed(() => {
  const set = new Set<string>()
  const order = dragOrder.value
  if (!order) return set
  order.forEach((item, i) => {
    if (toRaw(item) !== toRaw(baseItems.value[i])) set.add(idOfData(item))
  })
  return set
})

function setDragging(next: boolean) {
  dragging.value = next
  if (next && selectedIds.value.size) {
    selectedIds.value = new Set()
    void emitSelected()
  }
}

function onDragStartRow(row: TableRowNode, event: DragEvent) {
  if (!dragging.value || !rowDraggable(row)) {
    event.preventDefault()
    return
  }
  dragId.value = row.id
  event.dataTransfer?.setData('text/plain', row.path)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

/** 拖过别的行就地换位（对齐 Amis Sortable 的即时重排），松手后才算「已移动」。 */
function onDragEnterRow(row: TableRowNode) {
  if (!dragId.value || row.depth !== 1 || row.id === dragId.value) return
  const list = orderedItems.value.slice()
  const from = list.findIndex((item) => idOfData(item) === dragId.value)
  const to = list.findIndex((item) => idOfData(item) === row.id)
  if (from < 0 || to < 0) return
  const [moved] = list.splice(from, 1)
  list.splice(to, 0, moved)
  dragOrder.value = list
}

function onDragEndRow() {
  dragId.value = ''
  if (dragOrder.value && !movedIds.value.size) dragOrder.value = null
}

async function saveOrder() {
  const order = dragOrder.value
  if (!order) return
  const movedItems = order.filter((item) => movedIds.value.has(idOfData(item)))
  const event = await dispatch('orderChange', { movedItems })
  if (event.prevented) return
  // 顺序落成新的基线；本地排序会把它盖回去，所以一并清掉
  sortState.value = null
  searchValues.value = {}
  filterValues.value = {}
  const rest = sourceItems.value.filter((item) => !order.includes(item))
  keepLocal([...order, ...rest])
}

/* ------------------------------------------------------------------ 本地行数据 */

const pristine = shallowRef<Map<string, Row>>(new Map())

function keepLocal(next: Row[]) {
  localRows.value = next
  dragOrder.value = null
}

/** 把命中的行对象换成新对象，沿途的 `children` 数组一起换，没碰到的保持原引用。 */
function rewriteItems(list: Row[], hits: Map<object, Row>): Row[] {
  let changed = false
  const next = list.map((item) => {
    if (!item || typeof item !== 'object') return item
    let data: Row = hits.get(toRaw(item)) ?? item
    const kids = item[childrenField.value]
    if (Array.isArray(kids) && kids.length) {
      const nextKids = rewriteItems(kids, hits)
      if (nextKids !== kids && data[childrenField.value] === kids) {
        data = { ...data, [childrenField.value]: nextKids }
      }
    }
    if (data !== item) {
      changed = true
      carryId(item, data)
    }
    return data
  })
  return changed ? next : list
}

function patchRows(rows: TableRowNode[], patch: (data: Row) => Row) {
  if (!rows.length) return
  const hits = new Map<object, Row>()
  for (const row of rows) hits.set(toRaw(row.data), patch(row.data))
  const next = rewriteItems(sourceItems.value, hits)
  if (next !== sourceItems.value) keepLocal(next)
}

/* ------------------------------------------------------------------ deferApi */

function withoutId(set: Set<string>, id: string) {
  const next = new Set(set)
  next.delete(id)
  return next
}

/** Amis `loadDeferredRow`：返回的是这一行的详情，子行在它的 `children` 里；行自己的 `deferApi` 优先。 */
async function loadDeferredRow(row: TableRowNode) {
  const id = row.id
  if (deferLoading.value.has(id)) return
  const api = (row.data.deferApi || props.schema.deferApi) as SchemaApi | undefined
  deferLoading.value = new Set(deferLoading.value).add(id)
  try {
    if (!api) throw new Error('deferApi is required')
    const result = await requestApi(api, { env, data: rowScope(row), reason: 'action' })
    if (result.skipped) throw new Error('deferApi is required')
    if (!result.ok) throw new Error(String(result.payload?.msg || '加载失败'))
    const detail = result.data && typeof result.data === 'object' && !Array.isArray(result.data) ? (result.data as Row) : {}
    patchRows([row], (data) => ({ ...data, ...detail }))
    deferLoaded.value = new Set(deferLoaded.value).add(id)
    if (deferErrors.value[id]) {
      const { [id]: _drop, ...rest } = deferErrors.value
      deferErrors.value = rest
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载失败'
    deferErrors.value = { ...deferErrors.value, [id]: message }
    env.notify('error', message)
  } finally {
    deferLoading.value = withoutId(deferLoading.value, id)
  }
}

function retryDeferred(row: TableRowNode) {
  const { [row.id]: _drop, ...rest } = deferErrors.value
  deferErrors.value = rest
}

/** 展开着、还没拉过、没在拉、也没报错的懒加载行：去拉（Amis 用同一条 reaction）。 */
watch(
  () =>
    allRows.value.filter(
      (row) => isExpanded(row) && isDeferred(row) && !deferLoading.value.has(row.id) && !deferErrors.value[row.id],
    ),
  (rows) => {
    for (const row of rows) void loadDeferredRow(row)
  },
  { immediate: true },
)

/* ------------------------------------------------------------------ 快速编辑 */

const modifiedRows = computed(() => allRows.value.filter((row) => pristine.value.has(row.id)))

/**
 * 改一行里的一个字段（Amis `handleQuickChange` → `row.change`）：快速编辑和单元格里的表单项都走这里。
 * 行记录整体换新，同一行里读这个字段的其他单元格跟着更新；改之前的记录留在 `pristine` 里，供「放弃」还原。
 * `asPristine`：这次改动不进「未提交」（`saveImmediately`、表单项挂载时写的默认值）。
 * `silent`：不派发 `quickEdit`（挂载时写默认值不是用户操作）。
 */
async function changeRow(
  row: TableRowNode,
  field: string,
  value: unknown,
  opts: { asPristine?: boolean; silent?: boolean } = {},
) {
  if (!field) return
  const before = row.data
  const current = getByPath(before, field)
  if (current === value || (current == null && value == null)) return
  const after = setByPathCopy(before, field, value)
  const map = new Map(pristine.value)
  const kept = map.get(row.id)
  if (opts.asPristine) {
    // 已经有未提交的改动：原始记录也跟着改，「放弃」不会把这次改动一起撤掉
    if (kept) map.set(row.id, setByPathCopy(kept, field, value))
  } else if (!kept) {
    map.set(row.id, before)
  }
  const origin = map.get(row.id)
  // 改回原值就不算修改了
  if (origin && Object.keys(after).every((key) => after[key] === origin[key])) map.delete(row.id)
  pristine.value = map
  patchRows([row], () => after)
  if (opts.silent) return
  await dispatch('quickEdit', { ...after, item: after, index: row.index, indexPath: row.path, name: field, value })
}

function onQuickEdit(row: TableRowNode, col: SchemaObject, value: unknown) {
  const conf = col.quickEdit && typeof col.quickEdit === 'object' ? (col.quickEdit as Row) : {}
  return changeRow(row, String(col.name || ''), value, { asPristine: conf.saveImmediately === true })
}

/** 单元格里的表单项（开关、勾选、输入框…）改了值：写回这一行。 */
function onCellChange(row: TableRowNode, payload: { name: string; value: unknown; init: boolean }) {
  return changeRow(row, payload.name, payload.value, { asPristine: payload.init, silent: payload.init })
}

async function submitQuickEdit() {
  const rows = modifiedRows.value
  if (!rows.length) return
  const rowsDiff = rows.map((row) => {
    const origin = pristine.value.get(row.id) || {}
    const diff: Row = {}
    for (const key of Object.keys(row.data)) if (row.data[key] !== origin[key]) diff[key] = row.data[key]
    return diff
  })
  const event = await dispatch('quickEditSubmit', {
    rows: rows.map((row) => row.data),
    rowsDiff,
    rowsOrigin: rows.map((row) => pristine.value.get(row.id)),
    indexes: rows.map((row) => row.path),
  })
  if (event.prevented) return
  pristine.value = new Map()
}

function discardChanges() {
  if (pristine.value.size) {
    const origin = pristine.value
    pristine.value = new Map()
    patchRows(
      allRows.value.filter((row) => origin.has(row.id)),
      (data) => origin.get(idOfData(data)) || data,
    )
  }
  dragOrder.value = null
}

/* ------------------------------------------------------------------ 标题栏 */

const headingText = computed(() => {
  const title = props.schema.title
  if (title == null || title === false || title === '') return ''
  return filterTpl(String(title), ctx.value)
})
/**
 * 「有 N 条记录修改但没有提交」只在表格有快速编辑列时出现。单元格里直接放表单项（开关等）改了值，
 * 行照样标成已修改、`submitQuickEdit` 也带上它，但不凭空多出一条提交栏（Amis 没有 `quickSaveApi` 时同样不出）。
 */
const hasQuickEditColumn = computed(() => columns.value.some((col) => !!col.quickEdit))
const unsavedMode = computed<'' | 'modified' | 'moved'>(() =>
  modifiedRows.value.length && hasQuickEditColumn.value && props.schema.hideQuickSaveBtn !== true
    ? 'modified'
    : movedIds.value.size
      ? 'moved'
      : '',
)
const showHeading = computed(() => !!headingText.value || !!unsavedMode.value)

/* ------------------------------------------------------------------ 合并 / 分组 / 总结 */

const combineSpans = computed(() => {
  const num = tableCombineNum(props.schema.combineNum, ctx.value)
  const map = new Map<string, Record<string, number>>()
  if (!num) return map
  const from = Number(props.schema.combineFromIndex)
  const keys = tableCombineKeys(columns.value, num, Number.isFinite(from) && from > 0 ? from : 0)
  if (!keys.length) return map
  const spans = tableCombineSpans(
    tree.value.map((row) => row.data),
    keys,
  )
  tree.value.forEach((row, i) => map.set(row.id, spans[i]))
  return map
})
const withCombine = computed(() => combineSpans.value.size > 0)

function spanOf(row: TableRowNode, col: SchemaObject): number {
  if (!withCombine.value || col.name == null) return 1
  const hit = combineSpans.value.get(row.id)?.[String(col.name)]
  return hit == null ? 1 : hit
}

const groups = computed(() => tableColumnGroups(columns.value))

/* ------------------------------------------------------------------ 懒渲染 */

/**
 * 对齐 Amis `lazyRenderAfter`（默认 100）+ `VirtualTableBody`：行数超过它时只画视口附近的行，
 * 上下各用一行占位撑住高度；前后各多画 10 行，合并单元格不会被切断。
 */
const VIRTUAL_BUFFER = 10
const lazyAfter = computed(() =>
  typeof props.schema.lazyRenderAfter === 'number' ? props.schema.lazyRenderAfter : 100,
)
const virtual = computed(() => visibleRows.value.length > lazyAfter.value)
const virtualRowHeight = ref(41)
const virtualRange = ref({ from: 0, to: VIRTUAL_BUFFER * 4 })

function rowCovered(row: TableRowNode | undefined) {
  const spans = row && combineSpans.value.get(row.id)
  return !!spans && Object.values(spans).some((span) => span === 0)
}

const virtualBounds = computed(() => {
  const rows = visibleRows.value
  if (!virtual.value) return { from: 0, to: rows.length }
  let from = Math.max(0, Math.min(virtualRange.value.from, rows.length))
  let to = Math.max(from, Math.min(virtualRange.value.to, rows.length))
  if (withCombine.value) {
    while (from > 0 && rowCovered(rows[from])) from--
    while (to < rows.length && rowCovered(rows[to])) to++
  }
  return { from, to }
})

/** 模板里按 `{ row, ri }` 解构：`ri` 始终是这一行在全部可见行里的下标（奇偶行、合并都按它算）。 */
const windowRows = computed(() => {
  const { from, to } = virtualBounds.value
  const rows = virtual.value ? visibleRows.value.slice(from, to) : visibleRows.value
  return rows.map((row, i) => ({ row, ri: from + i }))
})
const virtualPad = computed(() => ({
  lead: virtual.value ? virtualBounds.value.from * virtualRowHeight.value : 0,
  trail: virtual.value ? (visibleRows.value.length - virtualBounds.value.to) * virtualRowHeight.value : 0,
}))

const leadCount = computed(
  () => (dragging.value ? 1 : 0) + (showCheckCol.value ? 1 : 0) + (footColumns.value.length ? 1 : 0) + (showIndex.value ? 1 : 0),
)
const colSpan = computed(() => Math.max(columns.value.length + leadCount.value, 1))

type SummaryRow = { cells: TableSummaryCell[]; className: string }

function summaryRows(config: unknown, className: unknown, classExpr: unknown): SummaryRow[] {
  const visible = rawColumns.value.map((col) => columns.value.includes(col))
  const data = summaryData.value
  const cls = [resolveClassName(className, data), resolveClassName(classExpr, data)].filter(Boolean).join(' ')
  return tableSummaryRows(config)
    .map((items) => ({ cells: tableSummaryRow(items, visible, leadCount.value), className: cls }))
    .filter((row) => row.cells.length)
}

const summaryData = computed(() => {
  const list = tree.value.map((row) => row.data)
  return { ...ctx.value, items: list, rows: list }
})
const prefixRows = computed(() =>
  summaryRows(props.schema.prefixRow, props.schema.prefixRowClassName, props.schema.prefixRowClassNameExpr),
)
const affixRows = computed(() =>
  summaryRows(props.schema.affixRow, props.schema.affixRowClassName, props.schema.affixRowClassNameExpr),
)

const SUMMARY_LAYOUT_KEYS = ['colSpan', 'isHead', 'align', 'vAlign', 'cellClassName', 'firstIndex', 'lastIndex']

function summarySchema(cell: TableSummaryCell): SchemaObject {
  const next: SchemaObject = { ...cell }
  for (const key of SUMMARY_LAYOUT_KEYS) delete next[key]
  // Vamis 的 `text` 是 input-text 的别名，这里按 Amis 的纯文本出
  if ((next.type === 'text' || next.type === 'plain' || !next.type) && next.text != null) {
    return { type: 'tpl', tpl: String(next.text) }
  }
  if (!next.type) return { type: 'tpl', tpl: next.tpl != null ? String(next.tpl) : '' }
  return next
}

function summaryStyle(cell: TableSummaryCell) {
  const style: Record<string, string> = { ...resolveInlineStyle(cell.style, summaryData.value) }
  if (cell.align) style.textAlign = String(cell.align)
  if (cell.vAlign) style.verticalAlign = String(cell.vAlign)
  return style
}

/* ------------------------------------------------------------------ 列宽 / 固定列 */

const colWidths = ref<Record<string, number>>({})
const resizingKey = ref('')
const tableFixed = computed(
  () => props.schema.tableLayout === 'fixed' || Object.keys(colWidths.value).length > 0,
)
let resizeStartX = 0
let resizeStartW = 0

function onColResizeMove(event: MouseEvent) {
  if (!resizingKey.value) return
  const next = Math.max(30, resizeStartW + event.clientX - resizeStartX)
  colWidths.value = { ...colWidths.value, [resizingKey.value]: next }
}

function onColResizeUp() {
  resizingKey.value = ''
  if (typeof document === 'undefined') return
  document.removeEventListener('mousemove', onColResizeMove)
  document.removeEventListener('mouseup', onColResizeUp)
}

function onColResizeDown(col: SchemaObject, event: MouseEvent) {
  if (!resizable.value) return
  event.preventDefault()
  event.stopPropagation()
  const key = colKey(col)
  const th = (event.currentTarget as HTMLElement).closest('th')
  resizeStartX = event.clientX
  resizeStartW = colWidths.value[key] ?? th?.getBoundingClientRect().width ?? 80
  resizingKey.value = key
  document.addEventListener('mousemove', onColResizeMove)
  document.addEventListener('mouseup', onColResizeUp)
}

function colWidthStyle(col: SchemaObject) {
  const dragged = colWidths.value[colKey(col)]
  if (dragged != null) return { width: `${dragged}px`, minWidth: `${dragged}px` }
  const w = col.width
  if (w == null || w === '') return undefined
  const value = typeof w === 'number' ? `${w}px` : String(w)
  return { width: value, maxWidth: value, overflow: 'hidden' }
}

/** 超级表头有 colspan 时，列宽必须打在 `<col>` 上，th 上的 width 会被第一行合并格吃掉。 */
function colGroupStyle(col: SchemaObject) {
  const dragged = colWidths.value[colKey(col)]
  if (dragged != null) return { width: `${dragged}px` }
  const w = col.width
  if (w == null || w === '') return undefined
  return { width: typeof w === 'number' ? `${w}px` : String(w) }
}

type LeadKind = 'drag' | 'check' | 'expand' | 'index'
const leadKinds = computed<LeadKind[]>(() => {
  const list: LeadKind[] = []
  if (dragging.value) list.push('drag')
  if (showCheckCol.value) list.push('check')
  if (footColumns.value.length) list.push('expand')
  if (showIndex.value) list.push('index')
  return list
})

function fixedOf(col: SchemaObject): '' | 'left' | 'right' {
  return col.fixed === 'left' || col.fixed === 'right' ? col.fixed : ''
}

/** 渲染顺序上的每一列：内置列（拖拽 / 勾选 / 展开自动贴左）+ 作者列。 */
const renderFixed = computed<Array<'' | 'left' | 'right'>>(() => [
  ...leadKinds.value.map((kind) => (kind === 'index' ? '' : ('left' as const))),
  ...columns.value.map(fixedOf),
])
const hasSticky = computed(() => renderFixed.value.some(Boolean))

const tableRef = ref<{ $el: HTMLElement } | null>(null)
const contentEl = ref<HTMLElement | null>(null)
const colPx = ref<number[]>([])
const scrollState = ref({ left: false, right: false })

/**
 * 表头吸顶。对齐 Amis `affixHeader`（默认开，`autoFillHeight` 时内容区自己滚、不走这条）：
 * 工具栏 + 标题 + 一份只有 thead 的表放进 sticky 的 `fixed-top`，列宽抄表体实测值；
 * 表体自己的 thead 仍在（撑列宽），`visibility: hidden` 并用负 margin 收掉高度。
 * `env.affixHeader` 是整棵树的默认值（Amis 文档站给根 props 传 `affixHeader: false`）。
 */
const affixHeader = computed(() => {
  if (tableAutoFillHeight(props.schema).enabled) return false
  const own = props.schema.affixHeader
  if (typeof own === 'boolean') return own
  return env.affixHeader !== false
})
const affixHeadEl = ref<HTMLElement | null>(null)
const affixSize = ref({ width: 0, thead: 0 })
/** 列宽量到之前先按普通表头画，避免吸顶那份表头闪成自动列宽。 */
const affixReady = computed(
  () => affixHeader.value && colPx.value.length === leadKinds.value.length + columns.value.length && affixSize.value.width > 0,
)

function containerEl(): HTMLElement | null {
  return tableRef.value?.$el ?? null
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function measure() {
  const el = containerEl()
  if (!el) return
  if (hasSticky.value || affixHeader.value) {
    const next = Array.from(el.querySelectorAll(':scope > table > colgroup > col'), (col) =>
      round2(col.getBoundingClientRect().width),
    )
    if (next.length !== colPx.value.length || next.some((w, i) => w !== colPx.value[i])) colPx.value = next
  }
  if (affixHeader.value) {
    const table = el.querySelector(':scope > table')
    const width = table ? round2(table.getBoundingClientRect().width) : 0
    const thead = round2(el.querySelector(':scope > table > thead')?.getBoundingClientRect().height || 0)
    if (width !== affixSize.value.width || thead !== affixSize.value.thead) affixSize.value = { width, thead }
    const head = affixHeadEl.value
    if (head && head.scrollLeft !== el.scrollLeft) head.scrollLeft = el.scrollLeft
  }
  const left = el.scrollLeft > 0
  const right = Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth
  if (left !== scrollState.value.left || right !== scrollState.value.right) scrollState.value = { left, right }
}

type Sticky = { className: string; style?: Record<string, string> }
const NO_STICKY: Sticky = { className: '' }

/** 对齐 Amis `getStickyStyles`：偏移 = 同侧在它之前（之后）的固定列实测宽度之和。 */
const stickyList = computed<Sticky[]>(() => {
  const fixed = renderFixed.value
  if (!hasSticky.value) return fixed.map(() => NO_STICKY)
  const px = colPx.value
  return fixed.map((side, i) => {
    if (side === 'left') {
      let left = 0
      for (let k = 0; k < i; k++) if (fixed[k] === 'left') left += px[k] || 0
      const last = !fixed.slice(i + 1).includes('left')
      return {
        className: `is-sticky is-sticky-left${last ? ' is-sticky-last-left' : ''}`,
        style: { left: `${left}px` },
      }
    }
    if (side === 'right') {
      let right = 0
      for (let k = i + 1; k < fixed.length; k++) if (fixed[k] === 'right') right += px[k] || 0
      const first = !fixed.slice(0, i).includes('right')
      return {
        className: `is-sticky is-sticky-right${first ? ' is-sticky-first-right' : ''}`,
        style: { right: `${right}px` },
      }
    }
    return NO_STICKY
  })
})

function stickyAt(index: number): Sticky {
  return stickyList.value[index] || NO_STICKY
}

function leadSticky(kind: LeadKind): Sticky {
  return stickyAt(leadKinds.value.indexOf(kind))
}

function colSticky(ci: number): Sticky {
  return stickyAt(leadCount.value + ci)
}

/* ------------------------------------------------------------------ 表头结构 */

type HeadCell =
  | { kind: LeadKind; key: string; rowSpan: number }
  | { kind: 'group'; key: string; label: string; colSpan: number; index: number; fixed: '' | 'left' | 'right'; last: number }
  | { kind: 'column'; key: string; col: SchemaObject; index: number; rowSpan: number }

const headRows = computed<HeadCell[][]>(() => {
  const grouped = groups.value.length > 0
  const lead: HeadCell[] = leadKinds.value.map((kind) => ({ kind, key: `lead-${kind}`, rowSpan: grouped ? 2 : 1 }))
  if (!grouped) {
    return [
      [
        ...lead,
        ...columns.value.map((col, index): HeadCell => ({ kind: 'column', key: colKey(col), col, index, rowSpan: 1 })),
      ],
    ]
  }
  const top: HeadCell[] = [...lead]
  const bottom: HeadCell[] = []
  for (const group of groups.value) {
    if (group.rowSpan === 2) {
      const col = columns.value[group.index]
      top.push({ kind: 'column', key: colKey(col), col, index: group.index, rowSpan: 2 })
      continue
    }
    top.push({
      kind: 'group',
      key: `group-${group.index}`,
      label: filterTpl(group.label, ctx.value),
      colSpan: group.colSpan,
      index: group.index,
      fixed: group.fixed,
      last: group.index + group.colSpan - 1,
    })
    for (let i = group.index; i < group.index + group.colSpan; i++) {
      const col = columns.value[i]
      bottom.push({ kind: 'column', key: colKey(col), col, index: i, rowSpan: 1 })
    }
  }
  return [top, bottom]
})

/** Amis `fake-hide`：所有列都没写 `label` 时，列标题那一行不占位（配合 `isHead` 做左侧表头）。 */
const fakeHide = computed(() => columns.value.length > 0 && columns.value.every((col) => !colLabel(col)))

function groupSticky(cell: Extract<HeadCell, { kind: 'group' }>): Sticky {
  if (cell.fixed === 'left') return colSticky(cell.index)
  if (cell.fixed === 'right') return colSticky(cell.last)
  return NO_STICKY
}

function headClass(col: SchemaObject, ci: number) {
  return [
    resolveClassName(col.className, ctx.value),
    col.sortable ? 'vamis-table__th--sortable' : '',
    col.searchable ? 'vamis-table__th--searchable' : '',
    col.filterable ? 'vamis-table__th--filterable' : '',
    ci === 0 && isNested.value ? 'vamis-table__primary-cell' : '',
    colSticky(ci).className,
  ]
}

function headStyle(col: SchemaObject, ci: number) {
  const align = col.headerAlign || col.align
  return [colWidthStyle(col), align ? { textAlign: String(align) } : undefined, colSticky(ci).style]
}

/* ------------------------------------------------------------------ 单元格 */

const OMIT_CELL_STYLE = new Set(['width', 'position', 'display'])

function cellClass(col: SchemaObject, row: TableRowNode, ci: number) {
  const scope = rowScope(row)
  return [
    resolveClassName(col.className, scope),
    resolveClassName(col.classNameExpr, scope),
    ci === 0 && isNested.value ? 'vamis-table__primary-cell' : '',
    col.textOverflow === 'noWrap' ? 'vamis-table__nowrap' : '',
    colSticky(ci).className,
  ]
}

function cellStyle(col: SchemaObject, row: TableRowNode, ci: number) {
  const style: Record<string, string> = {}
  const own = resolveInlineStyle(col.style, rowScope(row))
  for (const [key, value] of Object.entries(own)) if (!OMIT_CELL_STYLE.has(key)) style[key] = value
  if (col.align) style.textAlign = String(col.align)
  if (col.vAlign) style.verticalAlign = String(col.vAlign)
  if (col.backgroundScale) {
    const color = tableBackgroundScale(col, row.data, ctx.value, sourceItems.value)
    if (color) style.background = color
  }
  return [style, colWidthStyle(col), colSticky(ci).style]
}

const itemBadge = computed<SchemaObject | null>(() => {
  const raw = props.schema.itemBadge
  if (!raw || typeof raw !== 'object') return null
  const badge = raw as SchemaObject
  return { badge: { ...badge, className: ['vamis-table__badge', badge.className].filter(Boolean).join(' ') } }
})

const COLUMN_EVENTS: Record<string, string> = { click: 'click', mouseenter: 'mouseenter', mouseleave: 'mouseleave' }

/** 列上的 `onEvent`（click / mouseenter / mouseleave）。数据是这一行 + `index`。 */
function onCellEvent(name: string, col: SchemaObject, row: TableRowNode, native: Event) {
  const handlers = col.onEvent
  if (!handlers || typeof handlers !== 'object' || !(handlers as Row)[COLUMN_EVENTS[name]]) return
  const type = String(col.type || '')
  if (type === 'button' || type === 'action' || type === 'operation' || type === 'dropdown-button') return
  const payload = { ...rowScope(row), index: row.index, indexPath: row.path, item: row.data }
  const event = createVamisEvent(name, payload, native)
  void runOnEvent(col, name, { env, data: eventEvalData(payload, event), scoped, overlay, event })
}

/* ------------------------------------------------------------------ 行 */

const itemActions = computed(() => asArray(props.schema.itemActions).filter(Boolean) as SchemaObject[])
const hover = ref<{ row: TableRowNode; top: number; height: number } | null>(null)

function rowClass(row: TableRowNode, at: number) {
  const scope = rowScope(row)
  return [
    'vamis-table__tr',
    `vamis-table__tr--${row.depth}th`,
    at % 2 ? 'vamis-table__tr--even' : 'vamis-table__tr--odd',
    resolveClassName(props.schema.rowClassName, scope),
    resolveClassName(props.schema.rowClassNameExpr, scope),
    {
      'is-checked': isSelected(row),
      'is-modified': pristine.value.has(row.id),
      'is-moved': movedIds.value.has(row.id),
      'is-expanded': isExpanded(row),
      'is-expandable': rowExpandable(row),
      'is-hovered': hover.value?.row.id === row.id,
      'is-dragging': dragId.value === row.id,
      'has-item-action': !!props.schema.itemAction,
    },
  ]
}

function rowPayload(row: TableRowNode) {
  return { ...row.data, item: row.data, index: row.index, indexPath: row.path }
}

function isControlClick(event: Event) {
  const el = event.target
  if (!(el instanceof Element)) return false
  return !!el.closest(
    'button, a, input, textarea, select, label, [data-vamis-action], [data-slot="checkbox"], [role="radio"], [role="button"], .vamis-table__edit, .vamis-table__item-actions',
  )
}

async function handleRowClick(row: TableRowNode, native: MouseEvent) {
  if (isControlClick(native)) return
  const event = await dispatch('rowClick', rowPayload(row), native)
  if (event.prevented) return
  const action = props.schema.itemAction
  if (action && typeof action === 'object') {
    await runAction(action as ActionSchema, { env, data: rowScope(row), scoped, overlay })
    return
  }
  if (showCheckCol.value && checkOnItemClick.value) toggle(row, !isSelected(row), native.shiftKey)
}

function onRowEnter(row: TableRowNode, native: MouseEvent) {
  if (itemActions.value.length && !dragging.value) {
    const tr = native.currentTarget as HTMLElement
    const box = contentEl.value?.getBoundingClientRect()
    const rect = tr.getBoundingClientRect()
    if (box) hover.value = { row, top: rect.top - box.top, height: rect.height }
  }
  void dispatch('rowMouseEnter', rowPayload(row), native)
}

function onRowLeave(row: TableRowNode, native: MouseEvent) {
  void dispatch('rowMouseLeave', rowPayload(row), native)
}

function clearHover() {
  hover.value = null
}

/* ------------------------------------------------------------------ 工具栏 */

type TableToolbarItem =
  | { kind: 'toggler'; schema: SchemaObject }
  | { kind: 'drag' }
  | { kind: 'schema'; schema: SchemaObject }

function asSchema(node: SchemaNode): SchemaObject {
  if (node && typeof node === 'object' && !Array.isArray(node)) return node as SchemaObject
  return { type: 'tpl', tpl: String(node ?? '') }
}

function toolbarItem(node: unknown): TableToolbarItem | null {
  const type =
    typeof node === 'string'
      ? node
      : node && typeof node === 'object'
        ? String((node as SchemaObject).type || '')
        : ''
  if (type === 'columns-toggler' || type === 'column-toggler') {
    const extra = node && typeof node === 'object' ? (node as SchemaObject) : {}
    return { kind: 'toggler', schema: { type: 'column-toggler', label: false, size: 'sm', ...extra } }
  }
  if (type === 'drag-toggler') return { kind: 'drag' }
  if (typeof node === 'string') return null
  if (node && typeof node === 'object') return { kind: 'schema', schema: asSchema(node as SchemaNode) }
  return null
}

const showHeader = computed(() => props.schema.showHeader !== false)
const showFooter = computed(() => props.schema.showFooter !== false)
/** Amis `affixFooter`：有 `footer` 时贴底的是 footer，否则是底部工具栏。 */
const affixFooter = computed(() => props.schema.affixFooter === true)
const showDragToggler = computed(() => draggable.value && !isNested.value && tree.value.length > 1)
const headerNodes = computed(() => asArray(props.schema.header).filter(Boolean).map(asSchema))
const footerNodes = computed(() => asArray(props.schema.footer).filter(Boolean).map(asSchema))
const actionBarItems = computed(() => {
  const items: TableToolbarItem[] = []
  const seen = new Set<string>()
  for (const node of [...asArray(props.schema.headerToolbar), ...asArray(props.schema.actions)]) {
    const item = toolbarItem(node)
    if (!item) continue
    items.push(item)
    seen.add(item.kind)
  }
  if (showToggler.value && !seen.has('toggler')) {
    items.push({ kind: 'toggler', schema: { type: 'column-toggler', label: false, size: 'sm' } })
  }
  if (showDragToggler.value && !seen.has('drag')) items.push({ kind: 'drag' })
  return items
})
const footerActionItems = computed(() => {
  const items: TableToolbarItem[] = []
  for (const node of [...asArray(props.schema.footerToolbar), ...asArray(props.schema.actions)]) {
    const item = toolbarItem(node)
    if (item) items.push(item)
  }
  return items
})

/* ------------------------------------------------------------------ 高度自适应 */

const autoFill = computed(() => tableAutoFillHeight(props.schema))
let fillTimer: ReturnType<typeof setTimeout> | null = null

function styleNumber(el: Element, name: string) {
  return parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0
}

function scrollParentOf(el: HTMLElement | null): HTMLElement | null {
  let node = el
  while (node && node !== document.body) {
    const style = getComputedStyle(node)
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) return node
    node = node.parentElement
  }
  return null
}

/** 对齐 Amis `updateAutoFillHeight`：视口高 − 内容区顶 − 下方兄弟与各级 padding/border。 */
function updateAutoFillHeight() {
  const conf = autoFill.value
  const content = containerEl()
  if (!conf.enabled || !content) return
  if (conf.height || conf.maxHeight) {
    content.style.height = conf.height ? `${conf.height}px` : ''
    content.style.maxHeight = conf.maxHeight ? `${conf.maxHeight}px` : ''
    return
  }
  if (!content.offsetHeight) {
    if (fillTimer) clearTimeout(fillTimer)
    fillTimer = setTimeout(updateAutoFillHeight, 100)
    return
  }
  const parent = scrollParentOf(content.parentElement)
  let viewportHeight = window.innerHeight
  let top = content.getBoundingClientRect().top
  if (parent) {
    viewportHeight = parent.clientHeight - 1
    top = content.getBoundingClientRect().top - parent.getBoundingClientRect().top + parent.scrollTop
  } else {
    top += window.scrollY
  }
  let bottom = 0
  let self: HTMLElement = content
  let up = self.parentElement
  while (up) {
    let siblings = 0
    let next = self.nextElementSibling as HTMLElement | null
    while (next) {
      const position = getComputedStyle(next).position
      if (position !== 'absolute' && position !== 'fixed') {
        if (self.getBoundingClientRect().bottom - next.getBoundingClientRect().top <= 0.5) {
          siblings += next.offsetHeight + styleNumber(next, 'margin-bottom')
        }
      }
      next = next.nextElementSibling as HTMLElement | null
    }
    bottom +=
      styleNumber(up, 'padding-bottom') +
      styleNumber(up, 'border-bottom-width') +
      styleNumber(self, 'margin-bottom') +
      siblings
    self = up
    up = self.parentElement
    if (parent && parent === self) break
  }
  content.style.height = `${Math.max(Math.round(viewportHeight - top - bottom - 1), 0)}px`
}

/* ------------------------------------------------------------------ 组件 API */

function matchRows(index?: unknown, condition?: unknown) {
  return tableMatchRows(tree.value, ctx.value, index, condition)
}

const tableApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => {
    const list = tree.value.map((row) => row.data)
    return {
      ...ctx.value,
      items: list,
      rows: list,
      total: sourceItems.value.length,
      selectedItems: selectedRows.value.map((row) => row.data),
      unSelectedItems: allRows.value.filter((row) => !selectedIds.value.has(row.id)).map((row) => row.data),
      selectedIndexes: selectedRows.value.map((row) => row.path),
    }
  },
  /** Amis `setData(values, replace, index, condition)`：给了 index / condition 就只改命中的行。 */
  setData(values: unknown, replace = false, index?: unknown, condition?: unknown) {
    if (index !== undefined || condition !== undefined) {
      if (!values || typeof values !== 'object' || Array.isArray(values)) return
      const patch = values as Row
      patchRows(matchRows(index, condition), (data) => (replace ? { ...patch } : { ...data, ...patch }))
      return
    }
    const next = Array.isArray(values)
      ? values
      : values && typeof values === 'object'
        ? ((values as Row).items ?? (values as Row).rows)
        : undefined
    if (!Array.isArray(next)) return
    pristine.value = new Map()
    keepLocal(next as Row[])
    void nextTick(initExpanded)
  },
  async doAction(action: { actionType?: string; args?: Row }) {
    const type = action?.actionType
    const args = action?.args && typeof action.args === 'object' ? action.args : {}
    if (type === 'selectAll') {
      selectRows(multiple.value ? checkableRows.value : checkableRows.value.slice(0, 1))
    } else if (type === 'clearAll') {
      selectRows([])
    } else if (type === 'select') {
      if (args.index === undefined && args.condition === undefined && typeof args.selected === 'string') {
        // 旧写法：表达式里用 `record`（行数据）和 `rowIndex`（行下标）
        const expr = args.selected
        selectRows(
          allRows.value.filter((row) =>
            evalExpression(expr, { ...ctx.value, record: row.data, rowIndex: row.index }),
          ),
        )
      } else {
        selectRows(matchRows(args.index, args.condition))
      }
    } else if (type === 'initDrag') {
      setDragging(true)
    } else if (type === 'cancelDrag') {
      setDragging(false)
    } else if (type === 'submitQuickEdit') {
      await submitQuickEdit()
    } else if (type === 'toggleExpanded') {
      for (const row of matchRows(args.index, args.condition)) toggleExpanded(row)
    } else if (type === 'setExpanded') {
      for (const row of matchRows(args.index, args.condition)) setExpanded(row, !!args.value)
    }
  },
}
scoped?.register(tableApi as never)

/* ------------------------------------------------------------------ 生命周期 */

watch(propItems, () => {
  localRows.value = null
  dragOrder.value = null
  pristine.value = new Map()
  initExpanded()
})
watch(baseItems, () => {
  dragOrder.value = null
})
initExpanded()

/** 按视口（高度自适应时再按内容区）算该画哪一段行。行高取已画出来那一段的平均值。 */
function updateVirtualWindow() {
  if (!virtual.value) return
  const el = containerEl()
  const body = el?.querySelector(':scope > table > tbody')
  if (!el || !body) return
  const total = visibleRows.value.length
  const dataRows = body.querySelectorAll(':scope > tr[data-index]')
  const first = dataRows[0]
  const last = dataRows[dataRows.length - 1]
  const lead = body.querySelector(':scope > tr.vamis-table__virtual-pad.is-lead')
  if (!first || !last) return
  const drawn = virtualBounds.value.to - virtualBounds.value.from
  if (drawn > 0) {
    const height = (last.getBoundingClientRect().bottom - first.getBoundingClientRect().top) / drawn
    if (height > 0 && Math.abs(height - virtualRowHeight.value) > 1) virtualRowHeight.value = round2(height)
  }
  const listTop = (lead || first).getBoundingClientRect().top
  let viewTop = 0
  let viewBottom = window.innerHeight
  if (autoFill.value.enabled) {
    const box = el.getBoundingClientRect()
    viewTop = Math.max(viewTop, box.top)
    viewBottom = Math.min(viewBottom, box.bottom)
  }
  const height = virtualRowHeight.value
  const least = VIRTUAL_BUFFER * 2
  let from = Math.floor((viewTop - listTop) / height) - VIRTUAL_BUFFER
  from = Math.max(0, Math.min(from, total - least))
  let to = Math.ceil((viewBottom - listTop) / height) + VIRTUAL_BUFFER
  to = Math.min(total, Math.max(to, from + least))
  if (from !== virtualRange.value.from || to !== virtualRange.value.to) virtualRange.value = { from, to }
}

let virtualFrame = 0
function onAnyScroll() {
  if (!virtual.value || virtualFrame) return
  virtualFrame = requestAnimationFrame(() => {
    virtualFrame = 0
    updateVirtualWindow()
  })
}

let observer: ResizeObserver | null = null
let observedHeads: Element[] = []

/** 表头格子的宽度会跟着内容变（表总宽不变时 table 的 ResizeObserver 不响），吸顶那份表头要跟上。 */
function observeHeads() {
  if (!observer) return
  const el = containerEl()
  const heads = affixHeader.value && el ? Array.from(el.querySelectorAll(':scope > table > thead th')) : []
  for (const old of observedHeads) if (!heads.includes(old)) observer.unobserve(old)
  for (const head of heads) if (!observedHeads.includes(head)) observer.observe(head)
  observedHeads = heads
}

function onWindowResize() {
  viewport.value = window.innerWidth
  measure()
  updateAutoFillHeight()
  updateVirtualWindow()
}

onMounted(() => {
  if (filterSourceKeys.value) void loadFilterOptions()
  const el = containerEl()
  if (el) {
    el.addEventListener('scroll', measure, { passive: true })
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => measure())
      observer.observe(el)
      const table = el.querySelector(':scope > table')
      if (table) observer.observe(table)
      observeHeads()
    }
  }
  window.addEventListener('resize', onWindowResize)
  // scroll 不冒泡，捕获阶段挂在 document 上，页面或任一祖先滚动都能收到。
  document.addEventListener('scroll', onAnyScroll, { capture: true, passive: true })
  measure()
  updateAutoFillHeight()
  updateVirtualWindow()
})

onUpdated(() => {
  if (!affixHeader.value) return
  observeHeads()
  measure()
})

watch(
  () => [renderFixed.value.join(','), visibleRows.value.length, colWidths.value] as const,
  () => {
    void nextTick(() => {
      measure()
      updateAutoFillHeight()
      updateVirtualWindow()
    })
  },
)

onBeforeUnmount(() => {
  onColResizeUp()
  observer?.disconnect()
  containerEl()?.removeEventListener('scroll', measure)
  if (typeof document !== 'undefined') document.removeEventListener('scroll', onAnyScroll, { capture: true })
  if (virtualFrame) cancelAnimationFrame(virtualFrame)
  if (typeof window !== 'undefined') window.removeEventListener('resize', onWindowResize)
  if (fillTimer) clearTimeout(fillTimer)
  scoped?.unregister(tableApi as never)
})

/* ------------------------------------------------------------------ class */

const wrapClass = computed(() => [
  'vamis-table-wrap',
  {
    'is-fixed': tableFixed.value,
    'is-col-resizing': !!resizingKey.value,
    'is-dragging': dragging.value,
    'is-unsaved': !!unsavedMode.value || modifiedRows.value.length > 0,
    'is-auto-fill': autoFill.value.enabled,
    'is-affix-header': affixReady.value,
    'is-bordered': tableBordered(props.schema),
    'is-check-on-click': showCheckCol.value && checkOnItemClick.value,
  },
  resolveClassName(props.schema.className, ctx.value),
])
const tableClass = computed(() => [
  resolveClassName(props.schema.tableClassName, ctx.value),
  {
    'vamis-table--combine': withCombine.value,
    'is-scrolled-left': scrollState.value.left,
    'is-scrolled-right': scrollState.value.right,
  },
])
const wrapStyle = computed(() =>
  affixReady.value ? { '--table-thead-height': `${affixSize.value.thead}px` } : undefined,
)

/** 同一段模板画两处（VueUse `createReusableTemplate` 的做法）：表头在吸顶表和表体里各一份，顶栏按吸顶与否换位置。 */
function reusableTemplate() {
  const slot = shallowRef<Slot | undefined>()
  const Define = defineComponent({
    setup(_, { slots }) {
      return () => {
        slot.value = slots.default
        return null
      }
    },
  })
  const Reuse = defineComponent({
    setup() {
      return () => slot.value?.()
    },
  })
  return [Define, Reuse] as const
}
/** Amis `--Table-fixedTop-boxShadow`。带 alpha 的色写在 inline style 里，不进 CSS 文件（旧 WebView 不认 8 位 hex）。 */
const AFFIX_SHADOW = { boxShadow: 'inset 0 10px 8px -8px rgba(5, 5, 5, 0.06)' }
const [DefineTop, ReuseTop] = reusableTemplate()
const [DefineHead, ReuseHead] = reusableTemplate()
const headerClass = computed(() => resolveClassName(props.schema.headerClassName, ctx.value))
const footerClass = computed(() => resolveClassName(props.schema.footerClassName, ctx.value))
const toolbarClass = computed(() => resolveClassName(props.schema.toolbarClassName, ctx.value))
const headerToolbarClass = computed(() => resolveClassName(props.schema.headerToolbarClassName, ctx.value))
const footerToolbarClass = computed(() => resolveClassName(props.schema.footerToolbarClassName, ctx.value))
const headingClass = computed(() => resolveClassName(props.schema.headingClassName, ctx.value))

/** Amis `renderDragToggler`：`tooltip: { content: '点击开始排序', placement: 'bottom' }`，走浮层 Tooltip。 */
const DRAG_TIP = { content: '点击开始排序', placement: 'bottom' }
const dragBtnEl = ref<HTMLElement | null>(null)
const dragTipOpen = ref(false)
function setDragBtnEl(el: unknown) {
  dragBtnEl.value = (el as HTMLElement | null) || null
}
</script>

<template>
  <div :class="wrapClass" :style="wrapStyle">
    <DefineTop>
      <div v-if="showHeader && headerNodes.length" class="vamis-table__header" :class="headerClass">
        <SchemaRenderer v-for="(node, i) in headerNodes" :key="'h' + i" :schema="node" />
      </div>
      <div
        v-if="showHeader && (actionBarItems.length || dragging || $slots.headerToolbar)"
        class="vamis-table__toolbar vamis-table__head-toolbar"
        :class="[toolbarClass, headerToolbarClass]"
      >
        <div v-if="actionBarItems.length" class="vamis-table__actions">
          <template v-for="(item, i) in actionBarItems" :key="'a' + i">
            <ColumnToggler v-if="item.kind === 'toggler'" :schema="item.schema" />
            <button
              v-else-if="item.kind === 'drag'"
              type="button"
              class="vamis-table__toolbar-btn vamis-table__drag-toggler"
              :ref="setDragBtnEl"
              :class="{ 'is-active': dragging }"
              aria-label="点击开始排序"
              :aria-pressed="dragging"
              :disabled="modifiedRows.length > 0"
              @click.stop="setDragging(!dragging)"
              @mouseenter="dragTipOpen = true"
              @mouseleave="dragTipOpen = false"
              @focus="dragTipOpen = true"
              @blur="dragTipOpen = false"
            >
              <VamisTableIcon name="drag" class="vamis-table__drag-toggler-icon" />
            </button>
            <SchemaRenderer v-else :schema="item.schema" />
          </template>
        </div>
        <VamisTooltipLayer
          :show="dragTipOpen && !!dragBtnEl"
          :target="dragBtnEl"
          :container="popContainer"
          :tooltip="DRAG_TIP"
          @outside="dragTipOpen = false"
        />
        <slot name="headerToolbar" />
        <div v-if="dragging" class="vamis-table__drag-tip">请拖动左边的按钮进行排序</div>
      </div>
      <div v-if="showHeading" class="vamis-table__heading" :class="headingClass">
        <span v-if="unsavedMode === 'modified'">
          当前有 {{ modifiedRows.length }} 条记录修改但没有提交，你可以：
          <Button type="button" size="xs" variant="success" class="m-l-sm" @click="submitQuickEdit">
            <VamisTableIcon name="check" />提交
          </Button>
          <Button type="button" size="xs" variant="destructive" class="m-l-sm" @click="discardChanges">
            <VamisTableIcon name="close" />放弃
          </Button>
        </span>
        <span v-else-if="unsavedMode === 'moved'">
          当前有 {{ movedIds.size }} 条记录修改了顺序但没有提交，你可以：
          <Button type="button" size="xs" variant="success" class="m-l-sm" @click="saveOrder">
            <VamisTableIcon name="check" />提交
          </Button>
          <Button type="button" size="xs" variant="destructive" class="m-l-sm" @click="discardChanges">
            <VamisTableIcon name="close" />放弃
          </Button>
        </span>
        <template v-else>{{ headingText }}</template>
      </div>
    </DefineTop>
    <DefineHead>
    <TableHeader>
        <TableRow v-for="(cells, ri) in headRows" :key="ri" :class="{ 'is-fake-hide': fakeHide && ri === headRows.length - 1 }">
          <template v-for="cell in cells" :key="cell.key">
            <TableHead
              v-if="cell.kind === 'drag'"
              :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
              :class="['vamis-table__drag-cell', leadSticky('drag').className]"
              :style="leadSticky('drag').style"
            />
            <TableHead
              v-else-if="cell.kind === 'check'"
              :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
              :class="['vamis-table__check-cell', leadSticky('check').className]"
              :style="leadSticky('check').style"
            >
              <label v-if="multiple" class="vamis-table__check">
                <input
                  type="checkbox"
                  :checked="allChecked"
                  :indeterminate.prop="someChecked && !allChecked"
                  aria-label="全选"
                  @change="toggleAll"
                >
              </label>
              <template v-else>&nbsp;</template>
        </TableHead>
            <TableHead
              v-else-if="cell.kind === 'expand'"
              :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
              :class="['vamis-table__expand-cell', leadSticky('expand').className]"
              :style="leadSticky('expand').style"
            >
              <a
                class="vamis-table__expand-btn"
                :class="{ 'is-active': allExpanded }"
                role="button"
                aria-label="展开全部"
                @click.stop="toggleExpandAll"
              >
                <VamisCaret variant="tree" />
              </a>
            </TableHead>
            <TableHead
              v-else-if="cell.kind === 'index'"
              :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
              class="vamis-table__index-cell"
            >
              序号
            </TableHead>
            <TableHead
              v-else-if="cell.kind === 'group'"
              :colspan="cell.colSpan"
              :class="['vamis-table__group-cell', groupSticky(cell).className]"
              :style="groupSticky(cell).style"
            >
              {{ cell.label }}
            </TableHead>
            <TableHead
              v-else-if="cell.kind === 'column'"
              :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
              :class="headClass(cell.col, cell.index)"
              :style="headStyle(cell.col, cell.index)"
            >
              <a
                v-if="cell.index === 0 && isNested"
                class="vamis-table__expand-btn"
                :class="{ 'is-active': allExpanded }"
                role="button"
                aria-label="展开全部"
                @click.stop="toggleExpandAll"
              >
                <VamisCaret variant="tree" />
              </a>
              <div class="vamis-table__th-title" :class="resolveClassName(cell.col.labelClassName, ctx)">
                {{ colLabel(cell.col) }}<SchemaRenderer v-if="remarkOf(cell.col)" :schema="remarkOf(cell.col)" />
              </div>
              <TableHeadSearch
                v-if="cell.col.searchable && cell.col.name"
                :column="cell.col"
                :values="searchValues"
                :container="popContainer"
                :search="(values) => searchBy(cell.col, values)"
                :reset="resetSearch"
              />
              <span
                v-if="cell.col.sortable && cell.col.name"
                class="vamis-table__sort-btn"
                role="button"
                :aria-label="`排序${colLabel(cell.col)}`"
                @click.stop="sortBy(cell.col)"
              >
                <i class="vamis-table__sort-icon is-down" :class="{ 'is-active': sortDir(cell.col) === 'desc' }">
                  <VamisTableIcon name="sort-desc" />
                </i>
                <i class="vamis-table__sort-icon is-up" :class="{ 'is-active': sortDir(cell.col) === 'asc' }">
                  <VamisTableIcon name="sort-asc" />
                </i>
                <i class="vamis-table__sort-icon is-default" :class="{ 'is-active': !sortDir(cell.col) }">
                  <VamisTableIcon name="sort-default" />
                </i>
              </span>
              <TableHeadFilter
                v-if="cell.col.filterable && cell.col.name"
                :column="cell.col"
                :options="filterOptionsOf(cell.col)"
                :value="filterValues[String(cell.col.name)]"
                :container="popContainer"
                @change="filterBy(cell.col, $event)"
              />
              <div
                v-if="resizable"
                class="vamis-table__col-resizer"
                :class="{
                  'is-resizing': resizingKey === cell.key,
                  'is-last': cell.index === columns.length - 1,
                }"
                @mousedown="onColResizeDown(cell.col, $event)"
                @click.stop
              />
            </TableHead>
          </template>
      </TableRow>
    </TableHeader>
    </DefineHead>
    <div v-if="affixHeader" class="vamis-table__fixed-top" :class="{ 'is-fake-hide': fakeHide }">
      <ReuseTop />
      <div v-if="affixReady" ref="affixHeadEl" class="vamis-table__affix-head">
        <table
          data-slot="table"
          class="vamis-table__affix-table"
          :class="tableClass"
          :style="{ width: affixSize.width + 'px', minWidth: affixSize.width + 'px' }"
        >
          <colgroup>
            <col v-for="(width, ci) in colPx" :key="ci" :style="{ width: width + 'px' }">
          </colgroup>
          <ReuseHead />
        </table>
      </div>
      <div v-if="affixReady" class="vamis-table__fixed-shadow" :style="AFFIX_SHADOW" />
    </div>
    <ReuseTop v-else />
    <div ref="contentEl" class="vamis-table__content-wrap" @mouseleave="clearHover">
      <Table ref="tableRef" :class="tableClass">
        <colgroup>
          <col v-for="kind in leadKinds" :key="'lead-' + kind" :data-col="kind">
          <col v-for="col in columns" :key="colKey(col)" :style="colGroupStyle(col)">
        </colgroup>
        <ReuseHead />
    <TableBody>
          <TableRow
            v-for="(summary, si) in prefixRows"
            :key="'prefix-' + si"
            :class="['vamis-table__tr is-summary', summary.className]"
          >
            <component
              :is="cell.isHead ? TableHead : TableCell"
              v-for="(cell, ci) in summary.cells"
              :key="ci"
              :colspan="cell.colSpan > 1 ? cell.colSpan : undefined"
              :class="resolveClassName(cell.cellClassName, summaryData)"
              :style="summaryStyle(cell)"
            >
              <SchemaRenderer :schema="summarySchema(cell)" :extra-data="summaryData" />
            </component>
          </TableRow>
          <TableRow v-if="!tree.length" class="vamis-table__placeholder">
            <TableCell :colspan="colSpan" class="vamis-table__empty">
              <VamisTableEmptyIcon />
              {{ schema.placeholder || '暂无数据' }}
        </TableCell>
      </TableRow>
          <tr v-if="virtualPad.lead > 0" class="vamis-table__virtual-pad is-lead" aria-hidden="true">
            <td :colspan="colSpan" :style="{ height: virtualPad.lead + 'px' }" />
          </tr>
          <template v-for="{ row, ri } in windowRows" :key="row.id">
            <TableRow
              :class="rowClass(row, ri)"
              :data-state="isSelected(row) ? 'selected' : undefined"
              :data-index="row.path"
              :draggable="dragging && rowDraggable(row) ? true : undefined"
              @click="handleRowClick(row, $event)"
              @dblclick="dispatch('rowDbClick', rowPayload(row), $event)"
              @mouseenter="onRowEnter(row, $event)"
              @mouseleave="onRowLeave(row, $event)"
              @dragstart="onDragStartRow(row, $event)"
              @dragenter="onDragEnterRow(row)"
              @dragover.prevent
              @drop.prevent="onDragEndRow"
              @dragend="onDragEndRow"
            >
              <TableCell
                v-if="dragging"
                :class="['vamis-table__drag-cell', leadSticky('drag').className]"
                :style="leadSticky('drag').style"
              >
                <VamisTableIcon v-if="rowDraggable(row)" name="drag-bar" />
              </TableCell>
              <TableCell
                v-if="showCheckCol"
                :class="['vamis-table__check-cell', leadSticky('check').className]"
                :style="leadSticky('check').style"
              >
                <template v-if="rowCheckable(row)">
                  <button
                    v-if="!multiple"
                    type="button"
                    class="vamis-radio-dot"
                    role="radio"
                    :aria-checked="isSelected(row)"
                    @click.stop="toggle(row)"
                  />
                  <label v-else class="vamis-table__check" @click.stop>
                    <input
                      type="checkbox"
                      :checked="isSelected(row)"
                      @click="toggle(row, ($event.target as HTMLInputElement).checked, $event.shiftKey)"
                    >
                  </label>
                </template>
        </TableCell>
              <TableCell
                v-if="footColumns.length"
                :class="['vamis-table__expand-cell', leadSticky('expand').className]"
                :style="leadSticky('expand').style"
              >
                <a
                  v-if="row.depth === 1"
                  class="vamis-table__expand-btn"
                  :class="{ 'is-active': isExpanded(row) }"
                  role="button"
                  :aria-expanded="isExpanded(row)"
                  @click.stop="toggleExpanded(row)"
                >
                  <VamisCaret variant="tree" />
                </a>
              </TableCell>
              <TableCell v-if="showIndex" class="vamis-table__index-cell">{{ tableIndexText(row.path) }}</TableCell>
              <template v-for="(col, ci) in columns" :key="colKey(col)">
                <component
                  :is="col.isHead ? TableHead : TableCell"
                  v-if="spanOf(row, col) !== 0"
                  :rowspan="spanOf(row, col) > 1 ? spanOf(row, col) : undefined"
                  :class="cellClass(col, row, ci)"
                  :style="cellStyle(col, row, ci)"
                  @click="onCellEvent('click', col, row, $event)"
                  @mouseenter="onCellEvent('mouseenter', col, row, $event)"
                  @mouseleave="onCellEvent('mouseleave', col, row, $event)"
                >
                  <BadgeHost v-if="ci === 0 && itemBadge" :schema="itemBadge" :data="row.data" />
                  <template v-if="ci === 0 && isNested">
                    <span
                      class="vamis-table__indent"
                      :style="{ paddingLeft: `calc(${row.depth - 1} * var(--table-tree-indent))` }"
                    /><span v-if="deferLoading.has(row.id)" class="vamis-table__defer-spinner">
                      <VamisSpinnerMark />
                    </span><a
                      v-else-if="deferErrors[row.id]"
                      class="vamis-table__retry-btn"
                      role="button"
                      :data-tooltip="`加载失败，点击重试（${deferErrors[row.id]}）`"
                      aria-label="重试"
                      @click.stop="retryDeferred(row)"
                    >
                      <VamisTableIcon name="retry" />
                    </a><a
                      v-else-if="row.children.length || isDeferred(row)"
                      class="vamis-table__expand-btn"
                      :class="{ 'is-active': isExpanded(row) }"
                      role="button"
                      :aria-expanded="isExpanded(row)"
                      @click.stop="toggleExpanded(row)"
                    >
                      <VamisCaret variant="tree" />
                    </a><span v-else class="vamis-table__expand-space" />
                  </template>
                  <TableCellBody
                    :column="col"
                    :row="row.data"
                    :ctx="ctx"
                    :index="row.index"
                    @quick-edit="onQuickEdit(row, col, $event)"
                    @change="onCellChange(row, $event)"
                  />
                </component>
              </template>
            </TableRow>
            <TableRow
              v-if="footColumns.length && row.depth === 1 && isExpanded(row)"
              :key="row.id + '-foot'"
              class="vamis-table__foot-row"
            >
              <TableCell :colspan="colSpan" class="vamis-table__foot">
                <table class="vamis-table__foot-table">
                  <tbody>
                    <tr v-for="col in footColumns" :key="colKey(col)">
                      <th>{{ colLabel(col) }}</th>
                      <td>
                        <TableCellBody
                          :column="col"
                          :row="row.data"
                          :ctx="ctx"
                          :index="row.index"
                          @quick-edit="onQuickEdit(row, col, $event)"
                          @change="onCellChange(row, $event)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </TableCell>
            </TableRow>
          </template>
          <tr v-if="virtualPad.trail > 0" class="vamis-table__virtual-pad is-trail" aria-hidden="true">
            <td :colspan="colSpan" :style="{ height: virtualPad.trail + 'px' }" />
          </tr>
          <TableRow
            v-for="(summary, si) in affixRows"
            :key="'affix-' + si"
            :class="['vamis-table__tr is-summary', summary.className]"
          >
            <component
              :is="cell.isHead ? TableHead : TableCell"
              v-for="(cell, ci) in summary.cells"
              :key="ci"
              :colspan="cell.colSpan > 1 ? cell.colSpan : undefined"
              :class="resolveClassName(cell.cellClassName, summaryData)"
              :style="summaryStyle(cell)"
            >
              <SchemaRenderer :schema="summarySchema(cell)" :extra-data="summaryData" />
            </component>
      </TableRow>
    </TableBody>
  </Table>
      <div
        v-if="hover && itemActions.length && !dragging"
        class="vamis-table__item-actions-wrap"
        :style="{ top: `${hover.top}px`, height: `${hover.height}px` }"
      >
        <div class="vamis-table__item-actions">
          <SchemaRenderer
            v-for="(action, ai) in itemActions"
            :key="ai"
            :schema="{ ...action, type: action.type || 'button', level: action.level || 'link' }"
            :extra-data="rowScope(hover.row)"
          />
        </div>
      </div>
    </div>
    <div
      v-if="showFooter && (footerActionItems.length || $slots.footerToolbar)"
      class="vamis-table__toolbar vamis-table__foot-toolbar"
      :class="[toolbarClass, footerToolbarClass, { 'is-affix': affixFooter && !footerNodes.length }]"
    >
      <div v-if="footerActionItems.length" class="vamis-table__actions">
        <template v-for="(item, i) in footerActionItems" :key="'f' + i">
          <ColumnToggler v-if="item.kind === 'toggler'" :schema="item.schema" />
          <SchemaRenderer v-else-if="item.kind === 'schema'" :schema="item.schema" />
        </template>
      </div>
      <slot name="footerToolbar" />
    </div>
    <div
      v-if="showFooter && footerNodes.length"
      class="vamis-table__footer"
      :class="[footerClass, { 'is-affix': affixFooter }]"
    >
      <SchemaRenderer v-for="(node, i) in footerNodes" :key="'ft' + i" :schema="node" />
    </div>
  </div>
</template>
