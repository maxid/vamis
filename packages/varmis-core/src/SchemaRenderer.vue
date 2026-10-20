<script setup lang="ts">
import { computed } from 'vue'
import { resolveRenderer } from './factory'
import { isDisabled, isVisible } from './formula'
import { provideData, useData, useEnv } from './context'
import { useScoped } from './scoped'
import { useOverlay } from './overlay'
import { useFormApi } from './form-api'
import { runOnEvent } from './actions/run'
import Placeholder from './Placeholder.vue'
import type { SchemaNode, SchemaObject } from './types'

const SELF_CLICK_TYPES = new Set(['action', 'button', 'submit', 'reset'])

const props = defineProps<{
  schema?: SchemaNode | null
  extraData?: Record<string, unknown>
}>()

const parentData = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const form = useFormApi()
const schemaData = computed(() => {
  const schema = props.schema
  if (schema && typeof schema === 'object' && !Array.isArray(schema) && schema.data && typeof schema.data === 'object') {
    return schema.data as Record<string, unknown>
  }
  return {}
})
const data = computed(() => ({ ...parentData.value, ...schemaData.value, ...(props.extraData || {}) }))
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
const wrapClick = computed(() => {
  const schema = normalized.value
  if (!schema?.onEvent?.click) return false
  return !SELF_CLICK_TYPES.has(schema.type || '')
})

async function onHostClick() {
  if (!normalized.value) return
  await runOnEvent(normalized.value, 'click', {
    env,
    data: data.value,
    scoped,
    overlay,
    form,
  })
}
</script>

<template>
  <div v-if="visible && normalized && wrapClick" @click="onHostClick">
    <component
      :is="renderer.component"
      v-if="renderer"
      :schema="normalized"
      :data="data"
      :disabled="disabled"
    />
    <Placeholder v-else :schema="normalized" />
  </div>
  <component
    :is="renderer.component"
    v-else-if="visible && normalized && renderer"
    :schema="normalized"
    :data="data"
    :disabled="disabled"
  />
  <Placeholder
    v-else-if="visible && normalized && !renderer"
    :schema="normalized"
  />
</template>
