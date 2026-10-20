<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any>; items?: Record<string, any>[] }>()
const rows = computed(() => {
  if (Array.isArray(props.items)) return props.items
  const source = props.schema.source
  if (typeof source === 'string' && source.includes('$')) {
    const key = source.replace(/^\$\{?|\}$/g, '')
    return Array.isArray(props.data?.[key]) ? props.data[key] : []
  }
  if (Array.isArray(props.data?.items)) return props.data.items
  if (Array.isArray(props.data?.rows)) return props.data.rows
  return asArray(props.schema.data || props.schema.items)
})
const card = computed(() => (props.schema.card || { body: [{ type: 'tpl', tpl: '${name}' }] }) as SchemaObject)
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <SchemaRenderer
      v-for="(row, i) in rows"
      :key="i"
      :schema="{ type: 'card', ...card }"
      :extra-data="row"
    />
    <p v-if="!rows.length" class="text-xs text-muted-foreground">暂无卡片数据</p>
  </div>
</template>
