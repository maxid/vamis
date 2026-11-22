<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import {
  findOption,
  optionNeedsDefer,
  optionValuesEqual,
  useEnv,
  type OptionItem,
  type SchemaObject,
} from '@vamis/core'
import { VamisIcon } from '@vamis/ui'
import SelectChainedPane from './SelectChainedPane.vue'
import SelectTablePane from './SelectTablePane.vue'
import SelectTreePane from './SelectTreePane.vue'
import { useTreeState } from '../useTreeState'

const props = defineProps<{
  schema: SchemaObject
  leftOptions: OptionItem[]
  nodes: OptionItem[]
  selectedValues: unknown[]
  leftValue?: unknown
  leftDefaultValue?: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  pick: [item: OptionItem]
  toggle: [values: unknown[]]
  'toggle-all': [items: OptionItem[]]
  'update:nodes': [nodes: OptionItem[]]
  'update:leftValue': [value: unknown]
}>()

const leftValueField = computed(() => String(props.schema.valueField || 'value'))
const leftValue = computed(() => props.leftValue ?? props.leftDefaultValue)
const hasLeftSelection = computed(
  () => leftValue.value != null && leftValue.value !== '',
)
const leftSelectedValues = computed(() =>
  leftValue.value == null || leftValue.value === '' ? [] : [leftValue.value],
)
const leftMode = computed(() => String(props.schema.leftMode || 'list'))
const rightMode = computed(() => String(props.schema.rightMode || 'list'))
const leftSchema = computed<SchemaObject>(() => ({
  ...props.schema,
  selectMode: 'tree',
  multiple: false,
  checkAll: false,
  initiallyOpen: true,
  onlyChildren: false,
}))
const leftNodesOverride = ref<OptionItem[] | null>(null)
const rightRootOverride = ref<OptionItem[] | null>(null)
const rightNodesOverride = ref<OptionItem[] | null>(null)
const env = useEnv()

function optionsSignature(options: OptionItem[]): string {
  return options
    .map((item) =>
      [
        String(item.value ?? ''),
        String(item.label ?? ''),
        String(item.ref ?? ''),
        item.defer ? '1' : '0',
        item.children?.length ? optionsSignature(item.children) : '',
      ].join(':'),
    )
    .join('|')
}

watch(
  () => optionsSignature(props.leftOptions),
  () => {
    leftNodesOverride.value = null
  },
)
watch(
  () => props.nodes,
  () => {
    rightRootOverride.value = null
    rightNodesOverride.value = null
  },
)
watch(leftValue, () => {
  rightNodesOverride.value = null
})

const rightRootNodes = computed(() => rightRootOverride.value ?? props.nodes)
const rightTree = useTreeState({
  schema: toRef(props, 'schema'),
  nodes: rightRootNodes,
  setNodes: (nodes) => {
    rightRootOverride.value = nodes
    emit('update:nodes', nodes)
  },
  disabled: toRef(props, 'disabled'),
  currentValue: () => props.selectedValues[0],
})

const selectedLeft = computed(() => {
  return rightRootNodes.value.find((item) =>
    optionValuesEqual(item.ref, leftValue.value, leftValueField.value),
  )
})

const leftTreeOptions = computed(() => leftNodesOverride.value ?? props.leftOptions)
const rightOptions = computed(() => selectedLeft.value?.children ?? [])
const rightTreeOptions = computed(() => rightNodesOverride.value ?? rightOptions.value)
type RightListRow =
  | { kind: 'group'; key: string; label: string; depth: number }
  | { kind: 'item'; key: string; item: OptionItem; depth: number }

const rightListRows = computed(() => {
  const rows: RightListRow[] = []
  const walk = (items: OptionItem[], depth: number) => {
    for (const [index, item] of items.entries()) {
      const key = `${depth}:${index}:${String(item.value ?? item.label)}`
      if (item.children?.length) {
        rows.push({ kind: 'group', key, label: item.label, depth })
        walk(item.children, depth + 1)
      } else {
        rows.push({ kind: 'item', key, item, depth })
      }
    }
  }
  walk(rightOptions.value, 0)
  return rows
})
const rightTreeSchema = computed<SchemaObject>(() => ({
  ...props.schema,
  selectMode: 'tree',
  initiallyOpen: true,
}))

function isLeftActive(item: OptionItem) {
  return optionValuesEqual(item.value, leftValue.value, leftValueField.value)
}

function selectLeft(item: OptionItem) {
  if (props.disabled || item.disabled) return
  emit('update:leftValue', item.value)
  triggerRightDefer(item.value)
}

