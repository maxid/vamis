<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import { readRangeValue, writeRangeValue, type SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const range = computed({
  get: () => readRangeValue(props.schema.name ? form?.getValue(props.schema.name) : undefined, props.schema.delimiter),
  set: (next) => props.schema.name && form?.setValue(props.schema.name, writeRangeValue(next, props.schema.delimiter)),
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex items-center gap-2">
      <Input type="time" :model-value="String(range.start || '')" :disabled="disabled" @update:model-value="range = { ...range, start: String($event ?? '') }" />
      <span class="text-xs text-muted-foreground">至</span>
      <Input type="time" :model-value="String(range.end || '')" :disabled="disabled" @update:model-value="range = { ...range, end: String($event ?? '') }" />
    </div>
  </FormItem>
</template>
