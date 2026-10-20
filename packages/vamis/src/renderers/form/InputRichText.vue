<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const value = computed({
  get: () => (props.schema.name ? form?.getValue(props.schema.name) : '') ?? '',
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})
</script>

<template>
  <FormItem :schema="schema">
    <Textarea
      v-model="value"
      :placeholder="schema.placeholder || '输入 HTML / 纯文本（精简富文本，未引入 TinyMCE）'"
      :disabled="disabled"
      class="min-h-32 w-full font-mono text-sm"
    />
    <p class="mt-1 text-xs text-muted-foreground">精简实现：多行文本，不加载 TinyMCE / Froala。</p>
  </FormItem>
</template>
