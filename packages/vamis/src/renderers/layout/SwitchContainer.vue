<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  switchContainerActive,
  switchContainerBody,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const body = computed(() => {
  const active = switchContainerActive(props.schema, data.value)
  return active ? switchContainerBody(active) : []
})
</script>

<template>
  <div data-vamis-switch-container class="w-full min-w-0">
    <div v-if="body.length" style="display: inline">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
  </div>
</template>
