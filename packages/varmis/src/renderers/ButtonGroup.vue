<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@varmis/core'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const buttons = computed(() => asArray(props.schema.buttons || props.schema.body))
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <SchemaRenderer v-for="(node, i) in buttons" :key="i" :schema="node" />
  </div>
</template>
