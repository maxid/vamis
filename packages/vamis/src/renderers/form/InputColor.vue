<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const presets = computed(() =>
  Array.isArray(props.schema.presetColors)
    ? props.schema.presetColors.map((item: any) => (typeof item === 'string' ? item : String(item.color || item.value || '')))
    : ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#111827'],
)

const value = computed({
  get: () => String((props.schema.name ? form?.getValue(props.schema.name) : '') || '#000000'),
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex items-center gap-2">
      <input
        :value="value"
        type="color"
        class="h-[var(--control-h)] w-12 cursor-pointer rounded-md border bg-card p-1"
        :disabled="disabled"
        @input="value = ($event.target as HTMLInputElement).value"
      />
      <Input v-model="value" :disabled="disabled" class="w-32 font-mono" :placeholder="schema.placeholder || '#000000'" />
    </div>
    <div class="mt-2 flex flex-wrap gap-1">
      <button
        v-for="color in presets"
        :key="color"
        type="button"
        class="h-5 w-5 rounded-full border"
        :style="{ background: color }"
        :disabled="disabled"
        :title="color"
        @click="value = color"
      />
    </div>
  </FormItem>
</template>
