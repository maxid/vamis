<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, flexItemStyle, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body || props.schema.items))
const itemStyle = computed(() => flexItemStyle(props.schema))
</script>

<template>
  <div :style="itemStyle">
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
</template>
