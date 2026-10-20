<script setup lang="ts">
import { computed } from 'vue'
import { RadioGroup, RadioGroupItem } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const trueValue = computed(() => props.schema.trueValue ?? true)
const falseValue = computed(() => props.schema.falseValue ?? false)
const value = computed({
  get: () => {
    const current = props.schema.name ? form?.getValue(props.schema.name) : undefined
    return String(current) === String(trueValue.value) ? 'on' : 'off'
  },
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v === 'on' ? trueValue.value : falseValue.value),
})
</script>

<template>
  <FormItem :schema="schema">
    <RadioGroup :model-value="value" :disabled="disabled" class="flex items-center gap-2" @update:model-value="value = $event === 'on' ? 'on' : 'off'">
      <label class="flex items-center gap-2 text-sm">
        <RadioGroupItem value="on" />
        {{ schema.option || schema.label || '选项' }}
      </label>
    </RadioGroup>
  </FormItem>
</template>
