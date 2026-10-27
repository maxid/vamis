<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SchemaRenderer,
  table2ApplySelection,
  table2Bordered,
  table2CanSort,
  table2CellIsRenderer,
  table2ColumnWidth,
  table2ColumnsTogglable,
  table2KeyField,
  table2LeafColumns,
  table2Footer,
  table2Loading,
  table2MaxKeep,
  table2NextSort,
  table2Placeholder,
  table2PlaceholderNode,
  table2RowClick,
  table2RowDisabled,
  table2RowId,
  table2SelectedKeys,
  table2SelectionType,
  table2Selections,
  table2ShowHeader,
  table2Size,
  table2Source,
  table2Title,
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
} from '@vamis/ui'
import ColumnToggler from './ColumnToggler.vue'
import {
  colKey,
  provideColumnToggle,
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
const columns = computed(() => table2LeafColumns(props.schema) as SchemaObject[])
const injectedToggle = useInjectedColumnToggle()
const localToggle = useColumnToggle(columns)
if (!injectedToggle) provideColumnToggle(localToggle)
const toggle = injectedToggle || localToggle

const keyField = computed(() => table2KeyField(props.schema))
const selectionType = computed(() => table2SelectionType(props.schema))
const selectable = computed(() => !!selectionType.value)
const isRadio = computed(() => selectionType.value === 'radio')
const showToggler = computed(() => table2ColumnsTogglable(props.schema, columns.value.length))
const titleText = computed(() => table2Title(props.schema, props.data || {}))
const footerText = computed(() => table2Footer(props.schema, props.data || {}))
const placeholderText = computed(() => table2Placeholder(props.schema))
const placeholderNode = computed(() => table2PlaceholderNode(props.schema))
const bordered = computed(() => table2Bordered(props.schema))
const size = computed(() => table2Size(props.schema))
const showHeader = computed(() => table2ShowHeader(props.schema))
const rowClick = computed(() => table2RowClick(props.schema))
const maxKeep = computed(() => table2MaxKeep(props.schema))
const loading = computed(() => table2Loading(props.schema))
const selections = computed(() => table2Selections(props.schema))
const sizeStyle = computed(() => {
  if (size.value === 'small') return { '--table-row-h': 'var(--table-row-h-sm)' }
  if (size.value === 'large') return { '--table-row-h': 'var(--table-row-h-lg)' }
  return {}
})

const localSelected = ref<Record<string, any>[]>([])
const localSort = ref<{ orderBy?: string; orderDir?: string }>({})
const page = ref(1)
const perPage = computed(() => Number(props.schema.perPage || 0))
const menuOpen = ref(false)

const rawRows = computed(() => table2Source(props.schema, props.data, props.items))

watch(
  () => table2SelectedKeys(props.schema, rawRows.value).join(','),
  () => {
    const keys = new Set(table2SelectedKeys(props.schema, rawRows.value))
    if (!keys.size) return
    const field = keyField.value
    setSelected(rawRows.value.filter((row, i) => keys.has(table2RowId(row, i, field))))
  },
  { immediate: true },
)

const sortedRows = computed(() => {
  const orderBy = localSort.value.orderBy
  const orderDir = localSort.value.orderDir
  if (!orderBy || !orderDir || host) return rawRows.value
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
const colSpan = computed(() => Math.max(visibleColumns.value.length, 1) + (selectable.value ? 1 : 0))

function rowId(row: Record<string, any>, index: number) {
  return table2RowId(row, index, keyField.value)
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

function isDisabledRow(row: Record<string, any>, index: number) {
  return table2RowDisabled(props.schema, row, index)
}

function toggleRow(row: Record<string, any>, index: number, checked: boolean) {
  if (isDisabledRow(row, index)) return
  const key = rowId(row, index)
  if (isRadio.value) {
    setSelected(checked ? [row] : [])
    return
  }
  const current = selectedList().slice()
  if (checked) {
    if (maxKeep.value && current.length >= maxKeep.value && !current.some((item, i) => rowId(item, i) === key)) {
      return
    }
    if (!current.some((item, i) => rowId(item, i) === key)) current.push(row)
    setSelected(current)
    return
  }
  setSelected(current.filter((item, i) => rowId(item, i) !== key))
}

const allSelected = computed(
  () =>
    pagedRows.value.filter((row, i) => !isDisabledRow(row, i)).length > 0 &&
    pagedRows.value.every((row, i) => isDisabledRow(row, i) || isSelected(row, i)),
)
const someSelected = computed(
  () => pagedRows.value.some((row, i) => isSelected(row, i)) && !allSelected.value,
)

function toggleAll(checked: boolean) {
  if (isRadio.value) return
  if (checked) {
    const current = selectedList().slice()
    pagedRows.value.forEach((row, i) => {
      if (isDisabledRow(row, i)) return
      const key = rowId(row, i)
      if (!current.some((item, j) => rowId(item, j) === key)) {
        if (maxKeep.value && current.length >= maxKeep.value) return
        current.push(row)
      }
    })
    setSelected(current)
    return
  }
  const keys = new Set(pagedRows.value.map((row, i) => rowId(row, i)))
  setSelected(selectedList().filter((item, i) => !keys.has(rowId(item, i))))
}

function applyMenu(action: string) {
  const field = keyField.value
  const changable = pagedRows.value.filter((row, i) => !isDisabledRow(row, i))
  const keys = changable.map((row, i) => table2RowId(row, i, field))
  const current = selectedList().map((item, i) => table2RowId(item, i, field))
  const next = new Set(table2ApplySelection(action, keys, current))
  setSelected(rawRows.value.filter((row, i) => next.has(table2RowId(row, i, field))))
  menuOpen.value = false
}

function onRowClick(row: Record<string, any>, index: number, event: Event) {
  if (!rowClick.value) return
  const target = event.target as HTMLElement | null
  if (target?.closest('input, button, a, [data-slot="checkbox"]')) return
  toggleRow(row, index, !isSelected(row, index))
}

function sortDir(col: SchemaObject) {
  return localSort.value.orderBy === col.name ? localSort.value.orderDir || '' : ''
}

function toggleSort(col: SchemaObject) {
  if (!table2CanSort(col) || !col.name) return
  const next = table2NextSort(String(col.name), localSort.value)
  localSort.value = next
  page.value = 1
  if (host) host.reload({ orderBy: next.orderBy || undefined, orderDir: next.orderDir || undefined })
}

function cellSchema(col: SchemaObject): SchemaObject {
  if (col.type && col.type !== 'text' && col.type !== 'plain') return col
  return { type: 'tpl', tpl: String(col.tpl || '') }
}

function cellWidth(col: SchemaObject) {
  const width = table2ColumnWidth(col)
  return width ? { width } : undefined
}
</script>

<template>
  <div
    class="vamis-table2 relative w-full"
    :class="{ 'is-bordered': bordered, [`is-${size}`]: true }"
    :style="sizeStyle"
  >
    <div v-if="titleText || (schema.title && typeof schema.title === 'object') || showToggler" class="vamis-table2-title">
      <span v-if="titleText">{{ titleText }}</span>
      <SchemaRenderer v-else-if="schema.title && typeof schema.title === 'object'" :schema="schema.title" />
      <ColumnToggler v-if="showToggler" :schema="{ type: 'column-toggler', label: '列显示' }" />
    </div>
    <Table>
      <TableHeader v-if="showHeader">
        <TableRow>
          <TableHead v-if="selectable" class="w-10">
            <div class="flex items-center gap-1">
              <Checkbox
                v-if="!isRadio"
                :model-value="allSelected ? true : someSelected ? 'indeterminate' : false"
                @update:model-value="toggleAll($event === true)"
              />
              <div v-if="selections.length" class="relative">
                <button type="button" class="text-muted-foreground px-0.5" @click.stop="menuOpen = !menuOpen">▾</button>
                <div
                  v-if="menuOpen"
                  class="absolute left-0 z-20 mt-1 min-w-28 rounded-md border bg-popover p-1 text-sm shadow-md"
                >
                  <button
                    v-for="item in selections"
                    :key="item.key"
                    type="button"
                    class="block w-full rounded px-2 py-1 text-left hover:bg-muted"
                    @click="applyMenu(item.key)"
                  >
                    {{ item.text }}
                  </button>
                </div>
              </div>
            </div>
          </TableHead>
          <TableHead
            v-for="(col, i) in visibleColumns"
            :key="colKey(col, i)"
            :class="table2CanSort(col) ? 'cursor-pointer select-none' : ''"
            :style="cellWidth(col)"
            @click="toggleSort(col)"
          >
            <span class="vamis-table2-head-cell">
              <SchemaRenderer v-if="col.title && typeof col.title === 'object'" :schema="col.title" />
              <template v-else>{{ col.title || col.label || col.name }}</template>
              <span v-if="table2CanSort(col)" class="vamis-table2-sort" aria-hidden="true">
                <svg
                  class="vamis-table2-sort-icon is-up"
                  :class="{ 'is-active': sortDir(col) === 'asc' }"
                  viewBox="0 0 7 10"
                >
                  <polygon points="3.5 0 2.8 0.703 0 3.514 0.7 4.217 3.005 1.903 3.005 10 3.995 10 3.995 1.903 6.3 4.217 7 3.514 4.2 0.703" />
                </svg>
                <svg
                  class="vamis-table2-sort-icon is-down"
                  :class="{ 'is-active': sortDir(col) === 'desc' }"
                  viewBox="0 0 7 10"
                >
                  <polygon transform="translate(3.5,5) scale(1,-1) translate(-3.5,-5)" points="3.5 0 2.8 0.703 0 3.514 0.7 4.217 3.005 1.903 3.005 10 3.995 10 3.995 1.903 6.3 4.217 7 3.514 4.2 0.703" />
                </svg>
                <svg
                  class="vamis-table2-sort-icon is-default"
                  :class="{ 'is-active': !sortDir(col) }"
                  viewBox="0 0 7 12"
                >
                  <polygon points="3.5354 0.0004 2.8284 0.7064 0.0004 3.5344 0.7074 4.2424 3.0354 1.9134 3.0354 5.0354 4.0354 5.0354 4.0354 1.9134 6.3634 4.2424 7.0704 3.5344 4.2424 0.7064" />
                  <polygon points="3.035 7.0348 3.035 10.1558 0.708 7.8278 0 8.5348 2.828 11.3628 3.535 12.0708 4.243 11.3628 7.071 8.5348 6.363 7.8278 4.036 10.1558 4.036 7.0348" />
                </svg>
              </span>
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!pagedRows.length">
          <TableCell :colspan="colSpan" class="text-center text-muted-foreground">
            <SchemaRenderer v-if="placeholderNode" :schema="placeholderNode" />
            <template v-else>{{ placeholderText }}</template>
          </TableCell>
        </TableRow>
        <TableRow
          v-for="(row, ri) in pagedRows"
          :key="rowId(row, ri)"
          :data-state="isSelected(row, ri) ? 'selected' : undefined"
          :class="{ 'is-disabled': isDisabledRow(row, ri) }"
          @click="onRowClick(row, ri, $event)"
        >
          <TableCell v-if="selectable">
            <button
              v-if="isRadio"
              type="button"
              class="vamis-table2-radio"
              role="radio"
              :aria-checked="isSelected(row, ri)"
              :disabled="isDisabledRow(row, ri)"
              @click.stop="toggleRow(row, ri, true)"
            />
            <Checkbox
              v-else
              :model-value="isSelected(row, ri)"
              :disabled="isDisabledRow(row, ri)"
              @update:model-value="toggleRow(row, ri, $event === true)"
            />
          </TableCell>
          <TableCell v-for="(col, ci) in visibleColumns" :key="colKey(col, ci)" :style="cellWidth(col)">
            <SchemaRenderer v-if="table2CellIsRenderer(col)" :schema="cellSchema(col)" :extra-data="row" />
            <span v-else>{{ col.name != null ? row[col.name] ?? '' : '' }}</span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <div v-if="footerText" class="vamis-table2-footer">{{ footerText }}</div>
    <div v-else-if="schema.footer && typeof schema.footer === 'object'" class="vamis-table2-footer">
      <SchemaRenderer :schema="schema.footer" />
    </div>
    <div
      v-if="loading"
      class="bg-background/70 absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground"
    >
      加载中
    </div>
    <div v-if="showPager" class="flex justify-end gap-2 p-2">
      <Button type="button" size="sm" variant="outline" :disabled="page <= 1" @click="page -= 1">上一页</Button>
      <span class="px-2 text-xs text-muted-foreground">{{ page }} / {{ Math.max(1, Math.ceil(total / perPage)) }}</span>
      <Button type="button" size="sm" variant="outline" :disabled="page * perPage >= total" @click="page += 1">下一页</Button>
    </div>
  </div>
</template>

<style>
.vamis-table2 {
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--card);
}
.vamis-table2 [data-slot="table-container"] {
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.vamis-table2 table {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--foreground);
}
.vamis-table2 th,
.vamis-table2 td {
  height: 40px;
  padding: 10px;
  font-weight: 400;
  vertical-align: middle;
}
.vamis-table2 th:first-child,
.vamis-table2 td:first-child {
  padding-left: 12px;
}
.vamis-table2 th:last-child,
.vamis-table2 td:last-child {
  padding-right: 12px;
}
.vamis-table2 th {
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted-foreground);
  background: color-mix(in oklch, var(--muted) 70%, var(--card));
  border-right: 1px solid color-mix(in oklch, var(--border) 70%, white);
}
.vamis-table2 th:last-child {
  border-right: 0;
}
.vamis-table2 td {
  font-size: 12px;
  line-height: 1.5;
  border-top: 1px solid var(--border);
}
.vamis-table2 tbody tr:last-child td {
  border-bottom: 1px solid var(--border);
}
.vamis-table2-title,
.vamis-table2-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--foreground);
}
.vamis-table2-head-cell {
  display: flex;
  align-items: center;
  line-height: 1.5;
}
.vamis-table2-sort {
  display: block;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-left: 8px;
  line-height: 0;
  color: #b8babf;
}
.vamis-table2-sort-icon {
  display: none;
  width: 13px;
  height: 13px;
  fill: currentColor;
}
.vamis-table2-sort-icon.is-active {
  display: block;
  position: relative;
  top: 2px;
}
.vamis-table2-sort-icon.is-default.is-active {
  color: #b8babf;
}
.vamis-table2-sort-icon.is-up.is-active,
.vamis-table2-sort-icon.is-down.is-active {
  color: var(--primary);
}
.vamis-table2-radio {
  box-sizing: border-box;
  display: inline-block;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 9999px;
  background: #fff;
  vertical-align: middle;
  cursor: pointer;
}
.vamis-table2-radio[aria-checked="true"] {
  border-color: var(--primary);
}
.vamis-table2-radio[aria-checked="true"]::after {
  content: "";
  display: block;
  width: 8px;
  height: 8px;
  margin: 3px auto;
  border-radius: 9999px;
  background: var(--primary);
}
.vamis-table2-radio:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.vamis-table2 tr.is-disabled {
  color: var(--muted-foreground);
  background: color-mix(in oklch, var(--muted) 50%, var(--card));
}
.vamis-table2.is-small th,
.vamis-table2.is-small td {
  height: 33px;
  padding: 6px 4px;
}
.vamis-table2.is-large th,
.vamis-table2.is-large td {
  height: 61px;
  padding: 20px 12px;
}
.vamis-table2.is-bordered {
  border: 1px solid var(--border);
}
.vamis-table2.is-bordered .vamis-table2-title {
  border-bottom: 1px solid var(--border);
}
.vamis-table2.is-bordered .vamis-table2-footer {
  border-top: 1px solid var(--border);
}
.vamis-table2.is-bordered th,
.vamis-table2.is-bordered td {
  border: 1px solid var(--border);
}
</style>
