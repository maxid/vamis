<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, amisEmbedInner, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, unknown> }>()
const inner = computed(() => amisEmbedInner(props.schema, props.data))
</script>

<template>
  <SchemaRenderer v-if="inner" :schema="inner" />
</template>
