<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { controlInputValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const value = computed({
  get: () => controlInputValue(props.schema.name ? form?.getValue(props.schema.name) : undefined),
  set: (v) =>
    props.schema.name && form?.setValue(props.schema.name, v === '' ? undefined : Number(v)),
})
</script>

<template>
  <FormItem :schema="schema">
    <Input
      v-model="value"
      type="number"
      :name="schema.name"
      :placeholder="schema.placeholder"
      :disabled="disabled"
      class="w-full"
    />
  </FormItem>
</template>
