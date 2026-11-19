<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  SchemaRenderer,
  applySchemaLocale,
  asArray,
  evalExpression,
  runOnEvent,
  createStoreId,
  filterTpl,
  isApiOutdated,
  requestApi,
  replaceSchemaText,
  serviceRemoteSchema,
  useEnv,
  useFormApi,
  useRendererHub,
  useScope,
  useScoped,
  type PlainObject,
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
const formApi = useFormApi()
const store = hub.add({
  id: createStoreId('service'),
  type: 'service',
  name: props.schema.name,
  data: {
    ...((props.schema.data && typeof props.schema.data === 'object' ? props.schema.data : {}) as Record<string, any>),
  },
})
const remoteSchemaRaw = ref<SchemaNode[]>([])
const remoteSchema = computed(() => replaceSchemaText(
  applySchemaLocale(remoteSchemaRaw.value, env.locale),
  env.replaceText,
  env.replaceTextIgnoreKeys,
))
const errorKey = ref(0)
let pollTimer: ReturnType<typeof setInterval> | undefined
const firedInit = ref(false)

/** 对齐 Amis hasRemoteData 同步：本域在前，父域/表单后写，避免上次接口的 `tpl` 盖住联动字段。 */
function layerData(extra: Record<string, unknown> = {}): PlainObject {
  return { ...store.data, ...props.data, ...extra }
}

