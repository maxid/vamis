<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroup, RadioGroupItem } from '@vamis/ui'
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
const value = computed({
  get: () => {
    const current = props.schema.name ? form?.getValue(props.schema.name) : undefined
    return current == null ? undefined : String(current)
  },
  set: (v) => {
    if (!props.schema.name) return
    const match = options.value.find((opt: { value: unknown }) => String(opt.value) === String(v))
    form?.setValue(props.schema.name, match ? match.value : v)
  },
})
</script>

<template>
  <FormItem :schema="schema">
    <RadioGroup :model-value="value" :disabled="disabled" class="flex flex-wrap gap-3" @update:model-value="value = $event">
      <label v-for="opt in options" :key="opt.value" class="flex items-center gap-2 text-sm">
        <RadioGroupItem :value="String(opt.value)" />
        {{ opt.label }}
      </label>
    </RadioGroup>
  </FormItem>
</template>
