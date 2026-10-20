<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const language = computed(() => {
  const type = String(props.schema.type || '')
  if (type.endsWith('-editor') && type !== 'editor') return type.replace(/-editor$/, '')
  return String(props.schema.language || 'plaintext')
})
const value = computed({
  get: () => (props.schema.name ? form?.getValue(props.schema.name) : '') ?? '',
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{{ language }}</div>
    <Textarea
      v-model="value"
      :placeholder="schema.placeholder || '输入代码（精简编辑器，未引入 Monaco）'"
      :disabled="disabled"
      class="min-h-40 w-full font-mono text-sm"
    />
    <p class="mt-1 text-xs text-muted-foreground">精简实现：等宽文本框，不加载 Monaco Editor。</p>
  </FormItem>
</template>
