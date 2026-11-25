<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  countVisibleTagsByWidth,
  createStoreId,
  createVamisEvent,
  evalExpression,
  eventEvalData,
  getByPath,
  hydrateSelectedOptions,
  isApiOutdated,
  isFormItemType,
  overlayContainerFrom,
  requestApi,
  runOnEvent,
  setByPathCopy,
  tableBuildRows,
  tableFlattenRows,
  useEnv,
  useRendererHub,
  useScoped,
  type SchemaObject,
  type TableRowNode,
} from '@vamis/core'
import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  VamisCaret,
  VamisClose,
  VamisIcon,
} from '@vamis/ui'
import Cards from './Cards.vue'
import Pagination from './Pagination.vue'
import PopOverHost from './PopOverHost.vue'
import Spinner from './Spinner.vue'
import RowValueHost from './data/RowValueHost.vue'
import VamisTooltipLayer from '../overlay/VamisTooltipLayer.vue'
import {
  asToolbarSchema,
  CrudHostKey,
  isBulkToolbar,
  parseListPayload,
  provideColumnToggle,
  resolveTableSource,
  selectedIdsOf,
  useColumnToggle,
} from './data/crudHost'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const hub = useRendererHub()
const scoped = useScoped()
const store = hub.add({
  id: createStoreId('crud'),
  type: 'crud',
  name: props.schema.name,
  perPage: Number(props.schema.perPage || 10),
})
const crudTarget = String(props.schema.name || props.schema.id || store.id)

const rawColumns = computed(() => (props.schema.columns || []) as SchemaObject[])
const columnToggle = useColumnToggle(rawColumns, (visible) => {
  const payload = { columns: visible }
  const event = createVamisEvent('columnToggled', payload)
  void runOnEvent(props.schema, 'columnToggled', {
    env,
    data: eventEvalData(payload, event),
    scoped,
    event,
  })
})
provideColumnToggle(columnToggle)
const columns = computed(() => columnToggle.visibleColumns.value)
const filterSchema = computed(() => props.schema.filter as SchemaObject | undefined)
const editingCell = ref('')
const draftValue = ref('')
const allItems = ref<Record<string, any>[]>([])
const seededValueKey = ref('')
const selectionBarEl = ref<HTMLElement | null>(null)
const selectionLabelEl = ref<HTMLElement | null>(null)
const selectionClearEl = ref<HTMLElement | null>(null)
const selectionMeasureEl = ref<HTMLElement | null>(null)
const selectionMoreEl = ref<HTMLElement | null>(null)
const selectionOverflowTip = ref(false)
const visibleSelectionByWidth = ref(Number.POSITIVE_INFINITY)
let selectionOverflowHideTimer: ReturnType<typeof setTimeout> | undefined
let selectionFoldObserver: ResizeObserver | undefined
const primaryField = computed(() => String(props.schema.primaryField || 'id'))
const strictMode = computed(() => props.schema.strictMode === true)
const bulkActions = computed(() => asArray(props.schema.bulkActions) as SchemaObject[])
const pickerMode = computed(() => props.schema.pickerMode === true)
const multiple = computed(() => props.schema.multiple !== false)
const selectable = computed(
  () =>
    pickerMode.value ||
    props.schema.selectable === true ||
    bulkActions.value.length > 0,
)
const isCardsMode = computed(() => {
  const mode = String(props.schema.mode || 'table').toLowerCase()
  return mode === 'cards' || mode === 'card'
})
const isListMode = computed(() => String(props.schema.mode || 'table').toLowerCase() === 'list')
const headerToolbar = computed(() => {
  const configured = asArray(props.schema.headerToolbar)
  const hasToggler = configured.some((node) => {
    const type =
      typeof node === 'string'
        ? node
        : node && typeof node === 'object'
          ? String((node as SchemaObject).type || '')
          : ''
    return type === 'columns-toggler' || type === 'column-toggler'
  })
  const autoToggler =
    !hasToggler &&
    !isCardsMode.value &&
    !isListMode.value &&
    props.schema.columnsTogglable !== false &&
    (props.schema.columnsTogglable === true || rawColumns.value.length > 5)
  return autoToggler
    ? [...configured, { type: 'columns-toggler', label: false, size: 'sm' }]
    : configured
})
const childrenColumnName = computed(() =>
  String(props.schema.childrenColumnName || 'children'),
)
const crudRowTree = computed<TableRowNode[]>(() => {
  const seen = new Set<string>()
  return tableBuildRows(store.items, childrenColumnName.value, (row, path) => {
    const primary = row[primaryField.value]
    let id = primary == null ? path : String(primary)
    if (seen.has(id)) id = `${id}@${path}`
    seen.add(id)
    return id
  })
})
const allCrudRows = computed(() => tableFlattenRows(crudRowTree.value))
const isNested = computed(() =>
  allCrudRows.value.some((row) => row.children.length > 0),
)
const expandedCrudRows = ref(new Set<string>())
const expandAllEnabled = computed(() => {
  const config = props.schema.expandConfig
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return true
  }
  const conf = config as Record<string, unknown>
  return conf.expandAll !== false && conf.accordion !== true
})
const visibleCrudRows = computed(() =>
  tableFlattenRows(crudRowTree.value, crudRowExpanded),
)
const allCrudExpanded = computed(() => {
  const expandable = allCrudRows.value.filter(crudRowExpandable)
  return (
    expandable.length > 0 &&
    expandable.every((row) => expandedCrudRows.value.has(row.id))
  )
})
const listDisplayColumn = computed(
  () => columns.value.find((col) => col.type !== 'operation') || columns.value[0],
)

function crudRowExpanded(row: TableRowNode) {
  return expandedCrudRows.value.has(row.id)
}

function crudRowExpandable(row: TableRowNode) {
  return row.children.length > 0
}

