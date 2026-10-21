<script setup lang="ts">
import { computed } from 'vue'
import { Input, Slider } from '@vamis/ui'
import { readRangeValue, type SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const min = computed(() => Number(props.schema.min ?? 0))
const max = computed(() => Number(props.schema.max ?? 100))
const step = computed(() => Number(props.schema.step ?? 1))
const multiple = computed(() => !!props.schema.multiple)

function clamp(raw: unknown) {
  const num = Number(raw)
  if (!Number.isFinite(num)) return min.value
  return Math.min(max.value, Math.max(min.value, num))
}

const single = computed({
  get: () => clamp(props.schema.name ? form?.getValue(props.schema.name) : min.value),
  set: (v: number) => props.schema.name && form?.setValue(props.schema.name, clamp(v)),
})

const range = computed({
  get() {
    const pair = readRangeValue(props.schema.name ? form?.getValue(props.schema.name) : undefined)
    const start = clamp(pair.start || min.value)
    const end = clamp(pair.end || max.value)
    return { start: Math.min(start, end), end: Math.max(start, end) }
  },
  set(next: { start: number; end: number }) {
    if (!props.schema.name) return
    const start = clamp(next.start)
    const end = clamp(next.end)
    if (props.schema.delimiter) {
      form?.setValue(props.schema.name, [start, end].join(String(props.schema.delimiter)))
      return
    }
    form?.setValue(props.schema.name, { min: Math.min(start, end), max: Math.max(start, end) })
  },
})
</script>

<template>
  <FormItem :schema="schema">
    <div v-if="multiple" class="space-y-3">
      <div class="flex items-center gap-3 text-sm">
        <span class="w-10 tabular-nums text-muted-foreground">{{ range.start }}</span>
        <Slider
          :model-value="range.start"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          @update:model-value="range = { ...range, start: $event }"
        />
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span class="w-10 tabular-nums text-muted-foreground">{{ range.end }}</span>
        <Slider
          :model-value="range.end"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          @update:model-value="range = { ...range, end: $event }"
        />
      </div>
      <p class="text-xs text-muted-foreground">{{ range.start }}{{ schema.unit || '' }} ~ {{ range.end }}{{ schema.unit || '' }}</p>
    </div>
    <div v-else class="flex items-center gap-3">
      <Slider
        :model-value="single"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        @update:model-value="single = $event"
      />
      <Input
        :model-value="single"
        type="number"
        class="w-20"
        :disabled="disabled"
        @update:model-value="single = Number($event)"
      />
      <span v-if="schema.unit" class="text-xs text-muted-foreground">{{ schema.unit }}</span>
    </div>
  </FormItem>
</template>
