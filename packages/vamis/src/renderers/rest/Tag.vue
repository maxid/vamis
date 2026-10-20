<script setup lang="ts">
import { computed } from 'vue'
import { type SchemaObject } from '@vamis/core'
import { Badge } from '@vamis/ui'
import { readValue } from './format'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const items = computed(() => {
  const raw = readValue(props.schema, props.data)
  const list = Array.isArray(raw) ? raw : raw == null || raw === '' ? props.schema.tags || [] : [raw]
  return list.map((item: any) => (typeof item === 'object' ? item.label || item.value : String(item)))
})
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <Badge v-for="(item, i) in items" :key="item + i" variant="secondary">{{ item }}</Badge>
    <span v-if="!items.length" class="text-xs text-muted-foreground">-</span>
  </div>
</template>
