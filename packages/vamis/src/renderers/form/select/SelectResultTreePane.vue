<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import {
  optionValuesEqual,
  type OptionItem,
  type SchemaObject,
} from '@vamis/core'
import TreeBranch from '../TreeBranch.vue'
import { useTreeState } from '../useTreeState'

const props = defineProps<{
  schema: SchemaObject
  nodes: OptionItem[]
  selectedValues: unknown[]
  query?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  remove: [item: OptionItem]
}>()

const valueField = computed(() => String(props.schema.valueField || 'value'))
const resultSchema = computed<SchemaObject>(() => ({
  ...props.schema,
  multiple: false,
  checkAll: false,
  initiallyOpen: true,
}))

function isSelected(item: OptionItem) {
  return props.selectedValues.some((value) =>
    optionValuesEqual(value, item[valueField.value], valueField.value),
  )
}

function resultNodes(nodes: OptionItem[]): OptionItem[] {
  const out: OptionItem[] = []
  for (const node of nodes) {
    if (isSelected(node)) {
      out.push({ ...node, children: undefined })
      continue
    }
    const children = resultNodes(node.children || [])
    if (children.length) out.push({ ...node, children })
  }
  return out
}

const visibleResultNodes = computed(() => resultNodes(props.nodes))
const visibleResultNodesRef = computed(() => visibleResultNodes.value)
const queryRef = computed(() => props.query || '')
const disabledRef = toRef(props, 'disabled')
const tree = useTreeState({
  schema: resultSchema,
  nodes: visibleResultNodesRef,
  setNodes: () => undefined,
  disabled: disabledRef,
  query: queryRef,
  currentValue: () => props.selectedValues[0],
})

const seeded = ref(false)
watch(
  visibleResultNodes,
  (nodes) => {
    if (!seeded.value) {
      tree.seedExpanded(nodes)
      seeded.value = true
    } else {
      tree.ensureExpanded(nodes)
    }
  },
  { immediate: true },
)

function checked() {
  return false
}

function partial() {
  return false
}
</script>

<template>
  <div
    class="vamis-select__tree-pane vamis-transfer__result-tree"
    data-vamis-transfer-result-mode="tree"
  >
    <TreeBranch
      :nodes="visibleResultNodes"
      :checked="checked"
      :partial="partial"
      :expanded="tree.isExpanded"
      :deferring="tree.isDeferring"
      :defer-field="tree.deferField.value"
      :disabled="disabled"
      :show-icon="false"
      :multiple="false"
      :removable="true"
      :node-behavior="[]"
      :query="query"
      :virtual-threshold="Number(schema.virtualThreshold ?? 100)"
      @expand="tree.toggleExpand"
      @remove="emit('remove', $event)"
    />
  </div>
</template>
