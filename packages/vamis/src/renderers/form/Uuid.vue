<script setup lang="ts">
import { onMounted } from 'vue'
import { Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()

onMounted(() => {
  if (!props.schema.name) return
  if (form?.getValue(props.schema.name)) return
  const id = globalThis.crypto?.randomUUID?.() || `id-${Date.now()}`
  form?.setValue(props.schema.name, id)
})
</script>

<template>
  <FormItem v-if="!schema.hidden" :schema="schema">
    <Input :model-value="schema.name ? String(form?.getValue(schema.name) ?? '') : ''" disabled />
  </FormItem>
</template>