function seedCrudExpansion(preserveUserState = false) {
  const config = props.schema.expandConfig
  const conf =
    config && typeof config === 'object' && !Array.isArray(config)
      ? (config as Record<string, unknown>)
      : {}
  if (preserveUserState && expandedCrudRows.value.size) {
    const current = new Set(
      [...expandedCrudRows.value].filter((id) =>
        allCrudRows.value.some((row) => row.id === id),
      ),
    )
    expandedCrudRows.value = current
    return
  }
  const next = new Set<string>()
  if (conf.expand === 'all' && conf.accordion !== true) {
    for (const row of allCrudRows.value) {
      if (crudRowExpandable(row)) next.add(row.id)
    }
  } else if (conf.expand === 'first') {
    const first = crudRowTree.value.find(crudRowExpandable)
    if (first) next.add(first.id)
  }
  expandedCrudRows.value = next
}

function toggleCrudRowExpanded(row: TableRowNode) {
  if (!crudRowExpandable(row)) return
  const next = new Set(expandedCrudRows.value)
  if (next.has(row.id)) {
    next.delete(row.id)
  } else if (props.schema.expandConfig && typeof props.schema.expandConfig === 'object') {
    const conf = props.schema.expandConfig as Record<string, unknown>
    if (conf.accordion === true) {
      for (const other of allCrudRows.value) {
        if (other.depth === row.depth) next.delete(other.id)
      }
    }
    next.add(row.id)
  } else {
    next.add(row.id)
  }
  expandedCrudRows.value = next
}

function toggleCrudExpandAll() {
  if (!expandAllEnabled.value) return
  const expandable = allCrudRows.value.filter(crudRowExpandable)
  const allExpanded =
    expandable.length > 0 &&
    expandable.every((row) => expandedCrudRows.value.has(row.id))
  expandedCrudRows.value = allExpanded
    ? new Set()
    : new Set(expandable.map((row) => row.id))
}

watch(
  crudRowTree,
  () => seedCrudExpansion(true),
  { immediate: true },
)
watch(() => props.schema.expandConfig, () => seedCrudExpansion(), {
  deep: true,
})
const showSelectionBar = computed(
  () =>
    multiple.value &&
    props.schema.keepItemSelectionOnPageChange === true &&
    store.selectedItems.length > 0,
)
const selectionMaxCount = computed(() => {
  const count = Number(props.schema.maxTagCount)
  return Number.isFinite(count) && count > 0 ? count : 0
})
const foldSelection = computed(() => selectionMaxCount.value > 0)

function measureSelectionTags() {
  const bar = selectionBarEl.value
  const measure = selectionMeasureEl.value
  if (!foldSelection.value || !bar || !measure) {
    visibleSelectionByWidth.value = Number.POSITIVE_INFINITY
    return
  }
  if (!bar.clientWidth) return
  const labelWidth = selectionLabelEl.value?.offsetWidth || 0
  const clearWidth = selectionClearEl.value?.offsetWidth || 0
  const gap =
    Number.parseFloat(getComputedStyle(bar).columnGap || '') || 4
  const chips = Array.from(
    measure.querySelectorAll('[data-fold-chip]'),
  ) as HTMLElement[]
  const more = measure.querySelector('[data-fold-more]') as HTMLElement | null
  visibleSelectionByWidth.value = countVisibleTagsByWidth({
    containerWidth: Math.max(0, bar.clientWidth - labelWidth - clearWidth - gap * 2),
    itemWidths: chips.map((el) => el.offsetWidth),
    moreWidth: more?.offsetWidth || 30,
    maxVisibleCount: selectionMaxCount.value,
  })
}

function scheduleSelectionMeasure() {
  void nextTick(measureSelectionTags)
}

const visibleSelectedItems = computed(() => {
  const cap = foldSelection.value
    ? Math.min(selectionMaxCount.value, store.selectedItems.length)
    : store.selectedItems.length
  const visible = Number.isFinite(visibleSelectionByWidth.value)
    ? Math.min(cap, Math.max(0, visibleSelectionByWidth.value))
    : cap
  return store.selectedItems.slice(0, visible)
})
const hiddenSelectedItems = computed(() =>
  store.selectedItems.slice(visibleSelectedItems.value.length),
)
const hiddenSelectedCount = computed(() =>
  hiddenSelectedItems.value.length,
)
watch(
  () => [store.selectedItems, selectionMaxCount.value] as const,
  scheduleSelectionMeasure,
  { deep: true },
)
const selectionOverflowContainer = computed(() =>
  overlayContainerFrom(
    { popOverContainerSelector: props.schema.popOverContainerSelector },
    env,
  ),
)
const selectionOverflowTooltip = computed(() => {
  const value = props.schema.overflowTagPopover
  const extra =
    value && typeof value === 'object' && !Array.isArray(value)
      ? { ...(value as Record<string, unknown>) }
      : {}
  delete extra.children
  delete extra.content
  const extraClass =
    extra.tooltipClassName != null ? String(extra.tooltipClassName) : ''
  return {
    placement: 'bottom',
    showArrow: false,
    enterable: true,
    offset: [0, 10],
    ...extra,
    tooltipClassName: ['vamis-crud-selection-overflow', extraClass]
      .filter(Boolean)
      .join(' '),
  }
})
/** Amis CRUD `headerToolbar` 默认 `['bulkActions']`。cards 把这条注入 Cards-toolbar，不要在 CRUD 根上另画一段 flex。 */
const resolvedHeaderToolbar = computed(() => {
  if (props.schema.headerToolbar != null) return asArray(props.schema.headerToolbar)
  return isCardsMode.value ? ['bulkActions'] : headerToolbar.value
})
const cardsHeaderToolbarOpen = computed(() =>
  resolvedHeaderToolbar.value.some((node) => (isBulkToolbar(node) ? bulkActions.value.length > 0 : true)),
)
const cardsChild = computed(
  () =>
    ({
      type: 'cards',
      source: '$items',
      card: props.schema.card,
      selectable: selectable.value,
      multiple: props.schema.multiple !== false,
      checkOnItemClick: props.schema.checkOnItemClick === true,
      hideCheckToggler: props.schema.hideCheckToggler === true,
      checkAll: props.schema.checkAll !== false,
    }) as SchemaObject,
)
const cardsData = computed(() => ({ items: store.items }))
const lastPage = computed(() => Math.max(1, Math.ceil((store.total || 0) / (store.perPage || 10)) || 1))
const statisticsText = computed(() => `${store.page}/${lastPage.value} 共：${store.total} 项`)
const pagerSchema = computed(
  () =>
    ({
      type: 'pagination',
      activePage: store.page,
      lastPage: lastPage.value,
      total: store.total,
      perPage: store.perPage,
      // cxd 主题默认 maxButtons: 9（组件自身默认 5），文档站 CRUD 才会画出 1 2 3 4 5 6 7 … N
      maxButtons: 9,
      showPageInput: lastPage.value > 9,
    }) as SchemaObject,
)
const resolvedFooterToolbar = computed(() =>
  props.schema.footerToolbar == null
    ? ['statistics', pagerSchema.value]
    : asArray(props.schema.footerToolbar),
)
const showPager = computed(
  () =>
    !isCardsMode.value &&
    (props.schema.footerToolbar != null
      ? resolvedFooterToolbar.value.length > 0
      : props.schema.alwaysShowPagination === true || lastPage.value > 1),
)
/** 对齐 Amis Table：`Spinner overlay show={store.loading}` 盖表格区，不盖底栏。 */
const spinnerSchema = computed(
  () =>
    ({
      type: 'spinner',
      show: store.fetching,
      overlay: true,
      loadingConfig: props.schema.loadingConfig,
    }) as SchemaObject,
)

