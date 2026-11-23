<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import {
  SchemaRenderer,
  optionNeedsDefer,
  optionValuesEqual,
  resolveClassName,
  type OptionItem,
  type SchemaObject,
} from '@vamis/core'
import { Checkbox } from '@vamis/ui'
import Spinner from '../../Spinner.vue'
import { useTreeState } from '../useTreeState'

const props = defineProps<{
  schema: SchemaObject
  nodes: OptionItem[]
  selectedValues: unknown[]
  optionClassName?: string
  disabled?: boolean
  loadingConfig?: { root?: string; show?: boolean }
}>()

const emit = defineEmits<{
  pick: [item: OptionItem]
  'toggle-all': []
  'update:nodes': [nodes: OptionItem[]]
}>()

const VIRTUAL_BUFFER = 4
const VIRTUAL_VIEWPORT = 266

const valueField = computed(() => String(props.schema.valueField || 'value'))
const multiple = computed(() => props.schema.multiple === true)
const schemaRef = toRef(props, 'schema')
const nodesRef = toRef(props, 'nodes')
const disabledRef = toRef(props, 'disabled')
const tree = useTreeState({
  schema: schemaRef,
  nodes: nodesRef,
  setNodes: (nodes) => emit('update:nodes', nodes),
  disabled: disabledRef,
  currentValue: () => props.selectedValues,
})
const deferSpinnerSchema = computed<SchemaObject>(() => ({
  type: 'spinner',
  show: true,
  size: 'sm',
  spinnerClassName: 'vamis-select__chained-spinner',
  loadingConfig: props.loadingConfig,
}))
const resolvedOptionClassName = computed(() =>
  props.optionClassName || resolveClassName(props.schema.optionClassName),
)
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
      !Array.isArray(nodes[current]?.children)
    ) {
      path.value = defaultPath(nodes)
    }
  },
  { immediate: true },
)

function maxDepth(list: OptionItem[], depth = 1): number {
  let max = depth
  for (const item of list) {
    if (Array.isArray(item.children)) {
      max = Math.max(max, maxDepth(item.children, depth + 1))
    } else if (item[tree.deferField.value]) {
      max = Math.max(max, depth + 1)
    }
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

function selectedOptionAt(depth: number) {
  if (depth <= 0) return undefined
  let list = props.nodes
  let current: OptionItem | undefined
  for (let index = 0; index < depth; index += 1) {
    const selectedIndex = path.value[index]
    if (typeof selectedIndex !== 'number') return undefined
    current = list[selectedIndex]
    if (!current) return undefined
    list = current.children ?? []
  }
  return current
}

const columnDefinitions = computed(() =>
  Array.from({ length: columnCount.value }, (_, depth) => {
    const parent = selectedOptionAt(depth)
    return {
      items: childrenAt(depth),
      subTitle:
        depth > 0 && parent?.subTitle != null
          ? String(parent.subTitle)
          : '',
      placeholder:
        depth > 0 && parent?.placeholder != null
          ? String(parent.placeholder)
          : depth === 0
            ? emptyText.value
            : '',
    }
  }),
)
const columnViews = computed(() =>
  columnDefinitions.value.map((column, depth) => {
    const items = column.items
    const virtual = items.length > virtualThreshold.value
    if (!virtual) {
      return {
        items,
        subTitle: column.subTitle,
        placeholder: column.placeholder,
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
      subTitle: column.subTitle,
      placeholder: column.placeholder,
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
      if (Array.isArray(item.children)) walk(item.children)
      else if (item[tree.deferField.value] && item.loaded !== true) continue
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
  return Array.isArray(item.children) || !!item[tree.deferField.value]
}

function select(item: OptionItem, depth: number, index: number) {
  if (isDisabled(item)) return
  path.value = [...path.value.slice(0, depth), index]
  if (tree.isDeferring(item)) return
  if (optionNeedsDefer(item, tree.deferField.value)) {
    void tree.deferLoad(item)
    return
  }
  if (!canExpand(item)) emit('pick', item)
}

function labelValue(item: OptionItem) {
  return `${item.label ?? ''}${item.tip ?? ''}`
}

function itemClass(item: OptionItem) {
  return [
    resolvedOptionClassName.value,
    resolveClassName(item.className, item),
  ]
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
      :class="resolvedOptionClassName"
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
          v-if="view.subTitle"
          class="vamis-select__chained-sub-title"
        >
          {{ view.subTitle }}
        </div>
        <div
          v-if="!view.items.length"
          class="vamis-select__chained-placeholder"
        >
          {{ view.placeholder }}
        </div>
        <div
          v-if="view.items.length && view.lead > 0"
          class="vamis-select__chained-virtual-pad"
          :style="{ height: `${view.lead}px` }"
          aria-hidden="true"
        />
        <div
          v-for="(item, index) in view.items"
          :key="String(item[valueField] ?? view.start + index)"
          class="vamis-select__chained-item"
          :class="[
            itemClass(item),
            {
              'is-active': canExpand(item)
                ? isActive(depth, view.start + index)
                : isSelected(item),
              'is-disabled': isDisabled(item),
              'is-branch': canExpand(item),
            },
          ]"
          :aria-busy="tree.isDeferring(item) || undefined"
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
            v-if="schema.menuTpl"
            class="vamis-select__chained-item-label"
            :schema="schema.menuTpl"
            :extra-data="item"
          />
          <SchemaRenderer
            v-else-if="item.schema || item.tpl || item.type"
            class="vamis-select__chained-item-label"
            :schema="item"
            :extra-data="item"
          />
          <span v-else class="vamis-select__chained-item-label">
            {{ labelValue(item) }}
          </span>
          <Spinner
            v-if="tree.isDeferring(item)"
            :schema="deferSpinnerSchema"
          />
        </div>
        <div
          v-if="view.items.length && view.trail > 0"
          class="vamis-select__chained-virtual-pad"
          :style="{ height: `${view.trail}px` }"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
</template>
