<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const options = computed(() =>
  (props.schema.options || []).map((item: any) =>
    typeof item === 'object'
      ? { label: item.label, value: item.value ?? item.label }
      : { label: String(item), value: item },
  ),
)
const selected = computed<unknown[]>({
  get: () => {
    const current = props.schema.name ? form?.getValue(props.schema.name) : []
    return Array.isArray(current) ? current : []
  },
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})

function toggle(value: unknown, checked: boolean) {
  const next = new Set(selected.value)
  if (checked) next.add(value)
  else next.delete(value)
  selected.value = [...next]
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex flex-wrap gap-3">
      <label v-for="opt in options" :key="String(opt.value)" class="flex items-center gap-2 text-sm">
        <Checkbox
          :model-value="selected.includes(opt.value)"
          :disabled="disabled"
          @update:model-value="toggle(opt.value, $event === true)"
        />
        {{ opt.label }}
      </label>
    </div>
  </FormItem>
</template>