function syncFromLocation() {
  if (props.schema.syncLocation !== true || typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const page = Number(params.get('page'))
    const perPage = Number(params.get('perPage'))
    if (Number.isFinite(page) && page >= 1) store.page = page
    if (Number.isFinite(perPage) && perPage >= 1) store.perPage = perPage
  } catch {
    /* ignore */
  }
}

function syncToLocation() {
  if (props.schema.syncLocation !== true || typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('page', String(store.page))
    url.searchParams.set('perPage', String(store.perPage))
    window.history.replaceState(window.history.state, '', url.toString())
  } catch {
    /* ignore */
  }
}

function quickEditConf(col: SchemaObject): Record<string, unknown> {
  return col.quickEdit && typeof col.quickEdit === 'object' ? (col.quickEdit as Record<string, unknown>) : {}
}

function quickEditType(col: SchemaObject): string {
  return String(quickEditConf(col).type || 'input-text')
}

function quickEditOptions(col: SchemaObject): Array<{ label: string; value: string }> {
  const raw = quickEditConf(col).options
  if (!Array.isArray(raw)) return []
  return raw.map((item) =>
    item && typeof item === 'object'
      ? { label: String((item as Record<string, unknown>).label ?? (item as Record<string, unknown>).value ?? ''), value: String((item as Record<string, unknown>).value ?? '') }
      : { label: String(item), value: String(item) },
  )
}

function quickEditable(col: SchemaObject) {
  return col.quickEdit === true || (col.quickEdit != null && typeof col.quickEdit === 'object')
}

function cellEditKey(row: Record<string, any>, col: SchemaObject) {
  return `${rowKey(row)}-${String(col.name || '')}`
}

function startCellEdit(row: Record<string, any>, col: SchemaObject) {
  const field = String(col.name || '')
  if (!field || row[field] == null) return
  editingCell.value = cellEditKey(row, col)
  draftValue.value = String(row[field] ?? '')
}

async function commitCellEdit(row: Record<string, any>, col: SchemaObject) {
  const field = String(col.name || '')
  if (!field || !editingCell.value) return
  row[field] = draftValue.value
  editingCell.value = ''
  const payload = { ...row, name: field, value: draftValue.value }
  const event = createVamisEvent('quickEdit', payload)
  await runOnEvent(props.schema, 'quickEdit', { env, data: eventEvalData(payload, event), scoped, event })
}

function cancelCellEdit() {
  editingCell.value = ''
}

/** 列是表单项（开关、输入框…）时不画它自己的 label，表头已经有了。 */
function cellSchema(col: SchemaObject): SchemaObject {
  return isFormItemType(String(col.type || '')) ? { ...col, label: false, inputOnly: true } : col
}

/**
 * 单元格里的表单项改了值：写回这一行（Amis `TableRow.handleChange`），同一行其它列跟着变。
 * 行记录整体换新，不原地改；已勾选的同一行、`loadDataOnce` 的全量缓存一起换。
 */
function onCellChange(row: Record<string, any>, payload: { name: string; value: unknown; init: boolean }) {
  if (!payload.name || getByPath(row, payload.name) === payload.value) return
  const key = rowKey(row)
  const next = setByPathCopy(row, payload.name, payload.value)
  // 当前页按对象身份换；勾选和全量缓存里是另一份引用，按主键找
  const swap = (list: Record<string, any>[]) => list.map((item) => (rowKey(item) === key ? next : item))
  store.items = store.items.map((item) => (item === row ? next : item))
  store.selectedItems = swap(store.selectedItems)
  if (allItems.value.length) allItems.value = swap(allItems.value)
}

function onPagerChange(page: number, perPage?: number) {
  if (perPage != null && perPage !== store.perPage) {
    store.perPage = perPage
    store.page = 1
  } else {
    store.page = page
  }
  syncToLocation()
  void reload()
}

function seedLocalItems() {
  const items = resolveTableSource(props.schema, props.data)
  allItems.value = items
  paginateLocal()
}

