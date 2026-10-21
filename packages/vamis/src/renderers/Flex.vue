<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
}>()
const items = computed(() => asArray(props.schema.items || props.schema.body))
const justify = computed(() => {
  const map: Record<string, string> = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
  }
  return map[props.schema.justify] || 'justify-start'
})
</script>

<template>
  <div class="flex w-full min-w-0 flex-wrap gap-3" :class="[justify, schema.direction === 'column' ? 'flex-col' : 'flex-row']">
    <SchemaRenderer v-for="(node, i) in items" :key="i" :schema="node" />
  </div>
</template>
