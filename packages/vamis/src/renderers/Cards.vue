<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  SchemaRenderer,
  cardsCardSchema,
  cardsCheckAll,
  cardsCheckOnItemClick,
  cardsColumnsCount,
  cardsFooter,
  cardsHeader,
  cardsHideCheckToggler,
  cardsMasonry,
  cardsMultiple,
  cardsPlaceholder,
  cardsPlaceholderNode,
  cardsSelectable,
  cardsSource,
  cardsTitle,
  createVamisEvent,
  eventEvalData,
  resolveClassName,
  runOnEvent,
  useEnv,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { Button, VamisIcon } from '@vamis/ui'
import Sortable from 'sortablejs'
import { matchListRows } from './list-utils'
import { useCrudHost } from './data/crudHost'
import { provideCardsSelect } from './cardsSelect'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
  items?: Record<string, any>[]
}>()

const host = useCrudHost()
const scoped = useScoped()
const env = useEnv()
const ORIGIN = Symbol('cardsOrigin')
const localSelected = ref<Record<string, any>[]>([])
const localRows = ref<Record<string, any>[] | null>(null)
const snapshot = ref<Record<string, any>[] | null>(null)
const dragging = ref(false)
const moved = ref(0)
const bodyEl = ref<HTMLElement | null>(null)
let sortable: Sortable | null = null
const rows = computed(() => {
  if (localRows.value) return localRows.value
  return cardsSource(props.schema, props.data || {}, props.items)
})
function asSchema(node: unknown): SchemaObject {
  return node as SchemaObject
}
const card = computed(() => cardsCardSchema(props.schema))
const title = computed(() => cardsTitle(props.schema, props.data || {}))
const masonry = computed(() => cardsMasonry(props.schema))
const columnsCount = computed(() => cardsColumnsCount(props.schema))
const placeholder = computed(() => cardsPlaceholder(props.schema))
const placeholderNode = computed(() => cardsPlaceholderNode(props.schema))
const header = computed(() => cardsHeader(props.schema))
const footer = computed(() => cardsFooter(props.schema))
const selectable = computed(() => cardsSelectable(props.schema))
const checkOnItemClick = computed(() => cardsCheckOnItemClick(props.schema))
const hideCheckToggler = computed(() => cardsHideCheckToggler(props.schema))
const multiple = computed(() => cardsMultiple(props.schema))
const checkAll = computed(() => cardsCheckAll(props.schema))
const colsStyle = computed(() => {
  if (!columnsCount.value) return undefined
  return { '--cards-cols': String(columnsCount.value) } as Record<string, string>
})
const headerClass = computed(() => resolveClassName(props.schema.headerClassName, props.data || {}))
const footerClass = computed(() => resolveClassName(props.schema.footerClassName, props.data || {}))
function itemClass(row: Record<string, any>, index: number) {
  return resolveClassName(props.schema.itemClassName, { ...(props.data || {}), ...row, index })
}

function rowKey(row: Record<string, any>) {
  if (host?.primaryField && row[host.primaryField] != null && row[host.primaryField] !== '') {
    return String(row[host.primaryField])
  }
  return row.id != null && row.id !== '' ? String(row.id) : JSON.stringify(row)
}

function selectedList() {
  return host ? host.selectedItems : localSelected.value
}

function itemKey(row: Record<string, any>) {
  if (row.cardsItemKey != null && row.cardsItemKey !== '') return String(row.cardsItemKey)
  return rowKey(row)
}

function sourceRow(row: Record<string, any>) {
  const key = itemKey(row)
  return rows.value.find((item) => rowKey(item) === key) || row
}

function isSelected(row: Record<string, any>) {
  const key = itemKey(row)
  return selectedList().some((item) => rowKey(item) === key)
}

function setSelected(items: Record<string, any>[]) {
  if (host) host.setSelectedItems(items)
  else localSelected.value = items
}

function eventCtx(name: string, extra: Record<string, unknown>, native?: Event) {
  const payload = { ...(props.data || {}), ...extra }
  const event = createVamisEvent(name, payload, native)
  return {
    event,
    ctx: { env, data: eventEvalData(payload, event), scoped, event },
  }
}