function toolbarNode(node: unknown): SchemaObject {
  const next = asToolbarSchema(node)
  if ((next.actionType === 'ajax' || next.actionType === 'dialog') && !next.reload) {
    return { ...next, reload: crudTarget }
  }
  return next
}

function toolbarAlign(node: unknown): 'left' | 'right' {
  const rec = node && typeof node === 'object' ? (node as Record<string, unknown>) : null
  if (rec?.align === 'right' || rec?.align === 'left') return rec.align
  const type = typeof node === 'string' ? node : String(rec?.type || '')
  return type === 'pagination' ? 'right' : 'left'
}

function isStatisticsNode(node: unknown) {
  return node === 'statistics' || node === 'statistics-node'
}

function isPaginationNode(node: unknown) {
  return !!(
    node &&
    typeof node === 'object' &&
    !Array.isArray(node) &&
    String((node as Record<string, unknown>).type || '') === 'pagination'
  )
}

function footerNodeSchema(node: unknown): SchemaObject {
  const schema = toolbarNode(node)
  if (!isPaginationNode(node)) return schema
  return {
    ...pagerSchema.value,
    ...schema,
    activePage: store.page,
    lastPage: lastPage.value,
    total: store.total,
    perPage: store.perPage,
  }
}

function footerNodeAlign(node: unknown): 'left' | 'right' {
  if (isStatisticsNode(node)) return 'left'
  if (isPaginationNode(node)) return 'right'
  return toolbarAlign(node)
}

function bulkActionSchema(btn: SchemaObject): SchemaObject {
  return {
    ...btn,
    disabled: !store.selectedItems.length || btn.disabled,
    reload: btn.reload || crudTarget,
  }
}

function sanitizeQuery(extra: Record<string, any>) {
  const next: Record<string, any> = {}
  for (const [key, value] of Object.entries(extra)) {
    if (key === 'page' || key === 'perPage') continue
    next[key] = value
  }
  return next
}

function paginateLocal() {
  const skip = new Set(['page', 'perPage', 'orderBy', 'orderDir'])
  const filters = Object.entries(store.query).filter(([key, value]) => !skip.has(key) && value != null && value !== '')
  let list = allItems.value.filter((row) =>
    filters.every(([key, value]) => String(row?.[key] ?? '').toLowerCase().includes(String(value).toLowerCase())),
  )
  const matchFunc = props.schema.matchFunc
  if (typeof matchFunc === 'string' && matchFunc.trim()) {
    list = list.filter((row) => {
      try {
        return !!evalExpression(matchFunc, { ...store.query, ...row, data: { ...row, query: store.query } })
      } catch {
        return true
      }
    })
  }
  const orderBy = String(store.query.orderBy || '')
  if (orderBy) {
    const dir = String(store.query.orderDir || 'asc') === 'desc' ? -1 : 1
    list = [...list].sort((a, b) => String(a?.[orderBy] ?? '').localeCompare(String(b?.[orderBy] ?? ''), 'zh-CN', { numeric: true }) * dir)
  }
  const start = (store.page - 1) * store.perPage
  store.items = list.slice(start, start + store.perPage)
  store.total = list.length
  seedSelectionFromValue()
}

async function reload(extra: Record<string, any> = {}) {
  if (!props.schema.api) {
    const queryPatch = sanitizeQuery(extra)
    store.query = { ...store.query, ...queryPatch }
    paginateLocal()
    if (!props.schema.keepItemSelectionOnPageChange) store.selectedItems = []
    return
  }
  if (props.schema.loadDataOnce === true) {
    store.fetching = true
    await nextTick()
    const queryPatch = sanitizeQuery(extra)
    store.query = { ...store.query, ...queryPatch }
    try {
      if (!allItems.value.length) {
        const result = await requestApi(props.schema.api, {
          env,
          data: { ...store.query, page: 1, perPage: 999999, orderBy: store.query.orderBy, orderDir: store.query.orderDir },
          reason: 'reload',
        }, { autoAppend: true })
        if (result.skipped) return
        if (!result.ok) throw new Error(result.payload.msg || '加载失败')
        allItems.value = parseListPayload(result.data).items
      }
      paginateLocal()
      if (!props.schema.keepItemSelectionOnPageChange) store.selectedItems = []
    } catch (error) {
      env.notify('error', error instanceof Error ? error.message : '加载失败')
    } finally {
      store.fetching = false
    }
    return
  }
  store.fetching = true
  await nextTick()
  const queryPatch = sanitizeQuery(extra)
  store.query = { ...store.query, ...queryPatch }
  if (Object.keys(queryPatch).length) store.page = 1
  try {
    const query = {
      ...store.query,
      page: store.page,
      perPage: store.perPage,
      orderBy: store.query.orderBy,
      orderDir: store.query.orderDir,
    }
    const result = await requestApi(props.schema.api, { env, data: query, reason: 'reload' }, { autoAppend: true })
    if (result.skipped) return
    if (!result.ok) throw new Error(result.payload.msg || '加载失败')
    const { items, total } = parseListPayload(result.data)
    store.items = items
    store.total = total
    seedSelectionFromValue()
    if (!props.schema.keepItemSelectionOnPageChange) store.selectedItems = []
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '加载失败')
  } finally {
    store.fetching = false
  }
}

function operationButtons(col: SchemaObject): SchemaObject[] {
  return asArray(col.buttons || col.body)
    .filter((node) => node != null)
    .map((node) => (typeof node === 'object' && !Array.isArray(node)
      ? node as SchemaObject
      : { type: 'button', label: String(node) }))
}

/**
 * Operation 列必须像 Amis OperationField 一样再走一次 SchemaRenderer。
 * 这样 visibleOn / hiddenOn / disabledOn、动作上下文和 loading 都只维护一套规则。
 */
function operationButtonSchema(button: SchemaObject): SchemaObject {
  const next: SchemaObject = {
    type: 'button',
    size: 'sm',
    ...button,
  }
  if (next.actionType === 'ajax' && next.reload == null) next.reload = crudTarget
  return next
}

