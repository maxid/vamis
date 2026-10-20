<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, isVisible, type SchemaObject } from '@vamis/core'
import { layoutNodes } from './utils'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const active = computed(() => {
  const items = asArray(props.schema.items) as SchemaObject[]
  return items.find((item) => isVisible(item, props.data))
})
</script>

<template>
  <div :class="schema.className" :style="schema.style">
    <template v-if="active">
      <SchemaRenderer v-for="(node, i) in layoutNodes(active)" :key="i" :schema="node" />
    </template>
  </div>
</template>
