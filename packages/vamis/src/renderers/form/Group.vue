<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body || props.schema.controls))
const vertical = computed(() => props.schema.direction === 'vertical')
</script>

<template>
  <div
    class="grid gap-3"
    :class="vertical ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'"
  >
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
</template>
