<script setup lang="ts">
import { computed } from 'vue'
import { evalFormula, filterTpl, type SchemaObject } from '@vamis/core'
import { Input } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { useData } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const data = useData()
const result = computed(() => {
  const formula = String(props.schema.formula || props.schema.value || '')
  if (!formula) return ''
  const ctx = { ...data.value, ...(form?.store.data || {}) }
  if (formula.includes('${')) return filterTpl(formula, ctx)
  const value = evalFormula(formula, ctx)
  return value == null ? '' : String(value)
})
</script>

<template>
  <FormItem :schema="schema">
    <Input :model-value="result" :disabled="schema.type !== 'input-formula' || disabled" readonly />
  </FormItem>
</template>
