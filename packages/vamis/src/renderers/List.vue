<script setup lang="ts">
import { computed } from 'vue'
import { asArray, filterTpl, type SchemaObject } from '@vamis/core'

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
const item = computed(() => (props.schema.listItem || {}) as SchemaObject)
</script>

<template>
  <ul class="divide-y rounded-md border">
    <li v-for="(row, i) in rows" :key="i" class="px-3 py-2">
      <p class="text-sm font-medium">{{ filterTpl(item.title || '${title}', row) }}</p>
      <p v-if="item.subTitle || item.desc" class="text-xs text-muted-foreground">
        {{ filterTpl(item.subTitle || item.desc, row) }}
      </p>
    </li>
    <li v-if="!rows.length" class="px-3 py-6 text-center text-xs text-muted-foreground">
      {{ schema.placeholder || '暂无列表数据' }}
    </li>
  </ul>
</template>
