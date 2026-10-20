<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const buttons = computed(() => asArray(props.schema.buttons || props.schema.body))
</script>

<template>
  <div class="flex flex-wrap items-center gap-1 rounded-md border bg-muted/40 p-1">
    <SchemaRenderer v-for="(node, i) in buttons" :key="i" :schema="node" />
  </div>
</template>
