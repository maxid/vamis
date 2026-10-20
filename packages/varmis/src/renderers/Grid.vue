<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@varmis/core'

const props = defineProps<{
  schema: SchemaObject
}>()
const columns = computed(() => asArray(props.schema.columns || props.schema.body))
</script>

<template>
  <div class="grid gap-3 md:grid-cols-12">
    <div
      v-for="(col, i) in columns"
      :key="i"
      class="min-w-0"
      :style="{ gridColumn: `span ${Math.min(12, Number((col as any).md || (col as any).span || 12))} / span ${Math.min(12, Number((col as any).md || (col as any).span || 12))}` }"
    >
      <SchemaRenderer
        v-for="(node, j) in asArray((col as any).body || col)"
        :key="j"
        :schema="typeof col === 'object' && (col as any).type && (col as any).type !== 'grid-column' ? col : node"
      />
    </div>
  </div>
</template>
