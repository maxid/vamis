<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@varmis/core'

const props = defineProps<{
  schema: SchemaObject
}>()
const body = computed(() => asArray(props.schema.body))
</script>

<template>
  <div :class="schema.className || 'space-y-3'">
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
</template>
