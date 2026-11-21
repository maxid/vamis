<script setup lang="ts">
import { computed } from 'vue'
import {
  findOption,
  optionValuesEqual,
  type OptionItem,
  type SchemaObject,
} from '@vamis/core'
import SelectChainedPane from './SelectChainedPane.vue'
import SelectTablePane from './SelectTablePane.vue'
import SelectTreePane from './SelectTreePane.vue'

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
  'toggle-all': []
  'update:leftValue': [value: unknown]
}>()

const leftValueField = computed(() => String(props.schema.valueField || 'value'))
const leftValue = computed(() => props.leftValue ?? props.leftDefaultValue)
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

const selectedLeft = computed(() => {
  return props.nodes.find((item) =>
    optionValuesEqual(item.ref, leftValue.value, leftValueField.value),
  )
})

const rightOptions = computed(() => selectedLeft.value?.children ?? [])
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
}

function selectLeftTree(values: unknown[]) {
  const value = values[0]
  const item = findOption(props.leftOptions, value, leftValueField.value)
  if (item) emit('update:leftValue', item.value)
}

function selectRight(item: OptionItem) {
  if (props.disabled || item.disabled) return
  emit('pick', item)
}
</script>

<template>
  <div class="vamis-select__associated">
    <div class="vamis-select__associated-left">
      <SelectTreePane
        v-if="leftMode === 'tree'"
        :schema="leftSchema"
        :nodes="leftOptions"
        :visible-nodes="leftOptions"
        :selected-values="leftSelectedValues"
        :value="leftValue"
        :disabled="disabled"
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
      <SelectTablePane
        v-if="rightMode === 'table'"
        :schema="schema"
        :nodes="rightOptions"
        :selected-values="selectedValues"
        :disabled="disabled"
        @pick="selectRight"
        @toggle-all="emit('toggle-all')"
      />
      <SelectTreePane
        v-else-if="rightMode === 'tree'"
        :schema="rightTreeSchema"
        :nodes="rightOptions"
        :visible-nodes="rightOptions"
        :selected-values="selectedValues"
        :value="selectedValues[0]"
        :disabled="disabled"
        @toggle="emit('toggle', $event)"
      />
      <SelectChainedPane
        v-else-if="rightMode === 'chained'"
        :schema="schema"
        :nodes="rightOptions"
        :selected-values="selectedValues"
        :disabled="disabled"
        @pick="selectRight"
        @toggle-all="emit('toggle-all')"
      />
      <template v-else>
        <div
          v-for="item in rightOptions"
          :key="String(item.value ?? item.label)"
          class="vamis-select__associated-right-item"
          :class="{
            'is-disabled': disabled || item.disabled,
            'is-active': selectedValues.some((value) =>
              optionValuesEqual(value, item.value, leftValueField)
            ),
          }"
          @click="selectRight(item)"
        >
          {{ item.label }}
        </div>
      </template>
    </div>
  </div>
</template>