async function emitSelected() {
  const selectItems = selectedList()
  const keys = new Set(selectItems.map((item) => rowKey(item)))
  const unSelectItems = rows.value.filter((item) => !keys.has(rowKey(item)))
  const { ctx } = eventCtx('selected', { selectItems, unSelectItems })
  await runOnEvent(props.schema, 'selected', ctx)
}

async function emitSelectedChange(item: Record<string, any>) {
  const { ctx } = eventCtx('selectedChange', { item })
  await runOnEvent(props.schema, 'selectedChange', ctx)
}

function dataOf(row: Record<string, any>) {
  const out: Record<string, any> = {}
  for (const key of Object.keys(row)) out[key] = row[key]
  return out
}

function stampOrigin(row: Record<string, any>, orig?: Record<string, any>) {
  const copy = dataOf(row)
  copy[ORIGIN] = orig ? dataOf(orig) : dataOf(row)
  return copy
}

function originOf(row: Record<string, any>) {
  return row[ORIGIN] as Record<string, any> | undefined
}

function rowIsModified(row: Record<string, any>) {
  const orig = originOf(row)
  if (!orig) return false
  const keys = new Set([...Object.keys(row), ...Object.keys(orig)])
  for (const key of keys) {
    const a = row[key]
    const b = orig[key]
    if (Object.is(a, b)) continue
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      try {
        if (JSON.stringify(a) !== JSON.stringify(b)) return true
      } catch {
        return true
      }
      continue
    }
    return true
  }
  return false
}

function isModified(row?: Record<string, any>) {
  if (!row) return false
  const i = Number(row.index)
  const list = localRows.value || rows.value
  if (Number.isFinite(i) && i >= 0 && i < list.length) return rowIsModified(list[i])
  const key = itemKey(row)
  const found = list.find((item) => rowKey(item) === key)
  return found ? rowIsModified(found) : false
}

function adoptRows(list: Record<string, any>[]) {
  return list.map((row) => stampOrigin(row))
}

function ensureLocal() {
  if (!localRows.value) localRows.value = adoptRows(rows.value)
}

function applySetValue(
  values: Record<string, unknown> | unknown[] | undefined,
  replace?: boolean,
  index?: unknown,
  condition?: unknown,
) {
  ensureLocal()
  const data = props.data || {}
  if (index != null || condition != null) {
    const next = (localRows.value || []).slice()
    const targets = matchListRows(next, data, index, condition)
    const patch = (values && typeof values === 'object' && !Array.isArray(values) ? values : {}) as Record<string, any>
    for (const i of targets) {
      const current = next[i]
      if (!current) continue
      const orig = originOf(current) || dataOf(current)
      const patched = replace ? dataOf(patch) : { ...dataOf(current), ...patch }
      next[i] = stampOrigin(patched, orig)
    }
    localRows.value = next
    return
  }
  if (Array.isArray(values)) {
    localRows.value = adoptRows(values as Record<string, any>[])
    setSelected([])
    return
  }
  const next = values?.items ?? values?.rows
  if (Array.isArray(next)) {
    localRows.value = adoptRows(next as Record<string, any>[])
    setSelected([])
  }
}

function destroySortable() {
  sortable?.destroy()
  sortable = null
}

function initSortable() {
  destroySortable()
  const el = bodyEl.value
  if (!el) return
  sortable = new Sortable(el, {
    animation: 150,
    handle: '.vamis-card-drag',
    ghostClass: 'is-dragging',
    onEnd(event) {
      const from = event.oldIndex
      const to = event.newIndex
      if (from == null || to == null || from === to) return
      ensureLocal()
      const next = (localRows.value || []).slice()
      const [movedRow] = next.splice(from, 1)
      next.splice(to, 0, movedRow)
      localRows.value = next
      if (!snapshot.value) snapshot.value = rows.value.map((row) => ({ ...row }))
      moved.value += 1
    },
  })
}