function toggleSort(col: SchemaObject) {
  if (!col.name || col.sortable === false || col.type === 'operation') return
  const current = String(store.query.orderBy || '')
  const dir = String(store.query.orderDir || 'asc')
  store.query.orderBy = col.name
  store.query.orderDir = current === col.name && dir === 'asc' ? 'desc' : 'asc'
  store.page = 1
  reload()
}

function sortMark(col: SchemaObject) {
  if (!col.name || store.query.orderBy !== col.name) return ''
  return store.query.orderDir === 'desc' ? ' ↓' : ' ↑'
}

function rowKey(row: Record<string, any>) {
  return row[primaryField.value] ?? JSON.stringify(row)
}

function primaryValueEqual(left: unknown, right: unknown) {
  if (strictMode.value) return left === right
  return (
    left === right ||
    (left != null && right != null && String(left) === String(right))
  )
}

function sameRowIdentity(
  left: Record<string, any>,
  right: Record<string, any>,
) {
  if (left === right) return true
  const leftValue = left?.[primaryField.value]
  const rightValue = right?.[primaryField.value]
  return (
    leftValue != null &&
    rightValue != null &&
    primaryValueEqual(leftValue, rightValue)
  )
}

function hydrateSelectedItems(pool: Record<string, any>[]) {
  if (!pool.length || !store.selectedItems.length) return
  const next = hydrateSelectedOptions([...store.selectedItems], pool, {
    labelField: String(props.schema.labelField || 'label'),
    valueField: primaryField.value,
    equals: (left, right) => sameRowIdentity(left, right),
  })
  if (next.some((item, index) => item !== store.selectedItems[index])) {
    store.selectedItems = next
  }
}

function selectionOptionPool() {
  const embeddedOptions = Array.isArray(props.data.items)
    ? (props.data.items as Record<string, any>[])
    : []
  const embeddedTree = tableFlattenRows(
    tableBuildRows(embeddedOptions, childrenColumnName.value),
  ).map((row) => row.data)
  const currentTree = tableFlattenRows(
    tableBuildRows(store.items, childrenColumnName.value),
  ).map((row) => row.data)
  const fullTree = tableFlattenRows(
    tableBuildRows(allItems.value, childrenColumnName.value),
  ).map((row) => row.data)
  return [...currentTree, ...fullTree, ...embeddedTree]
}

function isSelected(row: Record<string, any>) {
  return store.selectedItems.some((item) => sameRowIdentity(item, row))
}

function selectedIdsForCurrentTree() {
  const ids = new Set<string>()
  for (const node of allCrudRows.value) {
    if (isSelected(node.data)) ids.add(node.id)
  }
  return ids
}

function applyTreeSelection(ids: Set<string>) {
  const currentTree = allCrudRows.value
  const preserved = store.selectedItems.filter(
    (item) => !currentTree.some((node) => sameRowIdentity(node.data, item)),
  )
  store.selectedItems = [
    ...preserved,
    ...currentTree.filter((node) => ids.has(node.id)).map((node) => node.data),
  ]
}

function markTreeNode(
  node: TableRowNode,
  checked: boolean,
  ids: Set<string>,
) {
  if (checked) ids.add(node.id)
  else ids.delete(node.id)
  for (const child of node.children) markTreeNode(child, checked, ids)
}

function refreshTreeAncestors(node: TableRowNode, ids: Set<string>) {
  let parent = node.parent
  while (parent) {
    if (parent.children.every((child) => ids.has(child.id))) ids.add(parent.id)
    else ids.delete(parent.id)
    parent = parent.parent
  }
}

function toggleTreeRow(node: TableRowNode, checked: boolean) {
  const ids = selectedIdsForCurrentTree()
  markTreeNode(node, checked, ids)
  refreshTreeAncestors(node, ids)
  applyTreeSelection(ids)
}

function toggleRow(row: Record<string, any>, checked: boolean) {
  if (!multiple.value) {
    store.selectedItems = checked ? [row] : []
    notifyPickerSelection()
    return
  }
  const node = allCrudRows.value.find((item) =>
    sameRowIdentity(item.data, row),
  )
  if (node && !isListMode.value && !isCardsMode.value) {
    toggleTreeRow(node, checked)
    notifyPickerSelection()
    return
  }
  if (checked) {
    if (!isSelected(row)) store.selectedItems.push(row)
    notifyPickerSelection()
    return
  }
  store.selectedItems = store.selectedItems.filter(
    (item) => !sameRowIdentity(item, row),
  )
  notifyPickerSelection()
}

function nodeSelected(node: TableRowNode) {
  return isSelected(node.data)
}

function nodePartial(node: TableRowNode): boolean {
  if (!multiple.value || !node.children.length) return false
  const selectedChildren = node.children.filter((child) =>
    isSelected(child.data),
  ).length
  return (
    (selectedChildren > 0 && selectedChildren < node.children.length) ||
    node.children.some((child) => nodePartial(child))
  )
}

function onCrudRowClick(row: Record<string, any>, event: MouseEvent) {
  const target = event.target
  if (
    target instanceof Element &&
    target.closest(
      'button, a, input, textarea, select, label, [data-slot="checkbox"], [role="radio"]',
    )
  ) {
    return
  }
  if (pickerMode.value || props.schema.checkOnItemClick === true) {
    toggleRow(row, !isSelected(row))
  }
}

const allSelected = computed(
  () => {
    const rows =
      isListMode.value || isCardsMode.value
        ? store.items
        : allCrudRows.value.map((node) => node.data)
    return rows.length > 0 && rows.every((row) => isSelected(row))
  },
)
const someSelected = computed(
  () => {
    const rows =
      isListMode.value || isCardsMode.value
        ? store.items
        : allCrudRows.value.map((node) => node.data)
    return rows.some((row) => isSelected(row)) && !allSelected.value
  },
)

