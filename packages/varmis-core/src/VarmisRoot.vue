<script setup lang="ts">
import { computed, provide } from 'vue'
import { compileIrToWidget, jsonToIr } from './ir'
import { createDefaultEnv } from './env'
import { provideEnv, provideData, ParentStoreIdKey } from './context'
import { provideScoped } from './scoped'
import { provideOverlay } from './overlay'
import { useRendererHub, createStoreId } from './store/hub'
import SchemaRenderer from './SchemaRenderer.vue'
import type { PlainObject, RendererEnv, SchemaNode } from './types'

const props = defineProps<{
  schema: unknown
  data?: PlainObject
  env?: Partial<RendererEnv>
}>()

const env = computed(() => createDefaultEnv(props.env || {}))
provideEnv(env.value)

const hub = useRendererHub()
const rootId = createStoreId('root')
const rootStore = hub.add({
  id: rootId,
  type: 'root',
  data: { ...(props.data || {}) },
})
provide(ParentStoreIdKey, rootId)

const data = computed(() => ({
  ...rootStore.data,
  ...(props.data || {}),
}))
provideData(data)
provideScoped()
provideOverlay()

const widget = computed<SchemaNode>(() => compileIrToWidget(jsonToIr(props.schema)))
</script>

<template>
  <div class="varmis-root text-sm text-foreground" data-api-version="lcdp.ir/v1">
    <SchemaRenderer :schema="widget" />
    <slot />
  </div>
</template>
