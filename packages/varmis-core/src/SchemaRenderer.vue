<script setup lang="ts">
import { computed } from 'vue'
import { resolveRenderer } from './factory'
import { isDisabled, isVisible } from './formula'
import { provideData, useData } from './context'
import Placeholder from './Placeholder.vue'
import type { SchemaNode, SchemaObject } from './types'

const props = defineProps<{
  schema?: SchemaNode | null
  extraData?: Record<string, unknown>
}>()

const parentData = useData()
const data = computed(() => ({ ...parentData.value, ...(props.extraData || {}) }))
provideData(data)

const normalized = computed<SchemaObject | null>(() => {
  const schema = props.schema
  if (schema == null || schema === false) return null
  if (typeof schema === 'string') return { type: 'tpl', tpl: schema }
  if (typeof schema !== 'object') return { type: 'tpl', tpl: String(schema) }
  return schema as SchemaObject
})

const visible = computed(() => (normalized.value ? isVisible(normalized.value, data.value) : false))
const disabled = computed(() =>
  normalized.value ? isDisabled(normalized.value, data.value) : false,
)
const renderer = computed(() => resolveRenderer(normalized.value?.type))
</script>

<template>
  <component
    :is="renderer.component"
    v-if="visible && normalized && renderer"
    :schema="normalized"
    :data="data"
    :disabled="disabled"
  />
  <Placeholder
    v-else-if="visible && normalized && !renderer"
    :schema="normalized"
  />
</template>
