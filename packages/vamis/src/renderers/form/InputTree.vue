<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import TreeBranch from './TreeBranch.vue'
import {
  dumpJoined,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const query = ref('')
const options = computed(() => normalizeOptions(props.schema.options))
const multiple = computed(() => !!props.schema.multiple)
const selected = computed({
  get: () =>
    parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', multiple.value, props.schema.joinValues !== false),
  set: (values: unknown[]) =>
    props.schema.name && form?.setValue(props.schema.name, dumpJoined(values, multiple.value, props.schema.joinValues !== false)),
})

function matches(item: OptionItem): boolean {
  if (!query.value) return true
  if (item.label.toLowerCase().includes(query.value.toLowerCase())) return true
  return !!item.children?.some(matches)
}

function toggle(item: OptionItem) {
  if (props.disabled || item.disabled) return
  if (!multiple.value) {
    selected.value = [item.value]
    return
  }
  const exists = selected.value.some((value) => optionValuesEqual(value, item.value))
  selected.value = exists
    ? selected.value.filter((value) => !optionValuesEqual(value, item.value))
    : [...selected.value, item.value]
}

function checked(item: OptionItem) {
  return selected.value.some((value) => optionValuesEqual(value, item.value))
}
</script>

<template>
  <FormItem :schema="schema">
    <input
      v-if="schema.searchable"
      v-model="query"
      class="mb-2 w-full rounded-md border bg-background px-2 py-1 text-sm"
      placeholder="搜索"
    />
    <div class="max-h-56 overflow-auto rounded-md border py-1">
      <TreeBranch :nodes="options.filter(matches)" :checked="checked" :disabled="!!disabled" @pick="toggle" />
    </div>
  </FormItem>
</template>
