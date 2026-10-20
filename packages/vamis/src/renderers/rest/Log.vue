<script setup lang="ts">
import { computed } from 'vue'
import { type SchemaObject } from '@vamis/core'
import { ScrollArea } from '@vamis/ui'
import { readValue } from './format'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const lines = computed(() => {
  const raw = readValue(props.schema, props.data) ?? props.schema.source
  if (Array.isArray(raw)) return raw.map((item) => String(item))
  return String(raw ?? '').split('\n').filter(Boolean)
})
</script>

<template>
  <ScrollArea class="h-40 rounded-md border bg-muted/30 p-2 font-mono text-xs">
    <div v-for="(line, i) in lines" :key="i">{{ line }}</div>
    <div v-if="!lines.length" class="text-muted-foreground">暂无日志</div>
  </ScrollArea>
</template>
