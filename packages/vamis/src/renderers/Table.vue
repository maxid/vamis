<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  SchemaRenderer,
  createVamisEvent,
  eventEvalData,
  resolveClassName,
  resolveValue,
  runAction,
  runOnEvent,
  useEnv,
  useScoped,
  type ActionSchema,
  type SchemaObject,
} from '@vamis/core'
import PopOverHost from './PopOverHost.vue'
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
const multiple = computed(() => props.schema.multiple !== false)
const selected = ref<number[]>([])
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
  if (!state) return rows.value
  const field = state.key
  return [...rows.value].sort((a, b) => {
    const av = a?.[field]
    const bv = b?.[field]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    const diff = String(av).localeCompare(String(bv), 'zh-CN', { numeric: true })
    return state.dir === 'asc' ? diff : -diff
  })
})

const dragFrom = ref(-1)
const dragOrder = ref<number[] | null>(null)
const displayRows = computed(() => {
  if (!dragOrder.value) return sortedRows.value
  return dragOrder.value.map((i) => sortedRows.value[i]).filter(Boolean)
})

function onDragStartRow(index: number, event: DragEvent) {
  if (props.schema.draggable !== true) return
  dragFrom.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

async function onDropRow(index: number, event: DragEvent) {
  event.preventDefault()
  if (props.schema.draggable !== true || dragFrom.value < 0 || dragFrom.value === index) return
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

function toggle(i: number) {
  if (multiple.value) selected.value = selected.value.includes(i) ? selected.value.filter((n) => n !== i) : [...selected.value, i]
  else selected.value = selected.value[0] === i ? [] : [i]
}

function allSelected() {
  return rows.value.length > 0 && selected.value.length === sortedRows.value.length
}

function toggleAll() {
  selected.value = allSelected() ? [] : displayRows.value.map((_, i) => i)
}

async function emitRowClick(row: Record<string, any>, i: number, event: MouseEvent) {
  if (selectable.value) toggle(i)
  const payload = { ...(props.data || {}), ...row, index: i }
  const ev = createVamisEvent('rowClick', payload, event)
  await runOnEvent(props.schema, 'rowClick', { env, data: eventEvalData(payload, ev), scoped, event: ev })
  if (ev.prevented) return
  await onRowClick(row, event)
}

const tableApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => ({ selectedItems: selected.value.map((i) => displayRows.value[i]).filter(Boolean) }),
  setData: () => {},
  async doAction(action: { actionType?: string; args?: { index?: string | number } }) {
    const type = action?.actionType
    if (type === 'selectAll') selected.value = displayRows.value.map((_, i) => i)
    else if (type === 'clearAll') selected.value = []
    else if (type === 'select') {
      selected.value = String(action.args?.index ?? '')
        .split(',')
        .map((part) => Number(part.trim()))
        .filter((n) => Number.isFinite(n) && displayRows.value[n])
    }
  },
}
scoped?.register(tableApi as never)
onBeforeUnmount(() => scoped?.unregister(tableApi as never))
const columns = computed(() => (props.schema.columns || []) as SchemaObject[])

function colWidthStyle(col: SchemaObject) {
  const w = col.width
  if (w == null || w === '') return undefined
  const value = typeof w === 'number' ? `${w}px` : String(w)
  return { width: value, maxWidth: value, overflow: 'hidden' }
}
const rows = computed<Record<string, any>[]>(() => {
  if (Array.isArray(props.items)) return props.items
  const source = props.schema.source
  if (typeof source === 'string' && source.startsWith('$') && props.data) {
    const key = source.replace(/^\$\{?|\}$/g, '')
    const value = props.data[key]
    return Array.isArray(value) ? value : []
  }
  const raw = props.schema.data
  if (typeof raw === 'string' && props.data) {
    const value = resolveValue(raw, props.data)
    return Array.isArray(value) ? value : []
  }
  return Array.isArray(raw) ? raw : []
})
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
  return resolveClassName(props.schema.rowClassName, row)
}
</script>

<template>
  <div class="vamis-table-wrap">
  <div v-if="schema.title" class="vamis-table__title">{{ schema.title }}</div>
  <Table>
    <TableHeader>
      <TableRow v-if="hasGroups">
        <TableHead v-if="selectable" :rowspan="2" />
        <TableHead v-for="(group, gi) in headerGroups" :key="'g' + gi" :colspan="group.span" class="text-center">
          {{ group.label }}
        </TableHead>
      </TableRow>
      <TableRow>
        <TableHead v-if="selectable" :rowspan="hasGroups ? 2 : undefined" class="w-10"><input type="checkbox" :checked="allSelected()" @change="toggleAll"></TableHead>
        <TableHead v-for="col in columns" :key="`${col.name || col.label || ''}`" :style="colWidthStyle(col)" :class="{ 'cursor-pointer select-none': col.sortable === true }" @click="sortBy(col)">
          {{ col.label || col.name }}
          <span v-if="col.sortable === true" class="ml-1 text-xs text-muted-foreground">{{ sortIcon(col) }}</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="!rows.length">
        <TableCell :colspan="Math.max(columns.length, 1)" class="py-8 text-center text-muted-foreground">
          {{ schema.placeholder || '暂无数据' }}
        </TableCell>
      </TableRow>
      <TableRow v-for="(row, i) in sortedRows" :key="row.id ?? i" :class="rowClass(row)" @click="onRowClick(row, $event)">
        <TableCell
          v-for="(col, ci) in columns"
          :key="`${col.name || col.label || ''}`"
          :style="colWidthStyle(col)"
          :rowspan="cellMeta(i, ci)?.rowspan"
          :class="{ invisible: cellMeta(i, ci)?.skip }"
        >
          <SchemaRenderer
            v-if="col.type && col.type !== 'text' && col.type !== 'plain'"
            :schema="col"
            :extra-data="row"
          />
          <PopOverHost v-else :schema="col" :data="row">
            <span>{{ col.name != null ? row[col.name] ?? '' : '' }}</span>
          </PopOverHost>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
  </div>
</template>
