<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const kind = computed(() => props.schema.shapeType || props.schema.shape || 'square')
</script>

<template>
  <svg :width="schema.width || 48" :height="schema.height || 48" class="text-primary" viewBox="0 0 48 48">
    <circle v-if="kind === 'circle'" cx="24" cy="24" r="20" fill="currentColor" />
    <polygon v-else-if="kind === 'triangle'" points="24,4 44,44 4,44" fill="currentColor" />
    <rect v-else x="4" y="4" width="40" height="40" rx="4" fill="currentColor" />
  </svg>
</template>