function selectLeftTree(values: unknown[]) {
  const value = values[0]
  const item = findOption(leftTreeOptions.value, value, leftValueField.value)
  if (item) {
    emit('update:leftValue', item.value)
    triggerRightDefer(item.value)
  }
}

function triggerRightDefer(value: unknown) {
  const descriptor = rightRootNodes.value.find((item) =>
    optionValuesEqual(item.ref, value, leftValueField.value),
  )
  if (
    descriptor &&
    optionNeedsDefer(descriptor, rightTree.deferField.value)
  ) {
    void rightTree.deferLoad(descriptor)
  }
}

function selectRight(item: OptionItem) {
  if (props.disabled || item.disabled) return
  emit('pick', item)
}

function updateRightTreeNodes(nodes: OptionItem[]) {
  rightNodesOverride.value = nodes
  if (!selectedLeft.value) return
  const roots = rightRootNodes.value.map((item) =>
    item === selectedLeft.value ? { ...item, children: nodes } : item,
  )
  rightRootOverride.value = roots
  emit('update:nodes', roots)
}

function isRightSelected(item: OptionItem) {
  return props.selectedValues.some((value) =>
    optionValuesEqual(value, item.value, leftValueField.value),
  )
}
</script>

<template>
  <div class="vamis-select__associated">
    <div class="vamis-select__associated-left">
      <SelectTreePane
        v-if="leftMode === 'tree'"
        :schema="leftSchema"
        :nodes="leftTreeOptions"
        :visible-nodes="leftTreeOptions"
        :selected-values="leftSelectedValues"
        :value="leftValue"
        :disabled="disabled"
        show-icon
        @update:nodes="leftNodesOverride = $event"
        @toggle="selectLeftTree"
      />
      <template v-else>
        <div
        v-for="item in leftOptions"
        :key="String(item.value ?? item.label)"
        class="vamis-select__associated-left-item"
        :class="{
          'is-active': isLeftActive(item),
          'is-disabled': disabled || item.disabled,
        }"
        @click="selectLeft(item)"
      >
        {{ item.label }}
      </div>
      </template>
    </div>
    <div class="vamis-select__associated-right">
      <div
        v-if="!hasLeftSelection"
        class="vamis-select__associated-box"
      >
        {{ env.translate('Transfer.selectFromLeft') }}
      </div>
      <div
        v-else-if="!selectedLeft"
        class="vamis-select__associated-box"
      >
        {{ env.translate('Transfer.configError') }}
      </div>
      <SelectTablePane
        v-else-if="rightMode === 'table'"
        :schema="schema"
        :nodes="rightOptions"
        :selected-values="selectedValues"
        :disabled="disabled"
        @pick="selectRight"
        @toggle-all="emit('toggle-all', rightOptions)"
      />
      <SelectTreePane
        v-else-if="rightMode === 'tree'"
        :schema="rightTreeSchema"
        :nodes="rightTreeOptions"
        :visible-nodes="rightTreeOptions"
        :selected-values="selectedValues"
        :value="selectedValues[0]"
        :disabled="disabled"
        show-icon
        @update:nodes="updateRightTreeNodes"
        @toggle="emit('toggle', $event)"
      />
      <SelectChainedPane
        v-else-if="rightMode === 'chained'"
        :schema="schema"
        :nodes="rightOptions"
        :selected-values="selectedValues"
        :disabled="disabled"
        @pick="selectRight"
        @toggle-all="emit('toggle-all', rightOptions)"
      />
      <template v-else>
        <template v-for="row in rightListRows" :key="row.key">
          <div
            v-if="row.kind === 'group'"
            class="vamis-select__associated-right-group"
            :style="{ '--associated-depth': row.depth }"
          >
            {{ row.label }}
          </div>
          <div
            v-else
            class="vamis-select__associated-right-item"
            :class="{
              'is-disabled': disabled || row.item.disabled,
              'is-active': isRightSelected(row.item),
            }"
            :style="{ '--associated-depth': row.depth }"
            role="option"
            :aria-selected="isRightSelected(row.item)"
            @click="selectRight(row.item)"
          >
            <span
              v-if="schema.multiple"
              class="vamis-select__check"
              :class="{ 'is-checked': isRightSelected(row.item) }"
              aria-hidden="true"
            >
              <VamisIcon name="menu-check" v-if="isRightSelected(row.item)" />
            </span>
            {{ row.item.label }}
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
