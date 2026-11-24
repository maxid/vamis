<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
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
  VamisClose,
} from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  nodes: OptionItem[]
  selectedValues: unknown[]
  disabled?: boolean
  query?: string
  resultMode?: boolean
}>()

const emit = defineEmits<{
  pick: [item: OptionItem]
  'toggle-all': []
}>()

const VIRTUAL_BUFFER = 4
const VIRTUAL_VIEWPORT = 266

const valueField = computed(() => String(props.schema.valueField || 'value'))
const multiple = computed(() => props.schema.multiple === true)
const virtualThreshold = computed(() => {
  const value = Number(props.schema.virtualThreshold)
  return Number.isFinite(value) && value >= 0 ? value : 100
})
const virtualItemHeight = computed(() => {
  const value = Number(props.schema.itemHeight)
  return Number.isFinite(value) && value > 0 ? value : 38
})
const virtualEnabled = computed(
  () => props.nodes.length > virtualThreshold.value,
)
const paneEl = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const viewportHeight = ref(VIRTUAL_VIEWPORT)

defineExpose({ scrollEl: paneEl })
const virtualStart = computed(() => {
  if (!virtualEnabled.value) return 0
  return Math.min(
    Math.max(
      0,
      Math.floor(scrollTop.value / virtualItemHeight.value) - VIRTUAL_BUFFER,
    ),
    Math.max(0, props.nodes.length - 1),
  )
})
const virtualEnd = computed(() => {
  if (!virtualEnabled.value) return props.nodes.length
  return Math.min(
    props.nodes.length,
    Math.ceil(
      (scrollTop.value + viewportHeight.value) / virtualItemHeight.value,
    ) + VIRTUAL_BUFFER,
  )
})
const visibleNodes = computed(() =>
  virtualEnabled.value
    ? props.nodes.slice(virtualStart.value, virtualEnd.value)
    : props.nodes,
)
const virtualPadTop = computed(() =>
  virtualEnabled.value ? virtualStart.value * virtualItemHeight.value : 0,
)
const virtualPadBottom = computed(() =>
  virtualEnabled.value
    ? Math.max(
        0,
        (props.nodes.length - virtualEnd.value) * virtualItemHeight.value,
      )
    : 0,
)
const columns = computed(() => {
  const configured = Array.isArray(props.schema.columns)
    ? props.schema.columns.filter(
        (column): column is SchemaObject =>
          !!column && typeof column === 'object' && !Array.isArray(column),
      )
    : []
  return configured.length ? configured : [{ name: 'label', label: 'Label' }]
})
const columnSpan = computed(() => columns.value.length + (multiple.value ? 1 : 0))
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

function onScroll(event: Event) {
  if (!virtualEnabled.value) return
  const el = event.currentTarget as HTMLElement
  scrollTop.value = el.scrollTop
  if (el.clientHeight > 0) viewportHeight.value = el.clientHeight
}

watch(
  () => [props.nodes, virtualThreshold.value, virtualItemHeight.value] as const,
  () => {
    void nextTick(() => {
      scrollTop.value = 0
      if (paneEl.value) paneEl.value.scrollTop = 0
    })
  },
)
</script>

<template>
  <div
    ref="paneEl"
    class="vamis-select__table-pane vamis-select__table"
    :class="{ 'is-virtual': virtualEnabled }"
    :style="
      virtualEnabled
        ? { '--select-table-item-height': `${virtualItemHeight}px` }
        : undefined
    "
    @scroll="onScroll"
  >
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
        <template v-if="!nodes.length">
          <TableRow>
            <TableCell :colspan="columnSpan" class="vamis-select__table-empty">
              {{ emptyText }}
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow
            v-if="virtualPadTop > 0"
            class="vamis-select__table-virtual-pad"
            aria-hidden="true"
          >
            <TableCell
              :colspan="columnSpan"
              :style="{ height: `${virtualPadTop}px` }"
            />
          </TableRow>
          <TableRow
            v-for="(item, index) in visibleNodes"
            :key="String(item[valueField] ?? virtualStart + index)"
            :style="
              virtualEnabled
                ? { height: `${virtualItemHeight}px` }
                : undefined
            "
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
              <div class="vamis-select__table-cell-result">
                <SchemaRenderer
                  v-if="cellUsesRenderer(column)"
                  :schema="column"
                  :extra-data="item"
                />
                <template v-else>{{ cellText(column, item) }}</template>
                <button
                  v-if="resultMode && columnIndex === columns.length - 1"
                  type="button"
                  class="vamis-select__table-result-remove"
                  :aria-label="`移除 ${item.label}`"
                  :disabled="disabled"
                  @click.stop="pick(item)"
                >
                  <VamisClose />
                </button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow
            v-if="virtualPadBottom > 0"
            class="vamis-select__table-virtual-pad"
            aria-hidden="true"
          >
            <TableCell
              :colspan="columnSpan"
              :style="{ height: `${virtualPadBottom}px` }"
            />
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
