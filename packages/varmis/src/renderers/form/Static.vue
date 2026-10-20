<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@varmis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; data?: Record<string, any> }>()
const form = useForm()
const text = computed(() => {
  if (props.schema.tpl) return filterTpl(props.schema.tpl, props.data || {})
  if (props.schema.name) return String(form?.getValue(props.schema.name) ?? '')
  return String(props.schema.value ?? '')
})
</script>

<template>
  <FormItem :schema="schema">
    <p class="min-h-9 py-2">{{ text }}</p>
  </FormItem>
</template>
