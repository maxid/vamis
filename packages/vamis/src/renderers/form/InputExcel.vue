<script setup lang="ts">
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { Input } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()

function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !props.schema.name) return
  form?.setValue(props.schema.name, { name: file.name, size: file.size, type: file.type })
}
</script>

<template>
  <FormItem :schema="schema">
    <Input type="file" accept=".xlsx,.xls,.csv" :disabled="disabled" @change="onFile" />
  </FormItem>
</template>
