<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const raw = computed(() => props.schema.value ?? props.data?.[props.schema.name || ''])
const view = computed(() => {
  const value = raw.value
  if (value === true || value === 1 || value === '1' || value === 'success' || value === 'online') {
    return { label: '成功', variant: 'success' as const }
  }
  if (value === false || value === 0 || value === '0' || value === 'fail' || value === 'offline') {
    return { label: '失败', variant: 'destructive' as const }
  }
  if (value === 'pending' || value === 'warning') {
    return { label: value === 'warning' ? '警告' : '待处理', variant: 'warning' as const }
  }
  if (value === 'running' || value === 'info') {
    return { label: value === 'info' ? '信息' : '进行中', variant: 'info' as const }
  }
  return { label: value == null ? '-' : String(value), variant: 'outline' as const }
})
</script>

<template>
  <Badge :variant="view.variant">{{ view.label }}</Badge>
</template>
