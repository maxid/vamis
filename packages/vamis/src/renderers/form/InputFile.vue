<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const current = computed(() => props.schema.name ? form?.getValue(props.schema.name) : null)

function onChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!props.schema.name) return
  form?.setValue(props.schema.name, file ? { name: file.name, size: file.size, type: file.type } : null)
}
</script>

<template>
  <FormItem :schema="schema">
    <Input type="file" :accept="schema.accept" :disabled="disabled" :multiple="!!schema.multiple" @change="onChange" />
    <p v-if="current && typeof current === 'object'" class="mt-1 text-xs text-muted-foreground">
      已选 {{ (current as any).name }}（本地文件，未上传）
    </p>
  </FormItem>
</template>
