<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const pair = computed({
  get: () => {
    const raw = props.schema.name ? form?.getValue(props.schema.name) : props.schema.value
    if (raw && typeof raw === 'object') return { lhs: String((raw as any).lhs ?? (raw as any).original ?? ''), rhs: String((raw as any).rhs ?? (raw as any).modified ?? '') }
    return { lhs: String(props.schema.lhs || props.schema.originalValue || ''), rhs: String(raw ?? '') }
  },
  set: (next) => props.schema.name && form?.setValue(props.schema.name, next),
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="grid gap-2 sm:grid-cols-2">
      <Textarea :model-value="pair.lhs" :disabled="disabled" class="min-h-32 font-mono text-xs" @update:model-value="pair = { ...pair, lhs: String($event) }" />
      <Textarea :model-value="pair.rhs" :disabled="disabled" class="min-h-32 font-mono text-xs" @update:model-value="pair = { ...pair, rhs: String($event) }" />
    </div>
    <p class="mt-1 text-xs text-muted-foreground">diff-editor 精简为左右对照文本，未加载 Monaco。</p>
  </FormItem>
</template>
