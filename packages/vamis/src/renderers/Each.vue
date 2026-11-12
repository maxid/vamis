<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, resolveValue, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const list = computed(() => {
  let resolved: unknown
  if (props.schema.source != null) resolved = resolveValue(props.schema.source, props.data)
  else if (props.schema.name) resolved = resolveValue(props.schema.name, props.data)
  else resolved = props.schema.value
  let arr: unknown[] = []
  if (Array.isArray(resolved)) arr = resolved
  else if (resolved && typeof resolved === 'object') {
    arr = Object.entries(resolved as Record<string, unknown>).map(([key, value]) => ({ key, value }))
  }
  const maxRaw = props.schema.maxLength
  const max = maxRaw != null && typeof maxRaw === 'string' && maxRaw.includes('$') ? Number(resolveValue(maxRaw, props.data)) : Number(maxRaw)
  return Number.isFinite(max) && max >= 1 ? arr.slice(0, max) : arr
})
const itemSchema = computed(() => props.schema.items || props.schema.body || { type: 'tpl', tpl: '${item}' })
const placeholder = computed(() => {
  const raw = props.schema.placeholder
  return typeof raw === 'string' ? raw : ''
})

function rowData(item: unknown, index: number) {
  const itemKey = String(props.schema.itemKeyName || 'item')
  const indexKey = String(props.schema.indexKeyName || 'index')
  const rec =
    item && typeof item === 'object' && !Array.isArray(item) ? { ...(item as Record<string, unknown>) } : {}
  return {
    ...rec,
    [itemKey]: item,
    [indexKey]: index,
  }
}
</script>

<template>
  <template v-if="list.length">
    <SchemaRenderer
      v-for="(item, i) in list"
      :key="i"
      :schema="itemSchema"
      :extra-data="rowData(item, i)"
    />
  </template>
  <span v-else-if="placeholder" class="text-muted-foreground">{{ placeholder }}</span>
</template>