function toggleAll(checked: boolean) {
  if (!isListMode.value && !isCardsMode.value) {
    const ids = selectedIdsForCurrentTree()
    for (const node of allCrudRows.value) {
      if (checked) ids.add(node.id)
      else ids.delete(node.id)
    }
    applyTreeSelection(ids)
    notifyPickerSelection()
    return
  }
  if (checked) {
    store.items.forEach((row) => {
      if (!isSelected(row)) store.selectedItems.push(row)
    })
    notifyPickerSelection()
    return
  }
  store.selectedItems = store.selectedItems.filter(
    (item) => !store.items.some((row) => sameRowIdentity(item, row)),
  )
  notifyPickerSelection()
}

function notifyPickerSelection() {
  const handler = props.schema.__pickerOnSelect
  if (typeof handler === 'function') {
    handler([...store.selectedItems])
  }
}

function selectedItemLabel(item: Record<string, any>) {
  const labelField = String(props.schema.labelField || 'label')
  const valueField = String(
    props.schema.valueField || props.schema.primaryField || primaryField.value,
  )
  return String(
    item?.[labelField] ??
      item?.[valueField] ??
      item?.[primaryField.value] ??
      '',
  )
}

function removeSelectedItem(item: Record<string, any>) {
  store.selectedItems = store.selectedItems.filter(
    (selected) => !sameRowIdentity(selected, item),
  )
  notifyPickerSelection()
}

function clearSelection() {
  store.selectedItems = []
  notifyPickerSelection()
}

function showSelectionOverflow() {
  if (selectionOverflowHideTimer) clearTimeout(selectionOverflowHideTimer)
  selectionOverflowTip.value = true
}

function hideSelectionOverflow() {
  if (selectionOverflowHideTimer) clearTimeout(selectionOverflowHideTimer)
  selectionOverflowHideTimer = setTimeout(() => {
    selectionOverflowTip.value = false
  }, 80)
}

function seedSelectionFromValue() {
  const raw = props.schema.value
  if (raw == null) return
  const values = Array.isArray(raw) ? raw : [raw]
  let key = ''
  try {
    key = JSON.stringify(values)
  } catch {
    return
  }
  const valueChanged = key !== seededValueKey.value
  const pool = selectionOptionPool()
  if (!valueChanged) {
    hydrateSelectedItems(pool)
    return
  }
  const labelField = String(props.schema.labelField || 'label')
  store.selectedItems = values.map((value) => {
    if (value && typeof value === 'object') {
      return value as Record<string, any>
    }
    const row = pool.find((item) =>
      primaryValueEqual(item?.[primaryField.value], value),
    )
    return (
      row ?? {
        [primaryField.value]: value,
        [labelField]: String(value),
      }
    )
  })
  seededValueKey.value = key
}

const bulkData = computed(() => ({
  ids: selectedIdsOf(store.selectedItems, primaryField.value),
  items: store.selectedItems,
  selectedItems: store.selectedItems,
  rows: store.selectedItems,
}))

provide(CrudHostKey, {
  name: props.schema.name,
  reload,
  get primaryField() {
    return primaryField.value
  },
  get selectedItems() {
    return store.selectedItems
  },
  setSelectedItems(items) {
    store.selectedItems = items
    notifyPickerSelection()
  },
  getIds() {
    return selectedIdsOf(store.selectedItems, primaryField.value)
  },
})

const crudApi = {
  name: crudTarget,
  id: props.schema.id ? String(props.schema.id) : undefined,
  reload,
  getData: () => ({
    items: store.items,
    rows: store.items,
    total: store.total,
    page: store.page,
    perPage: store.perPage,
    selectedItems: store.selectedItems,
    selectedIds: selectedIdsOf(store.selectedItems, primaryField.value),
  }),
}
scoped?.register(crudApi)
onMounted(() => {
  syncFromLocation()
  if (!props.schema.api) {
    seedLocalItems()
  } else {
    void reload()
  }
  if (typeof ResizeObserver !== 'undefined') {
    selectionFoldObserver = new ResizeObserver(measureSelectionTags)
    if (selectionBarEl.value) selectionFoldObserver.observe(selectionBarEl.value)
  }
  scheduleSelectionMeasure()
})
watch(selectionBarEl, (el, prev) => {
  if (prev) selectionFoldObserver?.unobserve(prev)
  if (el) selectionFoldObserver?.observe(el)
  scheduleSelectionMeasure()
})
watch(
  () => [props.schema.api, props.data] as const,
  (curr, prev) => {
    if (!prev) return
    if (!curr[0]) {
      seedLocalItems()
      return
    }
    if (isApiOutdated(prev[0], curr[0], prev[1], curr[1])) void reload()
  },
)
watch(
  () => props.schema.value,
  () => {
    seededValueKey.value = ''
    seedSelectionFromValue()
  },
  { deep: true },
)
onBeforeUnmount(() => {
  if (selectionOverflowHideTimer) clearTimeout(selectionOverflowHideTimer)
  selectionFoldObserver?.disconnect()
  scoped?.unregister(crudApi)
  hub.remove(store.id)
})
</script>

