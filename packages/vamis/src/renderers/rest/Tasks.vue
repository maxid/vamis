<script setup lang="ts">
import { computed } from 'vue'
import { type SchemaObject } from '@vamis/core'
import { Badge } from '@vamis/ui'
import { readValue } from './format'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const items = computed(() => {
  const raw = readValue(props.schema, props.data) ?? props.schema.items ?? []
  return Array.isArray(raw) ? raw : []
})
</script>

<template>
  <ul class="space-y-2">
    <li v-for="(item, i) in items" :key="i" class="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
      <span>{{ item.label || item.title || item.name }}</span>
      <Badge :variant="item.status === 'fail' ? 'destructive' : item.status === 'success' ? 'default' : 'secondary'">
        {{ item.status || 'pending' }}
      </Badge>
    </li>
  </ul>
</template>
