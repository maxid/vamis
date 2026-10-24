<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import PopOverHost from '../PopOverHost.vue'

const props = defineProps<{ schema: SchemaObject; data?: Record<string, any> }>()
const form = useForm()
const text = computed(() => {
  const data = props.data || {}
  if (props.schema.tpl) return filterTpl(props.schema.tpl, data)
  if (props.schema.name) {
    const fromForm = form?.getValue(props.schema.name)
    if (fromForm != null && fromForm !== '') return String(fromForm)
    if (data[props.schema.name] != null && data[props.schema.name] !== '') return String(data[props.schema.name])
  }
  if (props.schema.value != null && props.schema.value !== '') return filterTpl(props.schema.value, data)
  return ''
})
</script>

<template>
  <FormItem :schema="schema">
    <PopOverHost :schema="schema" :data="data">
      <p class="flex min-h-[var(--control-h)] items-center text-sm">{{ text }}</p>
    </PopOverHost>
  </FormItem>
</template>