<template>
  <div class="vamis-crud w-full min-w-0" :class="{ 'is-loading': store.fetching }">
    <h2 v-if="schema.title" class="vamis-crud__title">{{ schema.title }}</h2>
    <div v-if="filterSchema" class="vamis-crud-filter">
      <SchemaRenderer
        :schema="{
          ...filterSchema,
          type: filterSchema.type || 'form',
          mode: filterSchema.mode || 'horizontal',
          wrapWithPanel: filterSchema.wrapWithPanel === true,
          api: undefined,
          reload: schema.name,
          submitText: filterSchema.submitText || '搜索',
          resetAfterSubmit: false,
        }"
      />
    </div>
    <div
      v-if="showSelectionBar"
      ref="selectionBarEl"
      class="vamis-crud-selection"
      :class="{ 'is-overflow': foldSelection }"
    >
      <div ref="selectionLabelEl" class="vamis-crud-selection-label">
        已选{{ store.selectedItems.length }}条：
      </div>
      <div
        v-for="(item, index) in visibleSelectedItems"
        :key="`selection-${index}`"
        class="vamis-crud-selection-value"
      >
        <button
          type="button"
          class="vamis-crud-selection-value-icon"
          :aria-label="`移除 ${selectedItemLabel(item)}`"
          @click="removeSelectedItem(item)"
        >
          <VamisClose />
        </button>
        <span class="vamis-crud-selection-value-label">
          {{ selectedItemLabel(item) }}
        </span>
      </div>
      <span
        v-if="hiddenSelectedCount > 0"
        ref="selectionMoreEl"
        class="vamis-crud-selection-more"
        @mouseenter="showSelectionOverflow"
        @mouseleave="hideSelectionOverflow"
      >
        +{{ hiddenSelectedCount }}
      </span>
      <div
        v-if="foldSelection"
        ref="selectionMeasureEl"
        class="vamis-crud-selection-measure"
        aria-hidden="true"
      >
        <div
          v-for="(item, index) in store.selectedItems"
          :key="`selection-measure-${index}`"
          class="vamis-crud-selection-value"
          data-fold-chip
        >
          <button
            type="button"
            class="vamis-crud-selection-value-icon"
          >
            <VamisClose />
          </button>
          <span class="vamis-crud-selection-value-label">
            {{ selectedItemLabel(item) }}
          </span>
        </div>
        <span class="vamis-crud-selection-more" data-fold-more>+ 00</span>
      </div>
      <a
        ref="selectionClearEl"
        href="#"
        class="vamis-crud-selection-clear"
        @click.prevent="clearSelection"
      >
        清空
      </a>
    </div>
    <VamisTooltipLayer
      :show="selectionOverflowTip && hiddenSelectedCount > 0"
      :target="selectionMoreEl"
      :container="selectionOverflowContainer"
      :tooltip="selectionOverflowTooltip"
      :data="props.data"
      @enter="showSelectionOverflow"
      @leave="hideSelectionOverflow"
    >
      <template #body>
        <div class="vamis-crud-selection-overflow__grid">
          <div
            v-for="(item, index) in hiddenSelectedItems"
            :key="`selection-overflow-${index}`"
            class="vamis-crud-selection-value"
          >
            <button
              type="button"
              class="vamis-crud-selection-value-icon"
              :aria-label="`移除 ${selectedItemLabel(item)}`"
              @click="removeSelectedItem(item)"
            >
              <VamisClose />
            </button>
            <span class="vamis-crud-selection-value-label">
              {{ selectedItemLabel(item) }}
            </span>
          </div>
        </div>
      </template>
    </VamisTooltipLayer>
    <div v-if="!isCardsMode && (headerToolbar.length || bulkActions.length)" class="flex items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <SchemaRenderer v-for="(node, i) in headerToolbar" :key="i" :schema="toolbarNode(node)" />
        <span v-if="bulkActions.length" class="vamis-crud__selected tabular-nums">已选 {{ store.selectedItems.length }}</span>
        <SchemaRenderer
          v-for="(btn, i) in bulkActions"
          :key="'bulk-' + i"
          :schema="bulkActionSchema(btn)"
          :extra-data="bulkData"
        />
      </div>
    </div>
    <div class="vamis-crud-body">
    <div class="vamis-crud-content">
    <Cards v-if="isCardsMode" :schema="cardsChild" :data="cardsData" :items="store.items">
      <template v-if="cardsHeaderToolbarOpen" #headerToolbar>
        <div class="vamis-crud-toolbar">
          <template v-for="(node, i) in resolvedHeaderToolbar" :key="'ht-' + i">
            <div
              v-if="!isBulkToolbar(node) || bulkActions.length"
              class="vamis-crud-toolbar-item"
              :class="toolbarAlign(node) === 'right' ? 'vamis-crud-toolbar-item--right' : 'vamis-crud-toolbar-item--left'"
            >
              <div v-if="isBulkToolbar(node)" class="vamis-crud-actions">
                <SchemaRenderer
                  v-for="(btn, bi) in bulkActions"
                  :key="'bulk-' + bi"
                  :schema="bulkActionSchema(btn)"
                  :extra-data="bulkData"
                />
              </div>
              <SchemaRenderer v-else :schema="toolbarNode(node)" />
            </div>
          </template>
        </div>
      </template>
    </Cards>
    <div v-else-if="isListMode" class="vamis-crud-list">
      <div
        v-for="row in store.items"
        :key="row.id ?? JSON.stringify(row)"
        class="vamis-crud-list-item"
        :class="{ 'is-checked': isSelected(row) }"
        :data-state="isSelected(row) ? 'selected' : undefined"
        @click="onCrudRowClick(row, $event)"
      >
        <div v-if="selectable" class="vamis-crud-list-check">
          <button
            v-if="!multiple"
            type="button"
            class="vamis-radio-dot"
            role="radio"
            :aria-checked="isSelected(row)"
            @click.stop="toggleRow(row, true)"
          />
          <Checkbox
            v-else
            :model-value="isSelected(row)"
            @click.stop
            @update:model-value="toggleRow(row, $event === true)"
          />
        </div>
        <span class="vamis-crud-list-text">
          {{ listDisplayColumn?.name != null ? row[listDisplayColumn.name] ?? '' : '' }}
        </span>
      </div>
      <div v-if="!store.items.length" class="vamis-crud-list-empty">暂无数据</div>
    </div>
    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead v-if="selectable && multiple" class="w-10">
            <Checkbox
              :model-value="allSelected ? true : someSelected ? 'indeterminate' : false"
              @update:model-value="toggleAll($event === true)"
            />
          </TableHead>
          <TableHead
            v-for="(col, colIndex) in columns"
            :key="`${col.name || col.label || ''}`"
            :class="col.name && col.sortable !== false && col.type !== 'operation' ? 'cursor-pointer select-none' : ''"
            @click="toggleSort(col)"
          >
            <a
              v-if="isNested && colIndex === 0 && expandAllEnabled"
              class="vamis-table__expand-btn"
              :class="{ 'is-active': allCrudExpanded }"
              role="button"
              aria-label="展开全部"
              @click.stop="toggleCrudExpandAll"
            >
              <VamisCaret variant="tree" />
            </a>
            {{ col.label || col.name }}{{ sortMark(col) }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!crudRowTree.length">
          <TableCell :colspan="Math.max(columns.length, 1) + (selectable ? 1 : 0)" class="vamis-crud__empty py-10 text-center">
            暂无数据
          </TableCell>
        </TableRow>
        <TableRow
          v-for="node in visibleCrudRows"
          :key="node.id"
          :data-state="nodeSelected(node) ? 'selected' : undefined"
          :class="{
            'is-checked': nodeSelected(node),
            'is-expanded': crudRowExpanded(node),
            'is-expandable': crudRowExpandable(node),
          }"
          @click="onCrudRowClick(node.data, $event)"
        >
          <TableCell v-if="selectable">
            <button
              v-if="!multiple"
              type="button"
              class="vamis-radio-dot"
              role="radio"
              :aria-checked="nodeSelected(node)"
              @click.stop="toggleRow(node.data, true)"
            />
            <Checkbox
              v-else
              :model-value="nodePartial(node) ? 'indeterminate' : nodeSelected(node)"
              @click.stop
              @update:model-value="toggleRow(node.data, $event === true)"
            />
          </TableCell>
          <TableCell
            v-for="(col, colIndex) in columns"
            :key="`${col.name || col.label || ''}`"
            :class="{ 'vamis-table__primary-cell': isNested && colIndex === 0 }"
          >
            <template v-if="isNested && colIndex === 0">
              <span
                class="vamis-table__indent"
                :style="{ paddingLeft: `calc(${node.depth - 1} * var(--table-tree-indent))` }"
              />
              <a
                v-if="crudRowExpandable(node)"
                class="vamis-table__expand-btn"
                :class="{ 'is-active': crudRowExpanded(node) }"
                role="button"
                :aria-expanded="crudRowExpanded(node)"
                @click.stop="toggleCrudRowExpanded(node)"
              >
                <VamisCaret variant="tree" />
              </a>
              <span v-else class="vamis-table__expand-space" />
            </template>
            <template v-if="col.type === 'operation'">
              <div class="flex gap-1">
                <SchemaRenderer
                  v-for="(btn, bi) in operationButtons(col)"
                  :key="bi"
                  :schema="operationButtonSchema(btn)"
                  :extra-data="node.data"
                />
              </div>
            </template>
            <RowValueHost
              v-else-if="col.type && col.type !== 'text' && col.type !== 'plain'"
              :isolate-names="isFormItemType(String(col.type))"
              @change="onCellChange(node.data, $event)"
            >
              <SchemaRenderer :schema="cellSchema(col)" :extra-data="node.data" />
            </RowValueHost>
            <template v-else-if="quickEditable(col)">
              <select
                v-if="editingCell === cellEditKey(node.data, col) && quickEditType(col) === 'select'"
                v-model="draftValue"
                class="vamis-crud__edit-field h-7 w-full rounded border px-1"
                autofocus
                @click.stop
                @change="commitCellEdit(node.data, col)"
                @blur="commitCellEdit(node.data, col)"
              >
                <option v-for="opt in quickEditOptions(col)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <textarea
                v-else-if="editingCell === cellEditKey(node.data, col) && quickEditType(col) === 'textarea'"
                v-model="draftValue"
                class="vamis-crud__edit-field min-h-16 w-full rounded border px-1"
                autofocus
                @click.stop
                @blur="commitCellEdit(node.data, col)"
              />
              <input
                v-else-if="editingCell === cellEditKey(node.data, col)"
                v-model="draftValue"
                :type="quickEditType(col) === 'input-number' ? 'number' : 'text'"
                class="vamis-crud__edit-field h-7 w-full rounded border px-1"
                autofocus
                @click.stop
                @blur="commitCellEdit(node.data, col)"
                @keydown.enter.prevent="commitCellEdit(node.data, col)"
                @keydown.esc.prevent="cancelCellEdit"
              >
              <span v-else class="inline-flex items-center gap-1">
                {{ node.data[String(col.name || '')] ?? '' }}
                <button type="button" class="vamis-crud__edit" aria-label="编辑" @click.stop="startCellEdit(node.data, col)"><VamisIcon name="pencil" /></button>
              </span>
            </template>
            <PopOverHost v-else :schema="col" :data="node.data">
              <span>{{ col.name != null ? node.data[col.name] ?? '' : '' }}</span>
            </PopOverHost>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Spinner :schema="spinnerSchema" />
    </div>
    <div v-if="showPager" class="vamis-table-foot-toolbar">
      <div class="vamis-crud-toolbar">
        <div
          v-for="(node, index) in resolvedFooterToolbar"
          :key="`footer-${index}`"
          class="vamis-crud-toolbar-item"
          :class="`vamis-crud-toolbar-item--${footerNodeAlign(node)}`"
        >
          <span v-if="isStatisticsNode(node)" class="vamis-crud-statistics">{{ statisticsText }}</span>
          <Pagination
            v-else-if="isPaginationNode(node)"
            :schema="footerNodeSchema(node)"
            @page-change="onPagerChange"
          />
          <SchemaRenderer v-else :schema="footerNodeSchema(node)" />
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
