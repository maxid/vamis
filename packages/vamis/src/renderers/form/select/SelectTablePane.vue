<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  getByPath,
  optionValuesEqual,
  type OptionItem,
  type SchemaObject,
} from '@vamis/core'
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  nodes: OptionItem[]
  selectedValues: unknown[]
  disabled?: boolean
  query?: string
}>()

const emit = defineEmits<{
  pick: [item: OptionItem]
  'toggle-all': []
}>()

const valueField = computed(() => String(props.schema.valueField || 'value'))
const multiple = computed(() => props.schema.multiple === true)
const columns = computed(() => {
  const configured = Array.isArray(props.schema.columns)
    ? props.schema.columns.filter(
        (column): column is SchemaObject =>
          !!column && typeof column === 'object' && !Array.isArray(column),
      )
    : []
  return configured.length ? configured : [{ name: 'label', label: 'Label' }]
})
const selectableNodes = computed(() =>
  props.nodes.filter(
    (item) =>
      !item.disabled &&
      item[valueField.value] != null &&
      item[valueField.value] !== '',
  ),
)
const selectedCount = computed(
  () => selectableNodes.value.filter((item) => selected(item)).length,
)
const allChecked = computed(
  () =>
    !!selectableNodes.value.length &&
    selectedCount.value === selectableNodes.value.length,
)
const partialChecked = computed(
  () => selectedCount.value > 0 && !allChecked.value,
)
const emptyText = computed(() =>
  props.query?.trim()
    ? String(props.schema.noResultsText || '未找到任何结果')
    : '暂无选项',
)

function selected(item: OptionItem) {
  return props.selectedValues.some((value) =>
    optionValuesEqual(value, item.value, valueField.value),
  )
}

function rowDisabled(item: OptionItem) {
  return !!props.disabled || !!item.disabled
}

function columnLabel(column: SchemaObject) {
  const label = column.label ?? column.title
  return label == null || label === false ? '' : String(label)
}

function cellText(column: SchemaObject, item: OptionItem) {
  const name = String(column.name || '')
  const value = name ? getByPath(item, name) : ''
  return value == null ? '' : String(value)
}

function cellUsesRenderer(column: SchemaObject) {
  return (
    column.type != null ||
    column.tpl != null ||
    column.body != null ||
    column.schema != null
  )
}

function pick(item: OptionItem) {
  if (rowDisabled(item)) return
  emit('pick', item)
}

function toggleAll() {
  if (props.disabled || !multiple.value) return
  emit('toggle-all')
}
</script>

<template>
  <div class="vamis-select__table-pane vamis-select__table">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-if="multiple && nodes.length" class="vamis-select__table-check">
            <Checkbox
              :model-value="allChecked ? true : partialChecked ? 'indeterminate' : false"
              :disabled="disabled"
              @click.stop
              @update:model-value="toggleAll"
            />
          </TableHead>
          <TableHead v-for="(column, index) in columns" :key="index">
            {{ columnLabel(column) }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!nodes.length">
          <TableCell :colspan="columns.length" class="vamis-select__table-empty">
            {{ emptyText }}
          </TableCell>
        </TableRow>
        <TableRow
          v-for="(item, index) in nodes"
          v-else
          :key="String(item[valueField] ?? index)"
          :class="{
            'is-active': selected(item),
            'is-disabled': rowDisabled(item),
          }"
          @click="pick(item)"
        >
          <TableCell
            v-if="multiple"
            class="vamis-select__table-check"
          >
            <Checkbox
              :model-value="selected(item)"
              :disabled="rowDisabled(item)"
              @click.stop
              @update:model-value="pick(item)"
            />
          </TableCell>
          <TableCell v-for="(column, columnIndex) in columns" :key="columnIndex">
            <SchemaRenderer
              v-if="cellUsesRenderer(column)"
              :schema="column"
              :extra-data="item"
            />
            <template v-else>{{ cellText(column, item) }}</template>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
