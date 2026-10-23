<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
}>()
const columns = computed(() => asArray(props.schema.columns || props.schema.body))
function colSpan(col: SchemaObject) {
  const explicit = Number(col.md ?? col.span)
  if (Number.isFinite(explicit) && explicit > 0) return Math.min(12, explicit)
  return Math.max(1, Math.floor(12 / Math.max(1, columns.value.length)))
}
function isColumnComponent(col: unknown): col is SchemaObject {
  const type = (col as SchemaObject | undefined)?.type
  return typeof type === 'string' && type !== 'grid-column'
}
function columnNodes(col: unknown) {
  if (isColumnComponent(col)) return [col]
  if (col && typeof col === 'object') {
    const body = (col as SchemaObject).body
    if (body != null) return asArray(body)
  }
  if (col == null) return []
  return asArray(col as SchemaObject['body'])
}
</script>

<template>
  <div class="grid w-full min-w-0 items-stretch gap-3 md:grid-cols-12">
    <div
      v-for="(col, i) in columns"
      :key="i"
      class="flex min-h-0 min-w-0 flex-col"
      :style="{ gridColumn: `span ${colSpan(col as SchemaObject)} / span ${colSpan(col as SchemaObject)}` }"
    >
      <SchemaRenderer
        v-for="(node, j) in columnNodes(col)"
        :key="j"
        :schema="node"
      />
    </div>
  </div>
</template>
