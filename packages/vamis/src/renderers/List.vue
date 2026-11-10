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
  if (props.schema.name && Array.isArray(props.data?.[props.schema.name])) return props.data[props.schema.name]
  if (Array.isArray(props.data?.items)) return props.data.items
  if (Array.isArray(props.data?.rows)) return props.data.rows
  return asArray(props.schema.list || props.schema.items)
})
const item = computed(() => (props.schema.listItem || { type: 'list-item' }) as SchemaObject)
</script>

<template>
  <div data-vamis-list>
    <div v-if="rows.length" data-vamis-list-items>
      <SchemaRenderer
        v-for="(row, i) in rows"
        :key="i"
        :schema="{ type: 'list-item', ...item }"
        :extra-data="row"
      />
    </div>
    <div v-else class="vamis-list__empty">
      {{ schema.placeholder || '暂无列表数据' }}
    </div>
  </div>
</template>
