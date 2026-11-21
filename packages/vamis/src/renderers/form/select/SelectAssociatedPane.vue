<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  optionValuesEqual,
  type OptionItem,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  leftOptions: OptionItem[]
  nodes: OptionItem[]
  selectedValues: unknown[]
  leftDefaultValue?: unknown
  disabled?: boolean
}>()

const emit = defineEmits<{
  pick: [item: OptionItem]
}>()

const leftValue = ref<unknown>(props.leftDefaultValue)

watch(
  () => props.leftDefaultValue,
  (value) => {
    leftValue.value = value
  },
)

const leftValueField = computed(() => String(props.schema.valueField || 'value'))

const selectedLeft = computed(() => {
  return props.nodes.find((item) =>
    optionValuesEqual(item.ref, leftValue.value, leftValueField.value),
  )
})

const rightOptions = computed(() => selectedLeft.value?.children ?? [])

function isLeftActive(item: OptionItem) {
  return optionValuesEqual(item.value, leftValue.value, leftValueField.value)
}

function selectLeft(item: OptionItem) {
  if (props.disabled || item.disabled) return
  leftValue.value = item.value
}

function selectRight(item: OptionItem) {
  if (props.disabled || item.disabled) return
  emit('pick', item)
}
</script>

<template>
  <div class="vamis-select__associated">
    <div class="vamis-select__associated-left">
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
    </div>
    <div class="vamis-select__associated-right">
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
    </div>
  </div>
</template>
