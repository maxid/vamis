<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  wrapperBody,
  wrapperPaddingToken,
  wrapperSize,
  wrapperWrap,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => wrapperBody(props.schema))
const wrap = computed(() => wrapperWrap(props.schema))
const size = computed(() => wrapperSize(props.schema))
const pad = computed(() => wrapperPaddingToken(props.schema))
const padStyle = computed(() => (pad.value ? { padding: pad.value } : undefined))
</script>

<template>
  <div v-if="wrap" data-vamis-wrapper :data-size="size" :style="padStyle">
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
  <template v-else>
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </template>
</template>

<style scoped>
[data-vamis-wrapper] {
  width: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
}
</style>
