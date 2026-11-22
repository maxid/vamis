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

const VIRTUAL_BUFFER = 4
const VIRTUAL_VIEWPORT = 266

const valueField = computed(() => String(props.schema.valueField || 'value'))
const multiple = computed(() => props.schema.multiple === true)
const path = ref<Array<number | null>>([])
const columnScrollTop = ref<Record<number, number>>({})
const columnViewportHeight = ref<Record<number, number>>({})
const virtualThreshold = computed(() => {
  const value = Number(props.schema.virtualThreshold)
  return Number.isFinite(value) && value >= 0 ? value : 100
})
const virtualItemHeight = computed(() => {
  const value = Number(props.schema.itemHeight)
  return Number.isFinite(value) && value > 0 ? value : 38
})

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
const columnViews = computed(() =>
  columns.value.map((items, depth) => {
    const virtual = items.length > virtualThreshold.value
    if (!virtual) {
      return {
        items,
        virtual,
        start: 0,
        lead: 0,
        trail: 0,
      }
    }
    const scrollTop = columnScrollTop.value[depth] ?? 0
    const viewportHeight =
      columnViewportHeight.value[depth] ?? VIRTUAL_VIEWPORT
    const start = Math.min(
      Math.max(
        0,
        Math.floor(scrollTop / virtualItemHeight.value) - VIRTUAL_BUFFER,
      ),
      Math.max(0, items.length - 1),
    )
    const end = Math.min(
      items.length,
      Math.ceil(
        (scrollTop + viewportHeight) / virtualItemHeight.value,
      ) + VIRTUAL_BUFFER,
    )
    return {
      items: items.slice(start, end),
      virtual,
      start,
      lead: start * virtualItemHeight.value,
      trail: Math.max(0, (items.length - end) * virtualItemHeight.value),
    }
  }),
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

function onColumnScroll(depth: number, event: Event) {
  if (!columnViews.value[depth]?.virtual) return
  const el = event.currentTarget as HTMLElement
  columnScrollTop.value = {
    ...columnScrollTop.value,
    [depth]: el.scrollTop,
  }
  if (el.clientHeight > 0) {
    columnViewportHeight.value = {
      ...columnViewportHeight.value,
      [depth]: el.clientHeight,
    }
  }
}

watch(
  () => [props.nodes, virtualThreshold.value, virtualItemHeight.value] as const,
  () => {
    columnScrollTop.value = {}
    columnViewportHeight.value = {}
  },
)
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
        v-for="(view, depth) in columnViews"
        :key="depth"
        class="vamis-select__chained-col"
        :class="{ 'is-virtual': view.virtual }"
        :style="
          view.virtual
            ? { '--select-chained-item-height': `${virtualItemHeight}px` }
            : undefined
        "
        @scroll="onColumnScroll(depth, $event)"
      >
        <div
          v-if="view.lead > 0"
          class="vamis-select__chained-virtual-pad"
          :style="{ height: `${view.lead}px` }"
          aria-hidden="true"
        />
        <div
          v-for="(item, index) in view.items"
          :key="String(item[valueField] ?? view.start + index)"
          class="vamis-select__chained-item"
          :class="{
            'is-active': canExpand(item)
              ? isActive(depth, view.start + index)
              : isSelected(item),
            'is-disabled': isDisabled(item),
            'is-branch': canExpand(item),
          }"
          @click="select(item, depth, view.start + index)"
        >
          <Checkbox
            v-if="multiple && !canExpand(item)"
            :model-value="isSelected(item)"
            :disabled="isDisabled(item)"
            @click.stop
            @update:model-value="select(item, depth, view.start + index)"
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
        <div
          v-if="view.trail > 0"
          class="vamis-select__chained-virtual-pad"
          :style="{ height: `${view.trail}px` }"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>
