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

function toggle(i: number) {
  if (multiple.value) selected.value = selected.value.includes(i) ? selected.value.filter((n) => n !== i) : [...selected.value, i]
  else selected.value = selected.value[0] === i ? [] : [i]
}

function allSelected() {
  return rows.value.length > 0 && selected.value.length === rows.value.length
}

function toggleAll() {
  selected.value = allSelected() ? [] : rows.value.map((_, i) => i)
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
  getData: () => ({ selectedItems: selected.value.map((i) => rows.value[i]).filter(Boolean) }),
  setData: () => {},
  async doAction(action: { actionType?: string; args?: { index?: string | number } }) {
    const type = action?.actionType
    if (type === 'selectAll') selected.value = rows.value.map((_, i) => i)
    else if (type === 'clearAll') selected.value = []
    else if (type === 'select') {
      selected.value = String(action.args?.index ?? '')
        .split(',')
        .map((part) => Number(part.trim()))
        .filter((n) => Number.isFinite(n) && rows.value[n])
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
      <TableRow>
        <TableHead v-if="selectable" class="w-10"><input type="checkbox" :checked="allSelected()" @change="toggleAll"></TableHead>
        <TableHead v-for="col in columns" :key="`${col.name || col.label || ''}`" :style="colWidthStyle(col)">
          {{ col.label || col.name }}
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="!rows.length">
        <TableCell :colspan="Math.max(columns.length, 1)" class="py-8 text-center text-muted-foreground">
          {{ schema.placeholder || '暂无数据' }}
        </TableCell>
      </TableRow>
      <TableRow v-for="(row, i) in rows" :key="row.id ?? i" :class="rowClass(row)" @click="onRowClick(row, $event)">
        <TableCell v-for="col in columns" :key="`${col.name || col.label || ''}`" :style="colWidthStyle(col)">
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
