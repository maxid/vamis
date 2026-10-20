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
      ? { label: item.label, value: String(item.value ?? item.label) }
      : { label: String(item), value: String(item) },
  ),
)
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
    <RadioGroup :model-value="value" :disabled="disabled" class="flex flex-wrap gap-3" @update:model-value="value = $event">
      <label v-for="opt in options" :key="opt.value" class="flex items-center gap-2 text-sm">
        <RadioGroupItem :value="opt.value" />
        {{ opt.label }}
      </label>
    </RadioGroup>
  </FormItem>
</template>