async function emitServiceEvent(eventName: string, extra: Record<string, unknown> = {}) {
  await runOnEvent(props.schema, eventName, {
    env,
    data: layerData(extra),
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
const errorAlert = computed<SchemaObject | null>(() => {
  const msg = store.error
  if (!msg || props.schema.showErrorMsg === false) return null
  return {
    type: 'alert',
    level: 'danger',
    showCloseButton: true,
    body: msg,
  }
})

function failMessage(fallback?: string) {
  const messages = props.schema.messages
  const failed =
    messages && typeof messages === 'object' ? (messages as Record<string, unknown>).fetchFailed : undefined
  if (typeof failed === 'string' && failed) return failed
  return fallback || '初始化失败'
}

function setError(msg: string) {
  store.error = msg
  errorKey.value += 1
}

function clearError() {
  store.error = ''
}

function applyFetchedData(data: unknown, replace = false) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return
  const rec = data as Record<string, unknown>
  if (replace) {
    for (const key of Object.keys(store.data)) delete store.data[key]
    Object.assign(store.data, rec)
  } else {
    Object.assign(store.data, rec)
  }
  scope.value?.merge(rec, replace ? 'override' : 'merge', 'api')
  formApi?.setData?.(rec as PlainObject, replace, 'api')
}

function applySchemaResult(data: unknown) {
  remoteSchemaRaw.value = serviceRemoteSchema(data)
  if (!data || typeof data !== 'object' || Array.isArray(data)) return
  const nested = (data as Record<string, unknown>).data
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    applyFetchedData(nested)
  }
}

async function fetchOne(api: SchemaApi | undefined, reason: 'init' | 'reload', silent = false) {
  if (!api) return null
  if (!silent) store.fetching = true
  try {
    const result = await requestApi(api, {
      env,
      data: layerData(),
      reason,
    })
    if (!result.skipped && !result.ok) {
      const msg = result.payload.msg || failMessage('加载失败')
      setError(msg)
      env.notify('error', msg)
    } else if (!result.skipped && result.ok) {
      clearError()
      const messages = props.schema.messages
      const success =
        messages && typeof messages === 'object' ? (messages as Record<string, unknown>).fetchSuccess : undefined
      if (typeof success === 'string' && success) env.notify('success', success)
    }
    return result
  } catch (error) {
    const msg = failMessage(error instanceof Error ? error.message : '加载失败')
    setError(msg)
    env.notify('error', msg)
    return null
  } finally {
    if (!silent) store.fetching = false
  }
}

function shouldStopPolling(): boolean {
  const expr = props.schema.stopAutoRefreshWhen
  if (typeof expr !== 'string' || !expr) return false
  try {
    return !!evalExpression(expr, layerData())
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

function setData(values: PlainObject, replace = false) {
  if (replace) {
    for (const key of Object.keys(store.data)) delete store.data[key]
  }
  Object.assign(store.data, values)
  scope.value?.merge(values, replace ? 'override' : 'merge', 'action')
}

async function reload(extra?: Record<string, any>, replace = false, silent = false, flags?: { api?: boolean; schema?: boolean }) {
  if (extra && typeof extra === 'object') setData(extra, replace)
  const loadApi = flags?.api !== false && props.schema.api
  const loadSchema = flags?.schema !== false && props.schema.schemaApi
  if (loadApi) {
    const result = await fetchOne(props.schema.api, 'reload', silent)
    if (result && !result.skipped) {
      if (result.ok) applyFetchedData(result.data, result.replaceData)
      void emitServiceEvent('fetchInited', {
        responseData: result.data,
        responseStatus: result.payload?.status,
        responseMsg: result.payload?.msg,
        error: !result.ok,
      })
    }
  }
  if (loadSchema) {
    const result = await fetchOne(props.schema.schemaApi, 'reload', silent)
    if (result && !result.skipped) {
      if (result.ok) applySchemaResult(result.data)
      void emitServiceEvent('fetchSchemaInited', {
        responseData: result.data,
        responseStatus: result.payload?.status,
        responseMsg: result.payload?.msg,
        error: !result.ok,
      })
    }
  }
}

async function rebuild(args?: PlainObject) {
  if (args && typeof args === 'object') setData(args)
  stopPolling()
  if (props.schema.schemaApi) {
    const result = await fetchOne(props.schema.schemaApi, 'reload')
    if (result && !result.skipped) {
      if (result.ok) applySchemaResult(result.data)
      void emitServiceEvent('fetchSchemaInited', {
        responseData: result.data,
        responseStatus: result.payload?.status,
        responseMsg: result.payload?.msg,
        error: !result.ok,
      })
    }
  }
  startPolling()
}

async function doAction(action: unknown, _ctx?: PlainObject) {
  const rec = action && typeof action === 'object' ? (action as Record<string, unknown>) : {}
  const type = String(rec.actionType || '')
  if (type === 'rebuild') {
    const args = rec.args && typeof rec.args === 'object' && !Array.isArray(rec.args) ? (rec.args as PlainObject) : {}
    await rebuild(args)
    return
  }
  if (type === 'reload') {
    const extra = rec.data && typeof rec.data === 'object' && !Array.isArray(rec.data) ? (rec.data as PlainObject) : undefined
    await reload(extra, rec.dataMergeMode === 'override')
  }
}

const api = {
  get name() {
    return filterTpl(String(props.schema.name || props.schema.id || ''), layerData())
  },
  get id() {
    const id = props.schema.id
    return id != null && id !== '' ? String(id) : undefined
  },
  reload,
  getData: () => ({ ...store.data }),
  setData,
  doAction,
}
scoped?.register(api)
onMounted(async () => {
  if (!firedInit.value) {
    firedInit.value = true
    await emitServiceEvent('init')
  }
  const loadApi = props.schema.initFetch !== false
  const loadSchema = props.schema.initFetchSchema !== false
  if (loadApi || loadSchema) await reload(undefined, false, false, { api: loadApi, schema: loadSchema })
  startPolling()
})
watch(
  () => [props.schema.api, props.schema.schemaApi, props.data] as const,
  (curr, prev) => {
    if (!prev) return
    const prevData = prev[2] || {}
    const currData = curr[2] || {}
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
  <div data-vamis-service>
    <SchemaRenderer v-if="errorAlert" :key="errorKey" :schema="errorAlert" />
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
    <Spinner :schema="spinnerSchema" />
  </div>
</template>
