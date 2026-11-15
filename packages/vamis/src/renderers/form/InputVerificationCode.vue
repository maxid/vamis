<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useFieldValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fieldApi = useFieldValue()
const length = computed(() => Number(props.schema.length || 6))
const chars = computed({
  get: () => String((props.schema.name ? fieldApi.getValue(props.schema.name) : '') || '').padEnd(length.value, ' ').slice(0, length.value).split(''),
  set: (next: string[]) => props.schema.name && fieldApi.setValue(props.schema.name, next.join('').trim()),
})
function setAt(index: number, char: string) {
  const next = chars.value.slice()
  next[index] = char.replace(/\D/g, '').slice(-1)
  chars.value = next
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex gap-1">
      <Input
        v-for="(ch, i) in chars"
        :key="i"
        class="w-10 text-center"
        maxlength="1"
        :model-value="ch.trim()"
        :disabled="disabled"
        @update:model-value="setAt(i, String($event))"
      />
    </div>
  </FormItem>
</template>
