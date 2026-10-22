<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body))
</script>

<template>
  <div v-if="schema.html" class="vamis-html" v-html="schema.html" />
  <div v-else class="space-y-2">
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
</template>
