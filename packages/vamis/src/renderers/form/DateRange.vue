<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const inputType = computed(() =>
  props.schema.type === 'input-datetime-range' ? 'datetime-local' : 'date',
)

const range = computed({
  get() {
    const value = props.schema.name ? form?.getValue(props.schema.name) : undefined
    if (Array.isArray(value)) return { start: value[0] || '', end: value[1] || '' }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, any>
      return { start: obj.start || obj.from || '', end: obj.end || obj.to || '' }
    }
    if (typeof value === 'string' && props.schema.delimiter) {
      const [start = '', end = ''] = value.split(props.schema.delimiter)
      return { start, end }
    }
    return { start: '', end: '' }
  },
  set(next: { start: string; end: string }) {
    if (!props.schema.name) return
    if (props.schema.delimiter) {
      form?.setValue(props.schema.name, [next.start, next.end].join(props.schema.delimiter))
      return
    }
    form?.setValue(props.schema.name, next)
  },
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex items-center gap-2">
      <Input
        :model-value="range.start"
        :type="inputType"
        :disabled="disabled"
        class="w-full"
        @update:model-value="range = { ...range, start: String($event) }"
      />
      <span class="text-xs text-muted-foreground">至</span>
      <Input
        :model-value="range.end"
        :type="inputType"
        :disabled="disabled"
        class="w-full"
        @update:model-value="range = { ...range, end: String($event) }"
      />
    </div>
  </FormItem>
</template>
