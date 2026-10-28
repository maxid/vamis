<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  resolveClassName,
  useData,
  type SchemaObject,
} from '@vamis/core'

const SAFE_WRAPPER_TAGS = new Set([
  'div',
  'section',
  'article',
  'main',
  'header',
  'footer',
  'aside',
  'nav',
  'pre',
  'span',
])

const props = defineProps<{
  schema: SchemaObject
}>()

const data = useData()
const body = computed(() => asArray(props.schema.body))
const tag = computed(() => {
  const raw = props.schema.wrapperComponent
  if (typeof raw !== 'string') return 'div'
  const name = raw.trim().toLowerCase()
  return SAFE_WRAPPER_TAGS.has(name) ? name : 'div'
})
const wrapBody = computed(() => props.schema.wrapperBody !== false)
const flattenSelf = computed(() => tag.value === 'div')
const bodyClass = computed(() => resolveClassName(props.schema.bodyClassName, data.value))
</script>

<template>
  <component
    :is="tag"
    :class="flattenSelf ? undefined : 'w-full min-w-0'"
    :style="flattenSelf ? { display: 'contents' } : undefined"
  >
    <div v-if="wrapBody" class="vamis-container-body" :class="bodyClass">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
    <template v-else>
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </template>
  </component>
</template>
