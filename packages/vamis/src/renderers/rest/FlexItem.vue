<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body || props.schema.items))
</script>

<template>
  <div :style="{ flex: schema.flex || schema.grow || '1 1 auto' }">
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
</template>
