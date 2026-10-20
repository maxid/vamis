<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import TreeBranch from './TreeBranch.vue'
import {
  dumpJoined,
  flattenOptions,
  normalizeOptions,
  optionValuesEqual,
  parseJoined,
  type OptionItem,
} from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const open = ref(false)
const multiple = computed(() => !!props.schema.multiple)
const tree = computed(() => normalizeOptions(props.schema.options))
const selected = computed({
  get: () =>
    parseJoined(props.schema.name ? form?.getValue(props.schema.name) : '', multiple.value, props.schema.joinValues !== false),
  set: (values: unknown[]) =>
    props.schema.name && form?.setValue(props.schema.name, dumpJoined(values, multiple.value, props.schema.joinValues !== false)),
})
const label = computed(() => {
  const flat = flattenOptions(tree.value)
  const names = selected.value.map((value) => flat.find((item) => optionValuesEqual(item.value, value))?.label || String(value))
  return names.filter(Boolean).join(' / ') || props.schema.placeholder || '请选择'
})

function toggle(item: OptionItem) {
  if (item.children?.length && item.value == null) return
  if (!multiple.value) {
    selected.value = [item.value]
    open.value = false
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
    <div class="relative">
      <Button type="button" variant="outline" class="w-full justify-between" :disabled="disabled" @click="open = !open">
        <span class="truncate">{{ label }}</span>
        <span class="text-xs text-muted-foreground">树选择</span>
      </Button>
      <div v-if="open" class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover py-1 shadow-md">
        <TreeBranch :nodes="tree" :checked="checked" :disabled="!!disabled" @pick="toggle" />
      </div>
    </div>
  </FormItem>
</template>
