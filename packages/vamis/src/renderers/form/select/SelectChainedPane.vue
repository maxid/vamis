<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SchemaRenderer,
  optionValuesEqual,
  type OptionItem,
  type SchemaObject,
} from '@vamis/core'
import { Checkbox } from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  nodes: OptionItem[]
  selectedValues: unknown[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  pick: [item: OptionItem]
  'toggle-all': []
}>()

const valueField = computed(() => String(props.schema.valueField || 'value'))
const multiple = computed(() => props.schema.multiple === true)
const path = ref<Array<number | null>>([])

function defaultPath(list: OptionItem[]) {
  const index = list.findIndex((item) => canExpand(item))
  return index >= 0 ? [index] : []
}

watch(
  () => props.nodes,
  (nodes) => {
    if (!nodes.length) {
      path.value = []
      return
    }
    const current = path.value[0]
    if (
      typeof current !== 'number' ||
      !nodes[current]?.children?.length
    ) {
      path.value = defaultPath(nodes)
    }
  },
  { immediate: true },
)

function maxDepth(list: OptionItem[], depth = 1): number {
  let max = depth
  for (const item of list) {
    if (item.children?.length) max = Math.max(max, maxDepth(item.children, depth + 1))
  }
  return max
}

const columnCount = computed(() => Math.max(1, Math.min(3, maxDepth(props.nodes))))

function childrenAt(depth: number) {
  if (depth === 0) return props.nodes
  let list = props.nodes
  for (let index = 0; index < depth; index += 1) {
    const parentIndex = path.value[index]
    const parent =
      typeof parentIndex === 'number' ? list[parentIndex] : undefined
    list = parent?.children ?? []
  }
  return list
}

const columns = computed(() =>
  Array.from({ length: columnCount.value }, (_, depth) => childrenAt(depth)),
)
const leaves = computed(() => {
  const out: OptionItem[] = []
  const walk = (items: OptionItem[]) => {
    for (const item of items) {
      if (item.children?.length) walk(item.children)
      else if (!item.disabled && item.value != null && item.value !== '') out.push(item)
    }
  }
  walk(props.nodes)
  return out
})
const selectedCount = computed(
  () => leaves.value.filter((item) => isSelected(item)).length,
)
const allChecked = computed(
  () => !!leaves.value.length && selectedCount.value === leaves.value.length,
)
const partialChecked = computed(
  () => selectedCount.value > 0 && !allChecked.value,
)
const emptyText = computed(() =>
  String(props.schema.noResultsText || '暂无选项'),
)

function isSelected(item: OptionItem) {
  return props.selectedValues.some((value) =>
    optionValuesEqual(value, item.value, valueField.value),
  )
}

function isActive(depth: number, index: number) {
  return path.value[depth] === index
}

function isDisabled(item: OptionItem) {
  return !!props.disabled || !!item.disabled
}

function canExpand(item: OptionItem) {
  return !!item.children?.length
}

function select(item: OptionItem, depth: number, index: number) {
  if (isDisabled(item)) return
  path.value = [...path.value.slice(0, depth), index]
  if (!canExpand(item)) emit('pick', item)
}

function labelValue(item: OptionItem) {
  return item.label
}
</script>

<template>
  <div class="vamis-select__chained-pane">
    <button
      v-if="multiple && schema.checkAll"
      type="button"
      class="vamis-select__chained-checkall"
      :disabled="disabled"
      @click.stop="emit('toggle-all')"
    >
      <Checkbox
        :model-value="allChecked ? true : partialChecked ? 'indeterminate' : false"
        :disabled="disabled"
        @click.stop
      />
      <span>{{ schema.checkAllLabel || '全选' }}</span>
    </button>
    <div v-if="!nodes.length" class="vamis-select__chained-empty">
      {{ emptyText }}
    </div>
    <div v-else class="vamis-select__chained">
      <div
        v-for="(options, depth) in columns"
        :key="depth"
        class="vamis-select__chained-col"
      >
        <div
          v-for="(item, index) in options"
          :key="String(item[valueField] ?? item.label)"
          class="vamis-select__chained-item"
          :class="{
            'is-active': canExpand(item) ? isActive(depth, index) : isSelected(item),
            'is-disabled': isDisabled(item),
            'is-branch': canExpand(item),
          }"
          @click="select(item, depth, index)"
        >
          <Checkbox
            v-if="multiple && !canExpand(item)"
            :model-value="isSelected(item)"
            :disabled="isDisabled(item)"
            @click.stop
            @update:model-value="select(item, depth, index)"
          />
          <SchemaRenderer
            v-if="item.schema || item.tpl || item.type"
            class="vamis-select__chained-item-label"
            :schema="item"
            :extra-data="item"
          />
          <span v-else class="vamis-select__chained-item-label">
            {{ labelValue(item) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
