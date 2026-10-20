<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const value = computed(() => {
  const raw = props.schema.value ?? props.data?.[props.schema.name || ''] ?? 0
  const num = Number(raw)
  return Number.isFinite(num) ? Math.min(100, Math.max(0, num)) : 0
})
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="h-2 flex-1 overflow-hidden rounded-full bg-muted">
      <div class="h-full bg-primary" :style="{ width: `${value}%` }" />
    </div>
    <span v-if="schema.showLabel !== false" class="w-10 text-right text-xs text-muted-foreground">{{ value }}%</span>
  </div>
</template>
