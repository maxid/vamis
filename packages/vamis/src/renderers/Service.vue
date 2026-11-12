<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  evalExpression,
  runOnEvent,
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
import Spinner from './Spinner.vue'

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
let pollTimer: ReturnType<typeof setInterval> | undefined
const firedInit = ref(false)

async function emitServiceEvent(eventName: string, extra: Record<string, unknown> = {}) {
  await runOnEvent(props.schema, eventName, {
    env,
    data: { ...props.data, ...store.data, ...extra },
    scoped,
  })
}

const body = computed(() => {
  if (remoteSchema.value.length) return remoteSchema.value
  return asArray(props.schema.body || store.data.body)
})
const spinnerSchema = computed<SchemaObject>(() => ({
  type: 'spinner',
  show: store.fetching,
  overlay: true,
  size: 'lg',
  loadingConfig: props.schema.loadingConfig,
}))

async function fetchOne(api: SchemaApi | undefined, reason: 'init' | 'reload', silent = false) {
  if (!api) return null
  if (!silent) store.fetching = true
  try {
    const result = await requestApi(api, {
      env,
      data: { ...props.data, ...store.data },
      reason,
    })
    if (!result.skipped && !result.ok && props.schema.showErrorMsg !== false) {
      env.notify('error', result.payload.msg || '加载失败')
    } else if (!result.skipped && result.ok) {
      const messages = props.schema.messages
      const success = messages && typeof messages === 'object' ? (messages as Record<string, unknown>).fetchSuccess : undefined
      if (typeof success === 'string' && success) env.notify('success', success)
    }
    return result
  } catch (error) {
    if (props.schema.showErrorMsg !== false) env.notify('error', error instanceof Error ? error.message : '加载失败')
    return null
  } finally {
    if (!silent) store.fetching = false
  }
}

function shouldStopPolling(): boolean {
  const expr = props.schema.stopAutoRefreshWhen
  if (typeof expr !== 'string' || !expr) return false
  try {
    return !!evalExpression(expr, { ...props.data, ...store.data })
  } catch {
    return false
  }
}

function stopPolling() {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = undefined
}

function startPolling() {
  stopPolling()
  const interval = Number(props.schema.interval)
  if (!Number.isFinite(interval) || interval < 1000) return
  pollTimer = setInterval(() => {
    if (shouldStopPolling()) {
      stopPolling()
      return
    }
    void reload(undefined, false, props.schema.silentPolling === true)
  }, interval)
}

async function reload(extra?: Record<string, any>, replace = false, silent = false) {
  if (extra && typeof extra === 'object') {
    if (replace) {
      for (const key of Object.keys(store.data)) delete store.data[key]
    }
    Object.assign(store.data, extra)
  }
  if (props.schema.api) {
    const result = await fetchOne(props.schema.api, 'reload', silent)
    if (result && !result.skipped) {
      if (result.ok) {
        mergeApiData(store.data, result)
        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          scope.value?.merge(result.data as Record<string, unknown>, result.replaceData ? 'override' : 'merge', 'api')
        }
      }
      void emitServiceEvent('fetchInited', {
        responseData: result.data,
        responseStatus: result.payload?.status,
        responseMsg: result.payload?.msg,
        error: !result.ok,
      })
    }
  }
  if (props.schema.schemaApi) {
    const result = await fetchOne(props.schema.schemaApi, 'reload', silent)
    if (result && !result.skipped) {
      if (result.ok) remoteSchema.value = serviceRemoteSchema(result.data)
      void emitServiceEvent('fetchSchemaInited', {
        responseData: result.data,
        responseStatus: result.payload?.status,
        responseMsg: result.payload?.msg,
        error: !result.ok,
      })
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
onMounted(async () => {
  if (!firedInit.value) {
    firedInit.value = true
    await emitServiceEvent('init')
  }
  if (props.schema.initFetch !== false) await reload()
  startPolling()
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
watch(
  () => [props.schema.interval, props.schema.stopAutoRefreshWhen] as const,
  () => startPolling(),
)
onBeforeUnmount(stopPolling)
onBeforeUnmount(() => {
  scoped?.unregister(api)
  hub.remove(store.id)
})
</script>

<template>
  <div data-vamis-service class="relative w-full min-w-0 space-y-3">
    <Spinner :schema="spinnerSchema" />
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
  </div>
</template>
