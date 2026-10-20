<script setup lang="ts">
import { computed } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@varmis/ui'
import type { SchemaObject } from '@varmis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
function flattenOptions(raw: any[], prefix = ''): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = []
  for (const item of raw || []) {
    if (item == null) continue
    if (typeof item !== 'object') {
      out.push({ label: `${prefix}${item}`, value: String(item) })
      continue
    }
    const label = `${prefix}${item.label ?? item.name ?? item.value ?? ''}`
    const value = String(item.value ?? item.id ?? item.label ?? '')
    if (Array.isArray(item.children) && item.children.length) {
      if (item.value != null && item.selectable !== false) out.push({ label, value })
      out.push(...flattenOptions(item.children, `${prefix}— `))
    } else {
      out.push({ label, value })
    }
  }
  return out
}

const options = computed(() => flattenOptions(props.schema.options || []))
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
