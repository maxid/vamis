<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createStoreId,
  createVamisEvent,
  evalExpression,
  eventEvalData,
  getByPath,
  isApiOutdated,
  isFormItemType,
  requestApi,
  runOnEvent,
  setByPathCopy,
  useEnv,
  useRendererHub,
  useScoped,
  type SchemaObject,
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
  VamisClose,
  VamisIcon,
} from '@vamis/ui'
import Cards from './Cards.vue'
import Pagination from './Pagination.vue'
import PopOverHost from './PopOverHost.vue'
import Spinner from './Spinner.vue'
import RowValueHost from './data/RowValueHost.vue'
import {
  asToolbarSchema,
  CrudHostKey,
  isBulkToolbar,
  parseListPayload,
  resolveTableSource,
  selectedIdsOf,
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

const columns = computed(() => (props.schema.columns || []) as SchemaObject[])
const filterSchema = computed(() => props.schema.filter as SchemaObject | undefined)
const headerToolbar = computed(() => asArray(props.schema.headerToolbar))
const editingCell = ref('')
const draftValue = ref('')
const allItems = ref<Record<string, any>[]>([])
const seededValueKey = ref('')
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
const listDisplayColumn = computed(
  () => columns.value.find((col) => col.type !== 'operation') || columns.value[0],
)
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
const visibleSelectedItems = computed(() =>
  selectionMaxCount.value > 0
    ? store.selectedItems.slice(0, selectionMaxCount.value)
    : store.selectedItems,
)
const hiddenSelectedCount = computed(() =>
  Math.max(0, store.selectedItems.length - visibleSelectedItems.value.length),
)
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
const showPager = computed(
  () => !isCardsMode.value && (props.schema.alwaysShowPagination === true || lastPage.value > 1),
)
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

function isSelected(row: Record<string, any>) {
  return store.selectedItems.some((item) => sameRowIdentity(item, row))
}

function toggleRow(row: Record<string, any>, checked: boolean) {
  if (!multiple.value) {
    store.selectedItems = checked ? [row] : []
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
  () => store.items.length > 0 && store.items.every((row) => isSelected(row)),
)
const someSelected = computed(
  () => store.items.some((row) => isSelected(row)) && !allSelected.value,
)

function toggleAll(checked: boolean) {
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
  if (!valueChanged) return
  const pool = [...allItems.value, ...store.items]
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
    return
  }
  void reload()
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
    <div v-if="showSelectionBar" class="vamis-crud-selection">
      <div class="vamis-crud-selection-label">
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
      <span v-if="hiddenSelectedCount > 0" class="vamis-crud-selection-more">
        +{{ hiddenSelectedCount }}
      </span>
      <a
        href="#"
        class="vamis-crud-selection-clear"
        @click.prevent="clearSelection"
      >
        清空
      </a>
    </div>
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
            v-for="col in columns"
            :key="`${col.name || col.label || ''}`"
            :class="col.name && col.sortable !== false && col.type !== 'operation' ? 'cursor-pointer select-none' : ''"
            @click="toggleSort(col)"
          >
            {{ col.label || col.name }}{{ sortMark(col) }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!store.items.length">
          <TableCell :colspan="Math.max(columns.length, 1) + (selectable ? 1 : 0)" class="vamis-crud__empty py-10 text-center">
            暂无数据
          </TableCell>
        </TableRow>
        <TableRow
          v-for="row in store.items"
          :key="row.id ?? JSON.stringify(row)"
          :data-state="isSelected(row) ? 'selected' : undefined"
          :class="{ 'is-checked': isSelected(row) }"
          @click="onCrudRowClick(row, $event)"
        >
          <TableCell v-if="selectable">
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
          </TableCell>
          <TableCell v-for="col in columns" :key="`${col.name || col.label || ''}`">
            <template v-if="col.type === 'operation'">
              <div class="flex gap-1">
                <SchemaRenderer
                  v-for="(btn, bi) in operationButtons(col)"
                  :key="bi"
                  :schema="operationButtonSchema(btn)"
                  :extra-data="row"
                />
              </div>
            </template>
            <RowValueHost
              v-else-if="col.type && col.type !== 'text' && col.type !== 'plain'"
              :isolate-names="isFormItemType(String(col.type))"
              @change="onCellChange(row, $event)"
            >
              <SchemaRenderer :schema="cellSchema(col)" :extra-data="row" />
            </RowValueHost>
            <template v-else-if="quickEditable(col)">
              <select
                v-if="editingCell === cellEditKey(row, col) && quickEditType(col) === 'select'"
                v-model="draftValue"
                class="vamis-crud__edit-field h-7 w-full rounded border px-1"
                autofocus
                @click.stop
                @change="commitCellEdit(row, col)"
                @blur="commitCellEdit(row, col)"
              >
                <option v-for="opt in quickEditOptions(col)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <textarea
                v-else-if="editingCell === cellEditKey(row, col) && quickEditType(col) === 'textarea'"
                v-model="draftValue"
                class="vamis-crud__edit-field min-h-16 w-full rounded border px-1"
                autofocus
                @click.stop
                @blur="commitCellEdit(row, col)"
              />
              <input
                v-else-if="editingCell === cellEditKey(row, col)"
                v-model="draftValue"
                :type="quickEditType(col) === 'input-number' ? 'number' : 'text'"
                class="vamis-crud__edit-field h-7 w-full rounded border px-1"
                autofocus
                @click.stop
                @blur="commitCellEdit(row, col)"
                @keydown.enter.prevent="commitCellEdit(row, col)"
                @keydown.esc.prevent="cancelCellEdit"
              >
              <span v-else class="inline-flex items-center gap-1">
                {{ row[String(col.name || '')] ?? '' }}
                <button type="button" class="vamis-crud__edit" aria-label="编辑" @click.stop="startCellEdit(row, col)"><VamisIcon name="pencil" /></button>
              </span>
            </template>
            <PopOverHost v-else :schema="col" :data="row">
              <span>{{ col.name != null ? row[col.name] ?? '' : '' }}</span>
            </PopOverHost>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Spinner :schema="spinnerSchema" />
    </div>
    <div v-if="showPager" class="vamis-table-foot-toolbar">
      <div class="vamis-crud-toolbar">
        <div class="vamis-crud-toolbar-item vamis-crud-toolbar-item--left">
          <span class="vamis-crud-statistics">{{ statisticsText }}</span>
        </div>
        <div class="vamis-crud-toolbar-item vamis-crud-toolbar-item--right">
          <Pagination :schema="pagerSchema" @page-change="onPagerChange" />
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
