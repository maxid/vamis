<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const items = computed(() =>
  asArray(props.schema.body || props.schema.accordions).map((node) => {
    if (node && typeof node === 'object' && !(node as SchemaObject).type) {
      return { ...(node as SchemaObject), type: 'collapse' }
    }
    return node
  }),
)
</script>

<template>
  <div class="space-y-2">
    <SchemaRenderer v-for="(node, i) in items" :key="i" :schema="node" />
  </div>
</template>
