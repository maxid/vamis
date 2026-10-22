<script setup lang="ts">
import { computed, provide, watch } from 'vue'
import { compileIrToWidget, jsonToIr } from './ir'
import { resolveCssVars } from './style'
import { createDefaultEnv } from './env'
import { provideEnv, provideData, provideScope, ParentStoreIdKey } from './context'
import { createScope, parseSearch } from './scope'
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

function rootSeed(): PlainObject {
  return {
    ...parseSearch(),
    ...(env.value.initialData || {}),
    ...(props.data || {}),
  }
}

const rootScope = createScope(rootSeed())
watch(
  () => [props.data, env.value.initialData] as const,
  () => {
    rootScope.merge(rootSeed(), 'override')
  },
  { deep: true },
)
const data = computed(() => rootScope.resolved())
provideScope(rootScope)
provideData(data)
const scoped = provideScoped()
provideOverlay()

defineExpose({ scoped })

const ir = computed(() => jsonToIr(props.schema))
const widget = computed<SchemaNode>(() => compileIrToWidget(ir.value))
const density = computed(() => ir.value.metadata.style?.density)
const rootVars = computed(() => resolveCssVars(ir.value.metadata.style?.cssVars))
</script>

<template>
  <div
    class="vamis-root w-full text-sm text-foreground"
    data-api-version="lcdp.ir/v1"
    :data-density="density"
    :style="rootVars"
  >
    <SchemaRenderer :schema="widget" />
    <slot />
  </div>
</template>
