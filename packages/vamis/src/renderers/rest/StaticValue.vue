<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { Badge } from '@vamis/ui'
import { defaultDatePattern, formatDate, readValue } from './format'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const type = computed(() => props.schema.type || 'date')
const raw = computed(() => readValue(props.schema, props.data))

const text = computed(() => {
  const value = raw.value
  if (type.value === 'password') {
    const str = value == null ? '' : String(value)
    return str ? '•'.repeat(Math.min(str.length, 8)) : ''
  }
  if (type.value === 'number') {
    const num = Number(value)
    if (!Number.isFinite(num)) return value == null ? '' : String(value)
    const kilobit = props.schema.kilobitSeparator !== false
    return kilobit ? num.toLocaleString() : String(num)
  }
  if (type.value === 'multiline-text') {
    return filterTpl(value ?? props.schema.tpl ?? '', props.data)
  }
  if (type.value === 'date-range') {
    const start = Array.isArray(value) ? value[0] : (value as any)?.start || (value as any)?.from
    const end = Array.isArray(value) ? value[1] : (value as any)?.end || (value as any)?.to
    const pattern = props.schema.format || 'YYYY-MM-DD'
    return [formatDate(start, pattern), formatDate(end, pattern)].filter(Boolean).join(' ~ ')
  }
  if (['date', 'datetime', 'time', 'month'].includes(type.value)) {
    return formatDate(value, props.schema.format || defaultDatePattern(type.value))
  }
  return value == null ? '' : String(value)
})
</script>

<template>
  <span v-if="type === 'color'" class="inline-flex items-center gap-2 text-sm">
    <span class="size-4 rounded-sm border" :style="{ background: String(raw || '#000') }" />
    {{ raw }}
  </span>
  <pre v-else-if="type === 'multiline-text'" class="whitespace-pre-wrap text-sm">{{ text }}</pre>
  <Badge v-else-if="type === 'password'" variant="secondary">{{ text || '未设置' }}</Badge>
  <span v-else class="text-sm">{{ text }}</span>
</template>
