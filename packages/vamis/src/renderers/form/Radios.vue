<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroup, RadioGroupItem } from '@vamis/ui'
import { useData, useScope, type SchemaObject } from '@vamis/core'
import { useFieldValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fieldApi = useFieldValue()
const data = useData()
const scope = useScope()
const options = computed(() =>
  (props.schema.options || []).map((item: any) =>
    typeof item === 'object'
      ? { label: item.label, value: item.value ?? item.label }
      : { label: String(item), value: item },
  ),
)
function fieldName(): string {
  return typeof props.schema.name === 'string' ? props.schema.name : ''
}
const value = computed({
  get: () => {
    const name = fieldName()
    if (!name) return undefined
    const current = fieldApi.getValue(name) ?? (form ? undefined : scope.value?.get(name))
    return current == null ? undefined : String(current)
  },
  set: (v: unknown) => {
    const name = fieldName()
    if (!name) return
    const match = options.value.find((opt: { value: unknown }) => String(opt.value) === String(v))
    const next = match ? match.value : v
    fieldApi.setValue(name, next)
  },
})
</script>

<template>
  <FormItem :schema="schema">
    <RadioGroup data-vamis-radios :model-value="value" :disabled="disabled" class="flex flex-wrap gap-3" @update:model-value="value = $event">
      <label v-for="opt in options" :key="opt.value" class="flex items-center gap-2 text-sm">
        <RadioGroupItem :value="String(opt.value)" />
        {{ opt.label }}
      </label>
    </RadioGroup>
  </FormItem>
</template>
