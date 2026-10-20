<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, resolveValue, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const list = computed(() => {
  const resolved = resolveValue(props.schema.source, props.data)
  return Array.isArray(resolved) ? resolved : []
})
const itemSchema = computed(() => props.schema.items || props.schema.body || { type: 'tpl', tpl: '${item}' })

function rowData(item: unknown, index: number) {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return { ...(item as Record<string, unknown>), index }
  }
  return { item, index }
}
</script>

<template>
  <div class="space-y-2">
    <p v-if="!list.length" class="text-xs text-muted-foreground">暂无循环数据</p>
    <SchemaRenderer
      v-for="(item, i) in list"
      :key="i"
      :schema="itemSchema"
      :extra-data="rowData(item, i)"
    />
  </div>
</template>
