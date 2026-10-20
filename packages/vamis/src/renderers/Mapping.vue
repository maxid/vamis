<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@vamis/ui'
import { filterTpl, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

function strip(html: string) {
  return html.replace(/<[^>]+>/g, '').trim()
}

const label = computed(() => {
  const value = props.schema.value ?? props.data?.[props.schema.name || '']
  const map = (props.schema.map || props.schema.mapping || {}) as Record<string, string>
  const key = value == null ? '' : String(value)
  const matched = map[key] ?? map['*']
  if (matched == null) return key
  return strip(filterTpl(matched, { ...props.data, [props.schema.name || 'value']: value, value }))
})
</script>

<template>
  <Badge variant="secondary">{{ label || '-' }}</Badge>
</template>