async function toggle(row: Record<string, any>, checked?: boolean) {
  const actual = sourceRow(row)
  const on = checked == null ? !isSelected(actual) : checked
  if (!multiple.value) {
    setSelected(on ? [actual] : [])
  } else if (on) {
    if (!isSelected(actual)) setSelected([...selectedList(), actual])
  } else {
    const key = rowKey(actual)
    setSelected(selectedList().filter((item) => rowKey(item) !== key))
  }
  await emitSelectedChange(actual)
  await emitSelected()
}

async function onItemClick(row: Record<string, any>, native: MouseEvent) {
  const actual = sourceRow(row)
  const index = Number(row.index)
  const { ctx } = eventCtx(
    'rowClick',
    { item: actual, index: Number.isFinite(index) ? index : rows.value.indexOf(actual) },
    native,
  )
  await runOnEvent(props.schema, 'rowClick', ctx)
}

provideCardsSelect({
  selectable,
  checkOnItemClick,
  hideCheckToggler,
  multiple,
  dragging: computed(() => dragging.value),
  isSelected,
  isModified,
  toggle,
  onItemClick,
})

const allChecked = computed(
  () => rows.value.length > 0 && rows.value.every((row) => isSelected(row)),
)
const showCheckAllBtn = computed(
  () =>
    selectable.value &&
    checkAll.value &&
    multiple.value &&
    rows.value.length > 0 &&
    !dragging.value,
)
const showHeaderCheckAll = computed(() => showCheckAllBtn.value)
const showFooterCheckAll = computed(() => showCheckAllBtn.value)
const modifiedCount = computed(() => (localRows.value || []).filter(rowIsModified).length)
const showQuickSave = computed(() => modifiedCount.value > 0 && props.schema.hideQuickSaveBtn !== true)
const unsaved = computed(() => showQuickSave.value || moved.value > 0)

async function toggleCheckAll() {
  if (allChecked.value) setSelected([])
  else setSelected(rows.value.slice())
  await emitSelected()
}

async function saveOrder() {
  const movedItems = (localRows.value || []).map((row) => ({ ...row }))
  const { event, ctx } = eventCtx('orderChange', { movedItems })
  await runOnEvent(props.schema, 'orderChange', ctx)
  if (event.prevented) return
  snapshot.value = movedItems
  moved.value = 0
  dragging.value = false
}

function saveModified() {
  if (!localRows.value) return
  localRows.value = localRows.value.map((row) => stampOrigin(row))
}

function resetModified() {
  if (!localRows.value) return
  localRows.value = localRows.value.map((row) => {
    const orig = originOf(row)
    return orig ? stampOrigin(orig, orig) : stampOrigin(row)
  })
}

function resetOrder() {
  if (snapshot.value) localRows.value = snapshot.value.map((row) => ({ ...row }))
  moved.value = 0
  dragging.value = false
}

const cardsApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => ({
    items: rows.value,
    rows: rows.value,
    total: rows.value.length,
    selectedItems: selectedList(),
  }),
  setData: (
    values?: Record<string, unknown> | unknown[],
    replace?: boolean,
    index?: unknown,
    condition?: unknown,
  ) => applySetValue(values, replace, index, condition),
  async doAction(action: { actionType?: string; args?: Record<string, unknown> }) {
    const type = action?.actionType
    const args = action?.args || {}
    if (type === 'selectAll') {
      setSelected(rows.value.slice())
      await emitSelected()
    } else if (type === 'clearAll') {
      setSelected([])
      await emitSelected()
    } else if (type === 'select') {
      const indexes = matchListRows(rows.value, props.data || {}, args.index, args.condition)
      setSelected(indexes.map((i) => rows.value[i]).filter(Boolean) as Record<string, any>[])
      await emitSelected()
    } else if (type === 'initDrag') {
      ensureLocal()
      if (!snapshot.value) snapshot.value = (localRows.value || []).map((row) => ({ ...row }))
      setSelected([])
      dragging.value = true
      await emitSelected()
    } else if (type === 'cancelDrag') {
      dragging.value = false
    } else if (type === 'setValue') {
      cardsApi.setData(
        (args.value || {}) as Record<string, unknown>,
        Boolean(args.replace),
        args.index,
        args.condition,
      )
    }
  },
}
scoped?.register(cardsApi as never)
onBeforeUnmount(() => {
  scoped?.unregister(cardsApi as never)
  destroySortable()
})
watch([dragging, bodyEl, () => rows.value.length], () => {
  if (dragging.value) void nextTick(initSortable)
  else destroySortable()
})
</script>

