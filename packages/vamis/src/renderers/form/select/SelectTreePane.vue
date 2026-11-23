<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue'
import {
  isTreeItemCheckDisabled,
  isTreeItemChecked,
  optionValuesEqual,
  toggleTreeSelection,
  treeItemPartial,
  walkOptions,
  type OptionItem,
  type SchemaObject,
} from '@vamis/core'
import { VamisIcon } from '@vamis/ui'
import TreeBranch from '../TreeBranch.vue'
import { useTreeState } from '../useTreeState'

const props = withDefaults(defineProps<{
  schema: SchemaObject
  nodes: OptionItem[]
  visibleNodes?: OptionItem[]
  selectedValues: unknown[]
  value?: unknown
  disabled?: boolean
  query?: string
  loadingConfig?: { root?: string; show?: boolean }
  showIcon?: boolean
  resetToken?: number
}>(), {
  query: '',
  showIcon: false,
})

const emit = defineEmits<{
  'update:nodes': [nodes: OptionItem[]]
  toggle: [values: unknown[]]
}>()

const schemaRef = toRef(props, 'schema')
const nodesRef = toRef(props, 'nodes')
const disabledRef = toRef(props, 'disabled')
const queryRef = toRef(props, 'query')
const paneEl = ref<HTMLElement | null>(null)
const tree = useTreeState({
  schema: schemaRef,
  nodes: nodesRef,
  setNodes: (nodes) => emit('update:nodes', nodes),
  disabled: disabledRef,
  query: queryRef,
  currentValue: () => props.value,
})

defineExpose({ scrollEl: paneEl })

const valueField = computed(() => String(props.schema.valueField || 'value'))
const multiple = computed(() => props.schema.multiple === true)
const deferField = tree.deferField
const hasDeferredTreeNodes = computed(() =>
  walkOptions(props.nodes).some((item) => item.deferApi || !!item[deferField.value]),
)
const onlyChildren = computed(() =>
  props.schema.onlyChildren == null ? !hasDeferredTreeNodes.value : !!props.schema.onlyChildren,
)
const checkAllLabel = computed(() =>
  props.schema.checkAllLabel != null ? String(props.schema.checkAllLabel) : '全选',
)
const availableOptions = computed(() => {
  const list = walkOptions(props.nodes)
  return list.filter((item) => {
    if (item.disabled) return false
    if (onlyChildren.value && item.children?.length) return false
    return item[valueField.value] != null && item[valueField.value] !== ''
  })
})
const allChecked = computed(
  () =>
    !!availableOptions.value.length &&
    availableOptions.value.every((item) => checked(item)),
)
const partialChecked = computed(
  () =>
    !allChecked.value &&
    availableOptions.value.some((item) => checked(item) || partial(item)),
)

let expansionSeeded = false
watch(
  () => props.nodes,
  (nodes) => {
    if (!expansionSeeded) {
      tree.seedExpanded(nodes)
      expansionSeeded = true
      return
    }
    tree.ensureExpanded(nodes)
  },
  { immediate: true },
)
watch(
  () => [props.schema.initiallyOpen, props.schema.unfoldedLevel] as const,
  () => tree.seedExpanded(props.nodes),
  { immediate: true },
)
watch(
  () => props.resetToken,
  () => {
    void nextTick(() => {
      tree.seedExpanded(props.nodes)
      expansionSeeded = true
    })
  },
)

function checkOptions() {
  return {
    multiple: multiple.value,
    onlyLeaf: false,
    autoCheckChildren: props.schema.autoCheckChildren !== false,
    cascade: true,
    withChildren: false,
    onlyChildren: onlyChildren.value,
    autoCancelParent: props.schema.autoCancelParent === true,
    valueField: valueField.value,
    options: props.nodes,
  }
}

function checked(item: OptionItem) {
  return isTreeItemChecked(item, props.selectedValues, checkOptions())
}

function selected(item: OptionItem) {
  return props.selectedValues.some((value) =>
    optionValuesEqual(value, item.value, valueField.value),
  )
}

function partial(item: OptionItem) {
  return treeItemPartial(item, props.selectedValues, checkOptions())
}

function checkDisabled(item: OptionItem) {
  return isTreeItemCheckDisabled(item, props.selectedValues, checkOptions())
}

function toggle(item: OptionItem) {
  const next = toggleTreeSelection(props.selectedValues, item, checkOptions())
  if (next) emit('toggle', next)
}

function toggleAll() {
  if (!multiple.value) return
  emit(
    'toggle',
    allChecked.value ? [] : availableOptions.value.map((item) => item[valueField.value]),
  )
}
</script>

<template>
  <div ref="paneEl" class="vamis-select__tree-pane">
    <button
      v-if="multiple && schema.checkAll"
      type="button"
      class="vamis-select__checkall vamis-select__tree-checkall"
      :disabled="disabled"
      @click="toggleAll"
    >
      <span
        class="vamis-select__check"
        :class="{ 'is-checked': allChecked, 'is-partial': partialChecked }"
      >
        <VamisIcon name="menu-check" v-if="allChecked" />
        <VamisIcon name="checkbox-partial" v-else-if="partialChecked" />
      </span>
      <span>{{ checkAllLabel }}</span>
    </button>
    <TreeBranch
      :nodes="visibleNodes ?? nodes"
      :checked="checked"
      :selected="selected"
      :partial="partial"
      :expanded="tree.isExpanded"
      :deferring="tree.isDeferring"
      :defer-field="tree.deferField.value"
      :loading-config="loadingConfig"
      :disabled="disabled"
      :show-icon="showIcon"
      :multiple="multiple"
      :virtual-threshold="Number(schema.virtualThreshold ?? 100)"
      :query="query"
      :check-disabled="checkDisabled"
      :item-actions="schema.itemActions"
      :menu-tpl="schema.menuTpl"
      @pick="toggle"
      @expand="tree.toggleExpand"
    />
  </div>
</template>
