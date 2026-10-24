<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createStoreId,
  filterTpl,
  isApiOutdated,
  mergeApiData,
  requestApi,
  serviceRemoteSchema,
  useEnv,
  useRendererHub,
  useScope,
  useScoped,
  type SchemaApi,
  type SchemaNode,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const hub = useRendererHub()
const scoped = useScoped()
const scope = useScope()
const store = hub.add({
  id: createStoreId('service'),
  type: 'service',
  name: props.schema.name,
  data: {
    ...((props.schema.data && typeof props.schema.data === 'object' ? props.schema.data : {}) as Record<string, any>),
  },
})
const remoteSchema = ref<SchemaNode[]>([])

const body = computed(() => {
  if (remoteSchema.value.length) return remoteSchema.value
  return asArray(props.schema.body || store.data.body)
})

async function fetchOne(api: SchemaApi | undefined, reason: 'init' | 'reload') {
  if (!api) return null
  store.fetching = true
  try {
    const result = await requestApi(api, {
      env,
      data: { ...props.data, ...store.data },
      reason,
    })
    if (!result.skipped && !result.ok) {
      env.notify('error', result.payload.msg || '加载失败')
    }
    return result
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '加载失败')
    return null
  } finally {
    store.fetching = false
  }
}

async function reload(extra?: Record<string, any>, replace = false) {
  if (extra && typeof extra === 'object') {
    if (replace) {
      for (const key of Object.keys(store.data)) delete store.data[key]
    }
    Object.assign(store.data, extra)
  }
  if (props.schema.api) {
    const result = await fetchOne(props.schema.api, 'reload')
    if (result && !result.skipped && result.ok) {
      mergeApiData(store.data, result)
      if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
        scope.value?.merge(result.data as Record<string, unknown>, result.replaceData ? 'override' : 'merge', 'api')
      }
    }
  }
  if (props.schema.schemaApi) {
    const result = await fetchOne(props.schema.schemaApi, 'reload')
    if (result && !result.skipped && result.ok) {
      remoteSchema.value = serviceRemoteSchema(result.data)
    }
  }
}

const api = {
  get name() {
    return filterTpl(String(props.schema.name || props.schema.id || ''), { ...props.data, ...store.data })
  },
  reload,
  getData: () => ({ ...store.data }),
}
scoped?.register(api)
onMounted(() => {
  if (props.schema.initFetch === false) return
  void reload()
})
watch(
  () => [props.schema.api, props.schema.schemaApi, props.data, store.data] as const,
  (curr, prev) => {
    if (!prev) return
    const prevData = { ...(prev[2] || {}), ...(prev[3] || {}) }
    const currData = { ...(curr[2] || {}), ...(curr[3] || {}) }
    const apiOut = isApiOutdated(prev[0], curr[0], prevData, currData)
    const schemaOut = isApiOutdated(prev[1], curr[1], prevData, currData)
    if (apiOut || schemaOut) void reload()
  },
)
onBeforeUnmount(() => {
  scoped?.unregister(api)
  hub.remove(store.id)
})
</script>

<template>
  <div data-vamis-service class="w-full min-w-0 space-y-3">
    <p v-if="store.fetching" class="text-xs text-muted-foreground">加载中…</p>
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
  </div>
</template>