<template>
  <div class="vamis-cards-wrap" :class="{ 'is-unsaved': unsaved }">
    <div v-if="showQuickSave" class="vamis-cards-title">
      当前有 {{ modifiedCount }} 条记录修改了内容, 但并没有提交。请选择:
      <Button type="button" size="xs" variant="success" class="m-l-sm" @click="saveModified">
        <VamisIcon name="check" class="icon m-r-xs" />
        提交
      </Button>
      <Button type="button" size="xs" variant="destructive" class="m-l-sm" @click="resetModified">
        <VamisIcon name="close" class="icon m-r-xs" />
        放弃
      </Button>
    </div>
    <div v-else-if="moved" class="vamis-cards-title">
      当前有 {{ moved }} 条记录修改了顺序, 但并没有提交。请选择:
      <Button type="button" size="xs" variant="success" class="m-l-sm" @click="saveOrder">
        <VamisIcon name="check" class="icon m-r-xs" />
        提交
      </Button>
      <Button type="button" size="xs" variant="destructive" class="m-l-sm" @click="resetOrder">
        <VamisIcon name="close" class="icon m-r-xs" />
        放弃
      </Button>
    </div>
    <div v-else-if="title" class="vamis-cards-title">{{ title }}</div>
    <div v-if="header.length" class="vamis-cards-header" :class="headerClass">
      <SchemaRenderer v-for="(node, i) in header" :key="'h' + i" :schema="asSchema(node)" />
    </div>
    <div v-if="showHeaderCheckAll || dragging || $slots.headerToolbar" class="vamis-cards-toolbar">
      <div v-if="showHeaderCheckAll || dragging" class="vamis-cards-actions">
        <Button
          v-if="showHeaderCheckAll"
          type="button"
          size="sm"
          :variant="allChecked ? 'default' : 'outline'"
          title="切换全选"
          @click="toggleCheckAll"
        >
          全选
        </Button>
      </div>
      <slot name="headerToolbar" />
      <div v-if="dragging" class="vamis-cards-dragTip">请拖动顶部的按钮进行排序</div>
    </div>
    <div
      v-if="rows.length"
      ref="bodyEl"
      class="vamis-cards"
      :class="{
        'is-masonry': masonry,
        'is-count': columnsCount > 0,
      }"
      :style="colsStyle"
    >
      <div v-for="(row, i) in rows" :key="i" class="vamis-cards-item" :class="itemClass(row, i)">
        <SchemaRenderer :schema="asSchema(card)" :extra-data="{ ...row, index: i, cardsItemKey: rowKey(row) }" />
      </div>
    </div>
    <div v-else class="vamis-cards-placeholder">
      <SchemaRenderer v-if="placeholderNode" :schema="asSchema(placeholderNode)" />
      <template v-else>{{ placeholder }}</template>
    </div>
    <div v-if="showFooterCheckAll || $slots.footerToolbar" class="vamis-cards-toolbar">
      <div v-if="showFooterCheckAll" class="vamis-cards-actions">
        <Button
          type="button"
          size="sm"
          :variant="allChecked ? 'default' : 'outline'"
          title="切换全选"
          @click="toggleCheckAll"
        >
          全选
        </Button>
      </div>
      <slot name="footerToolbar" />
    </div>
    <div v-if="footer.length" class="vamis-cards-footer" :class="footerClass">
      <SchemaRenderer v-for="(node, i) in footer" :key="'f' + i" :schema="asSchema(node)" />
    </div>
  </div>
</template>
