<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import { formatQuarter, parseQuarter, type SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const kind = computed(() => {
  const type = String(props.schema.type || '')
  if (type === 'input-quarter') return 'quarter'
  if (type === 'input-year') return 'year'
  return 'month'
})

const text = computed({
  get: () => String((props.schema.name ? form?.getValue(props.schema.name) : '') ?? ''),
  set: (v) => props.schema.name && form?.setValue(props.schema.name, v),
})

const quarter = computed({
  get: () => parseQuarter(text.value),
  set: (next: { year: string; quarter: string }) => {
    text.value = formatQuarter(next.year, next.quarter)
  },
})
</script>

<template>
  <FormItem :schema="schema">
    <Input
      v-if="kind === 'month'"
      v-model="text"
      type="month"
      :disabled="disabled"
      class="w-full"
    />
    <Input
      v-else-if="kind === 'year'"
      v-model="text"
      type="number"
      min="1900"
      max="2100"
      step="1"
      :placeholder="schema.placeholder || '年份'"
      :disabled="disabled"
      class="w-full"
    />
    <div v-else class="flex items-center gap-2">
      <Input
        :model-value="quarter.year"
        type="number"
        min="1900"
        max="2100"
        step="1"
        placeholder="年"
        :disabled="disabled"
        class="w-28"
        @update:model-value="quarter = { ...quarter, year: String($event) }"
      />
      <select
        class="vamis-native-select flex-1"
        :value="quarter.quarter"
        :disabled="disabled"
        @change="quarter = { ...quarter, quarter: ($event.target as HTMLSelectElement).value }"
      >
        <option value="">季度</option>
        <option value="1">Q1</option>
        <option value="2">Q2</option>
        <option value="3">Q3</option>
        <option value="4">Q4</option>
      </select>
    </div>
  </FormItem>
</template>
