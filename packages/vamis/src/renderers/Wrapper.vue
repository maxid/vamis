<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  resolveClassName,
  resolveInlineStyle,
  useData,
  wrapperBody,
  wrapperPaddingToken,
  wrapperSize,
  wrapperWrap,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const body = computed(() => wrapperBody(props.schema))
const wrap = computed(() => wrapperWrap(props.schema))
const size = computed(() => wrapperSize(props.schema))
const pad = computed(() => wrapperPaddingToken(props.schema))
const innerStyle = computed(() => ({
  ...(pad.value ? { padding: pad.value } : undefined),
  ...resolveInlineStyle(props.schema.style, data.value),
}))
const innerClass = computed(() => resolveClassName(props.schema.innerClassName, data.value))
</script>

<template>
  <div v-if="wrap" data-vamis-wrapper :data-size="size" :class="innerClass" :style="innerStyle">
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
  <template v-else>
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </template>
</template>
