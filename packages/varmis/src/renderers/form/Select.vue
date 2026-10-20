<script setup lang="ts">
import { computed } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@varmis/ui'
import type { SchemaObject } from '@varmis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const options = computed(() => {
  const raw = props.schema.options || []
  return raw.map((item: any) =>
    typeof item === 'object'
      ? { label: item.label ?? item.name, value: String(item.value ?? item.id ?? item.label) }
      : { label: String(item), value: String(item) },
  )
})
const value = computed({
  get: () => {
    const current = props.schema.name ? form?.getValue(props.schema.name) : ''
    return current == null ? undefined : String(current)
  },
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})
</script>

<template>
  <FormItem :schema="schema">
    <Select :model-value="value" :disabled="disabled" @update:model-value="value = $event">
      <SelectTrigger class="w-full">
        <SelectValue :placeholder="schema.placeholder || '请选择'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </FormItem>
</template>
