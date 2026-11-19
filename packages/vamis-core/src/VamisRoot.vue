<script setup lang="ts">
import { computed, provide, shallowReactive, watch } from 'vue'
import { compileIrToWidget, jsonToIr } from './ir'
import { resolveCssVars } from './style'
import { createDefaultEnv } from './env'
import { getDefaultLocale, makeTranslator, normalizeLocale, type TranslateFn } from './locale'
import { applySchemaLocale, replaceSchemaText } from './utils/schema-locale'
import { themeTokens } from './theme'
import { provideEnv, provideData, provideScope, provideDefinitions, ParentStoreIdKey } from './context'
import { createScope, parseSearch } from './scope'
import { provideScoped } from './scoped'
import { provideOverlay } from './overlay'
import { useRendererHub, createStoreId } from './store/hub'
import SchemaRenderer from './SchemaRenderer.vue'
import type { PlainObject, RendererEnv, SchemaNode, SchemaObject } from './types'

const props = defineProps<{
  schema: unknown
  data?: PlainObject
  locale?: string
  translate?: TranslateFn
  env?: Partial<RendererEnv>
}>()

const currentLocale = computed(() => normalizeLocale(props.locale || props.env?.locale || getDefaultLocale()))
const env = shallowReactive(createDefaultEnv({
  ...(props.env || {}),
  locale: currentLocale.value,
  translate: (str, data) => {
    const translate = props.translate || makeTranslator(currentLocale.value)
    return translate(str, data)
  },
}))
watch(currentLocale, (locale) => {
  env.locale = locale
})
provideEnv(env)

const hub = useRendererHub()
const rootId = createStoreId('root')
const rootStore = hub.add({
  id: rootId,
  type: 'root',
  data: { ...(props.data || {}) },
})
provide(ParentStoreIdKey, rootId)

function rootSeed(): PlainObject {
  const fromQuery = env.parseLocation === false ? {} : parseSearch()
  return {
    ...fromQuery,
    ...(env.initialData || {}),
    ...(props.data || {}),
  }
}

const rootScope = createScope(rootSeed())
watch(
  () => [props.data, env.initialData] as const,
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

const localizedSchema = computed(() => {
  const localized = applySchemaLocale(props.schema, currentLocale.value)
  return replaceSchemaText(localized, env.replaceText, env.replaceTextIgnoreKeys)
})
const ir = computed(() => jsonToIr(localizedSchema.value))
const widget = computed<SchemaNode>(() => compileIrToWidget(ir.value))
const definitions = computed<Record<string, SchemaObject>>(() => {
  const current = widget.value
  if (!current || typeof current !== 'object') return {}
  const source = (current as SchemaObject).definitions
  return source && typeof source === 'object' && !Array.isArray(source) ? source : {}
})
provideDefinitions(definitions)
const density = computed(() => ir.value.metadata.style?.density)
const rootVars = computed(() => resolveCssVars({
  ...themeTokens(env.theme),
  ...(ir.value.metadata.style?.cssVars || {}),
}))
</script>

<template>
  <div
    class="vamis-root w-full text-foreground"
    data-api-version="lcdp.ir/v1"
    :data-density="density"
    :style="rootVars"
  >
    <SchemaRenderer :schema="widget" />
    <slot />
  </div>
</template>
