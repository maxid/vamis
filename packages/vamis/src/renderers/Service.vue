<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  apiTrackKey,
  createStoreId,
  mergeApiData,
  requestApi,
  useEnv,
  useRendererHub,
  useScoped,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const hub = useRendererHub()
const scoped = useScoped()
const store = hub.add({
  id: createStoreId('service'),
  type: 'service',
  name: props.schema.name,
  data: { ...props.data },
})

const body = computed(() => asArray(props.schema.body || store.data.body))

async function reload() {
  const api = props.schema.api || props.schema.schemaApi
  if (!api) return
  store.fetching = true
  try {
    const result = await requestApi(api, { env, data: { ...props.data, ...store.data }, reason: 'reload' })
    if (!result.skipped && result.ok) mergeApiData(store.data, result)
    else if (!result.skipped && !result.ok) {
      env.notify('error', result.payload.msg || '加载失败')
    }
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '加载失败')
  } finally {
    store.fetching = false
  }
}

const api = {
  name: props.schema.name,
  reload,
  getData: () => ({ ...store.data }),
}
scoped?.register(api)
onMounted(reload)
watch(
  () => apiTrackKey(props.schema.api || props.schema.schemaApi, { ...props.data, ...store.data }),
  (key, prev) => {
    if (prev != null && key && key !== prev) void reload()
  },
)
onBeforeUnmount(() => {
  scoped?.unregister(api)
  hub.remove(store.id)
})
</script>

<template>
  <div class="space-y-3">
    <p v-if="store.fetching" class="text-xs text-muted-foreground">加载中…</p>
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
  </div>
</template>
