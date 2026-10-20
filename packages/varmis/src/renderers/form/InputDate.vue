<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@varmis/ui'
import type { SchemaObject } from '@varmis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const value = computed({
  get: () => (props.schema.name ? form?.getValue(props.schema.name) : '') ?? '',
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})
const inputType = computed(() => {
  const type = props.schema.type
  if (type === 'input-datetime') return 'datetime-local'
  if (type === 'input-time') return 'time'
  return 'date'
})
</script>

<template>
  <FormItem :schema="schema">
    <Input v-model="value" :type="inputType" :disabled="disabled" class="w-full" />
  </FormItem>
</template>
