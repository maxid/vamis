<script setup lang="ts">
import { computed, ref } from 'vue'
import { SchemaRenderer, type SchemaObject } from '@vamis/core'
import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vamis/ui'
import ColumnToggler from './ColumnToggler.vue'
import {
  colKey,
  provideColumnToggle,
  resolveTableSource,
  useColumnToggle,
  useCrudHost,
  useInjectedColumnToggle,
} from './crudHost'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
  items?: Record<string, any>[]
}>()

const host = useCrudHost()
const injectedToggle = useInjectedColumnToggle()
const columns = computed(() => (props.schema.columns || []) as SchemaObject[])
const localToggle = useColumnToggle(columns)
if (!injectedToggle) provideColumnToggle(localToggle)
const toggle = injectedToggle || localToggle

const keyField = computed(() =>
  String(props.schema.rowSelection?.keyField || props.schema.primaryField || props.schema.valueField || 'id'),
)
const selectable = computed(() => {
  if (props.schema.selectable === false) return false
  return !!(props.schema.selectable || props.schema.rowSelection || props.schema.multiple)
})
const showToggler = computed(() => props.schema.columnsTogglable === true)

const localSelected = ref<Record<string, any>[]>([])
const localSort = ref<{ orderBy?: string; orderDir?: string }>({})
const page = ref(1)
const perPage = computed(() => Number(props.schema.perPage || 0))

const rawRows = computed(() => resolveTableSource(props.schema, props.data, props.items))

const sortedRows = computed(() => {
  const orderBy = localSort.value.orderBy
  const orderDir = localSort.value.orderDir || 'asc'
  if (!orderBy || host) return rawRows.value
  const list = rawRows.value.slice()
  list.sort((a, b) => {
    const left = a[orderBy]
    const right = b[orderBy]
    const cmp = left === right ? 0 : left > right ? 1 : -1
    return orderDir === 'desc' ? -cmp : cmp
  })
  return list
})

const pagedRows = computed(() => {
  if (!perPage.value || host) return sortedRows.value
  const start = (page.value - 1) * perPage.value
  return sortedRows.value.slice(start, start + perPage.value)
})

const visibleColumns = computed(() => columns.value.filter((col, i) => toggle.isVisible(col, i)))
const total = computed(() => sortedRows.value.length)
const showPager = computed(() => !host && perPage.value > 0 && total.value > perPage.value)

function rowId(row: Record<string, any>, index: number) {
  return row[keyField.value] ?? index
}

function selectedList(): Record<string, any>[] {
  return host ? host.selectedItems : localSelected.value
}

function setSelected(items: Record<string, any>[]) {
  if (host) host.setSelectedItems(items)
  else localSelected.value = items
}

function isSelected(row: Record<string, any>, index: number) {
  const key = rowId(row, index)
  return selectedList().some((item, i) => rowId(item, i) === key)
}

function toggleRow(row: Record<string, any>, index: number, checked: boolean) {
  const key = rowId(row, index)
  const current = selectedList().slice()
  if (checked) {
    if (!current.some((item, i) => rowId(item, i) === key)) current.push(row)
    setSelected(current)
    return
  }
  setSelected(current.filter((item, i) => rowId(item, i) !== key))
}

const allSelected = computed(
  () => pagedRows.value.length > 0 && pagedRows.value.every((row, i) => isSelected(row, i)),
)
const someSelected = computed(
  () => pagedRows.value.some((row, i) => isSelected(row, i)) && !allSelected.value,
)

function toggleAll(checked: boolean) {
  if (checked) {
    const current = selectedList().slice()
    pagedRows.value.forEach((row, i) => {
      const key = rowId(row, i)
      if (!current.some((item, j) => rowId(item, j) === key)) current.push(row)
    })
    setSelected(current)
    return
  }
  const keys = new Set(pagedRows.value.map((row, i) => rowId(row, i)))
  setSelected(selectedList().filter((item, i) => !keys.has(rowId(item, i))))
}

function canSort(col: SchemaObject) {
  return !!(col.name && (col.sorter || col.sortable) && col.type !== 'operation')
}

function sortMark(col: SchemaObject) {
  const orderBy = localSort.value.orderBy
  if (orderBy !== col.name) return ''
  return localSort.value.orderDir === 'desc' ? ' ↓' : ' ↑'
}

function toggleSort(col: SchemaObject) {
  if (!canSort(col)) return
  const current = localSort.value.orderBy
  const dir = localSort.value.orderDir || 'asc'
  const nextDir = current === col.name && dir === 'asc' ? 'desc' : 'asc'
  localSort.value = { orderBy: col.name, orderDir: nextDir }
  page.value = 1
  if (host) host.reload({ orderBy: col.name, orderDir: nextDir })
}

function cellIsRenderer(col: SchemaObject) {
  return !!(col.type && col.type !== 'text' && col.type !== 'plain')
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="schema.title || showToggler" class="flex items-center justify-between gap-2">
      <p v-if="typeof schema.title === 'string'" class="text-sm font-medium">{{ schema.title }}</p>
      <SchemaRenderer v-else-if="schema.title" :schema="schema.title" />
      <ColumnToggler v-if="showToggler" :schema="{ type: 'column-toggler', label: '列显示' }" />
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-if="selectable" class="w-10">
            <Checkbox
              :model-value="allSelected ? true : someSelected ? 'indeterminate' : false"
              @update:model-value="toggleAll($event === true)"
            />
          </TableHead>
          <TableHead
            v-for="(col, i) in visibleColumns"
            :key="colKey(col, i)"
            :class="canSort(col) ? 'cursor-pointer select-none' : ''"
            @click="toggleSort(col)"
          >
            <SchemaRenderer v-if="col.title && typeof col.title === 'object'" :schema="col.title" />
            <template v-else>{{ col.title || col.label || col.name }}{{ sortMark(col) }}</template>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!pagedRows.length">
          <TableCell :colspan="Math.max(visibleColumns.length, 1) + (selectable ? 1 : 0)" class="py-8 text-center text-muted-foreground">
            {{ schema.placeholder || '暂无数据' }}
          </TableCell>
        </TableRow>
        <TableRow v-for="(row, ri) in pagedRows" :key="rowId(row, ri)">
          <TableCell v-if="selectable">
            <Checkbox
              :model-value="isSelected(row, ri)"
              @update:model-value="toggleRow(row, ri, $event === true)"
            />
          </TableCell>
          <TableCell v-for="(col, ci) in visibleColumns" :key="colKey(col, ci)">
            <SchemaRenderer v-if="cellIsRenderer(col)" :schema="col" :extra-data="row" />
            <span v-else>{{ col.name != null ? row[col.name] ?? '' : '' }}</span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <div v-if="showPager" class="flex justify-end gap-2">
      <Button type="button" size="sm" variant="outline" :disabled="page <= 1" @click="page -= 1">上一页</Button>
      <span class="px-2 text-xs text-muted-foreground">{{ page }} / {{ Math.max(1, Math.ceil(total / perPage)) }}</span>
      <Button type="button" size="sm" variant="outline" :disabled="page * perPage >= total" @click="page += 1">下一页</Button>
    </div>
    <SchemaRenderer v-if="schema.footer" :schema="schema.footer" />
  </div>
</template>
