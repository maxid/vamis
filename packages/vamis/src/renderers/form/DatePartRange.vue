<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import { formatQuarter, parseQuarter, readRangeValue, writeRangeValue, type SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const kind = computed(() => {
  const type = String(props.schema.type || '')
  if (type === 'input-quarter-range') return 'quarter'
  if (type === 'input-year-range') return 'year'
  return 'month'
})
const inputType = computed(() => (kind.value === 'year' ? 'number' : 'month'))

const range = computed({
  get: () => readRangeValue(props.schema.name ? form?.getValue(props.schema.name) : undefined, props.schema.delimiter),
  set: (next) => {
    if (!props.schema.name) return
    form?.setValue(props.schema.name, writeRangeValue(next, props.schema.delimiter))
  },
})

const startQuarter = computed({
  get: () => parseQuarter(range.value.start),
  set: (next: { year: string; quarter: string }) => {
    range.value = { ...range.value, start: formatQuarter(next.year, next.quarter) }
  },
})
const endQuarter = computed({
  get: () => parseQuarter(range.value.end),
  set: (next: { year: string; quarter: string }) => {
    range.value = { ...range.value, end: formatQuarter(next.year, next.quarter) }
  },
})
</script>

<template>
  <FormItem :schema="schema">
    <div v-if="kind === 'quarter'" class="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div class="flex items-center gap-2">
        <Input
          :model-value="startQuarter.year"
          type="number"
          min="1900"
          max="2100"
          placeholder="年"
          :disabled="disabled"
          class="w-24"
          @update:model-value="startQuarter = { ...startQuarter, year: String($event) }"
        />
        <select
          class="h-9 flex-1 rounded-md border bg-transparent px-2 text-sm"
          :value="startQuarter.quarter"
          :disabled="disabled"
          @change="startQuarter = { ...startQuarter, quarter: ($event.target as HTMLSelectElement).value }"
        >
          <option value="">季</option>
          <option value="1">Q1</option>
          <option value="2">Q2</option>
          <option value="3">Q3</option>
          <option value="4">Q4</option>
        </select>
      </div>
      <span class="text-xs text-muted-foreground">至</span>
      <div class="flex items-center gap-2">
        <Input
          :model-value="endQuarter.year"
          type="number"
          min="1900"
          max="2100"
          placeholder="年"
          :disabled="disabled"
          class="w-24"
          @update:model-value="endQuarter = { ...endQuarter, year: String($event) }"
        />
        <select
          class="h-9 flex-1 rounded-md border bg-transparent px-2 text-sm"
          :value="endQuarter.quarter"
          :disabled="disabled"
          @change="endQuarter = { ...endQuarter, quarter: ($event.target as HTMLSelectElement).value }"
        >
          <option value="">季</option>
          <option value="1">Q1</option>
          <option value="2">Q2</option>
          <option value="3">Q3</option>
          <option value="4">Q4</option>
        </select>
      </div>
    </div>
    <div v-else class="flex items-center gap-2">
      <Input
        :model-value="range.start"
        :type="inputType"
        :min="kind === 'year' ? 1900 : undefined"
        :max="kind === 'year' ? 2100 : undefined"
        :disabled="disabled"
        class="w-full"
        @update:model-value="range = { ...range, start: String($event) }"
      />
      <span class="text-xs text-muted-foreground">至</span>
      <Input
        :model-value="range.end"
        :type="inputType"
        :min="kind === 'year' ? 1900 : undefined"
        :max="kind === 'year' ? 2100 : undefined"
        :disabled="disabled"
        class="w-full"
        @update:model-value="range = { ...range, end: String($event) }"
      />
    </div>
  </FormItem>
</template>
