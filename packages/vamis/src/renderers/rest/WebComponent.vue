<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { SchemaRenderer, asArray, webComponentBody, webComponentProps, webComponentTag, type SchemaObject } from '@vamis/core'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ schema: SchemaObject; data: Record<string, unknown> }>()
const tag = computed(() => webComponentTag(props.schema))
const attrs = computed(() => {
  const raw = webComponentProps(props.schema, props.data)
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (value == null || value === false) continue
    out[key] = value === true ? '' : String(value)
  }
  return out
})
const nodes = computed(() => asArray(webComponentBody(props.schema)))
const root = ref<Element | null>(null)

watchEffect(() => {
  const el = root.value
  if (!el) return
  for (const [key, value] of Object.entries(attrs.value)) {
    el.setAttribute(key, value)
  }
})
</script>

<template>
  <component :is="tag" ref="root">
    <SchemaRenderer v-for="(node, i) in nodes" :key="i" :schema="node" />
  </component>
</template>
