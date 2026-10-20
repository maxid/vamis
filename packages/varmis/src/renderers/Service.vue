<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createStoreId,
  normalizeApi,
  useEnv,
  useRendererHub,
  useScoped,
  type SchemaObject,
} from '@varmis/core'

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
    const payload = await env.fetcher(normalizeApi(api, props.data), props.data)
    Object.assign(store.data, payload.data || {})
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
