<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import {
  SchemaRenderer,
  LazyComponent,
  apiMessage,
  applyFormItemDefaults,
  applyServerErrors,
  asArray,
  autoFillApi,
  autoFillMapping,
  autoFillRow,
  clearHiddenFormValues,
  collectFormItems,
  createObject,
  createStoreId,
  dataMapping,
  formItemStatic,
  formItemValidateOnChange,
  getPathValue,
  isApiOutdated,
  isEffectiveApi,
  isVisible,
  mergeApiData,
  provideFormApi,
  requestApi,
  resolveClassName,
  runOnEvent,
  setPathValue,
  validateApiMessage,
  useEnv,
  useOverlay,
  useRendererHub,
  useScope,
  useScoped,
  provideScoped,
  validateValue,
  type ChangeReason,
  type SchemaObject,
} from '@vamis/core'
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, cn } from '@vamis/ui'
import { provideForm, useForm } from '../formContext'
import { registerWizardValidate } from '../wizardGate'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const hub = useRendererHub()
const parentScoped = useScoped()
const scoped = provideScoped(parentScoped)
const overlay = useOverlay()
const scope = useScope()
const store = hub.add({
  id: createStoreId('form'),
  type: 'form',
  name: props.schema.name,
  data: applyFormItemDefaults(
    collectFormItems(asArray(props.schema.body || props.schema.controls)),
    { ...(props.data || {}), ...(props.schema.data || {}) },
  ),
})

const body = computed(() => asArray(props.schema.body || props.schema.controls))
const actions = computed(() => asArray(props.schema.actions))
const actionsDefined = computed(() => Array.isArray(props.schema.actions))
const hasCustomActions = computed(() => actionsDefined.value && actions.value.length > 0)
const wrapWithPanel = computed(() => props.schema.wrapWithPanel !== false)
function schemaHidesButtons(node: unknown): boolean {
  return !!node && typeof node === 'object' && !Array.isArray(node) && (node as SchemaObject).hideButtons === true
}
const showActionBar = computed(() => {
  if (!wrapWithPanel.value && !actionsDefined.value) return false
  if (actionsDefined.value) return actions.value.length > 0
  const items = body.value.filter((node) => node && typeof node === 'object')
  if (items.length > 0 && items.every(schemaHidesButtons)) return false
  return true
})
const lazyLoad = computed(() => props.schema.lazyLoad === true)
const isInline = computed(() => String(props.schema.mode || '') === 'inline')
const panelTitle = computed(() => {
  const title = props.schema.title
  if (title === false || title === '') return ''
  if (title == null) return wrapWithPanel.value ? '表单' : ''
  return String(title)
})
const showReset = computed(() => props.schema.reset === true)
const panelClass = computed(() =>
  cn(
    'vamis-form-panel w-full min-w-0 mb-[var(--panel-margin-bottom)] overflow-hidden shadow-none',
    resolveClassName(props.schema.panelClassName, props.data),
  ),
)
const headerClass = computed(() =>
  cn('border-b bg-muted', resolveClassName(props.schema.headerClassName, props.data)),
)
const titleClass = computed(() => resolveClassName(props.schema.titleClassName, props.data))
const bodyClass = computed(() =>
  cn(
    isInline.value ? 'flex flex-wrap items-end' : 'space-y-0',
    resolveClassName(props.schema.bodyClassName, props.data),
  ),
)
const actionsClass = computed(() =>
  cn(
    'vamis-form-actions w-full justify-end border-t',
    resolveClassName(props.schema.actionsClassName, props.data),
  ),
)
const debugJson = computed(() => {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(store.data)) {
    if (key.startsWith('__')) continue
    out[key] = value
  }
  return JSON.stringify(out, null, 2)
})
const labelWidthStyle = computed(() => {
  const w = props.schema.labelWidth
  if (w == null || w === '' || w === false) return undefined
  const px = typeof w === 'number' ? `${w}px` : /^\d+(\.\d+)?$/.test(String(w)) ? `${w}px` : String(w)
  return { '--form-label-width': px }
})
const parentForm = useForm()
const wrapTag = computed(() => {
  const raw = props.schema.wrapperComponent
  if (typeof raw === 'string') {
    const name = raw.trim().toLowerCase()
    if (name === 'form' || name === 'div') return name
  }
  return parentForm ? 'div' : 'form'
})
const nativeForm = computed(() => wrapTag.value === 'form')
const submitButtonType = computed(() => (nativeForm.value ? 'submit' : 'button'))

function onNestedEnter(event: KeyboardEvent) {
  if (nativeForm.value) return
  const el = event.target as HTMLElement | null
  if (!el) return
  const tag = el.tagName
  if (tag === 'TEXTAREA' || el.isContentEditable) return
  if (tag !== 'INPUT' && tag !== 'SELECT') return
  event.preventDefault()
  event.stopPropagation()
  void submit()
}

function onDefaultSubmitClick() {
  if (!nativeForm.value) void submit()
}

function formItems() {
  return collectFormItems(body.value)
}

function itemByName(name: string) {
  return formItems().find((item) => item.name === name)
}

function getValue(name: string) {
  return getPathValue(store.data, name)
}

function setValue(name: string, value: unknown) {
  setPathValue(store.data, name, value)
  scope.value?.set(name, value, 'input')
  const item = itemByName(name)
  if (item && formItemValidateOnChange(item, props.schema)) {
    const message = validateValue(item, getPathValue(store.data, name), store.data)
    if (message) store.errors[name] = message
    else {
      delete store.errors[name]
      void runValidateApi(item)
    }
  } else if (store.errors[name]) {
    delete store.errors[name]
  }
  if (item) scheduleAutoFill(item, value)
}

const autoFillTimers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleAutoFill(item: SchemaObject, value: unknown) {
  const name = String(item.name || '')
  if (!name || !autoFillMapping(item)) return
  const prev = autoFillTimers.get(name)
  if (prev) clearTimeout(prev)
  autoFillTimers.set(
    name,
    setTimeout(() => {
      autoFillTimers.delete(name)
      void runAutoFill(item, value)
    }, 250),
  )
}

async function runValidateApi(item: SchemaObject): Promise<boolean> {
  const name = String(item.name || '')
  if (!name || !isEffectiveApi(item.validateApi, store.data)) return true
  const ctx = { ...store.data, [name]: getPathValue(store.data, name) }
  const result = await requestApi(item.validateApi, { env, data: ctx, reason: 'action' })
  if (result.skipped) return true
  if (!result.ok) {
    store.errors[name] = validateApiMessage(result.payload, `表单项「${name}」校验失败`)
    return false
  }
  delete store.errors[name]
  return true
}

async function runAutoFill(item: SchemaObject, value: unknown) {
  const mapping = autoFillMapping(item)
  const name = String(item.name || '')
  if (!mapping || !name) return
  let ctx: Record<string, unknown> = { ...store.data, [name]: value, __term: value }
  const api = autoFillApi(item)
  if (api && isEffectiveApi(api, ctx)) {
    const result = await requestApi(api, { env, data: ctx, reason: 'reload' })
    if (result.skipped || !result.ok) return
    const row = autoFillRow(result.data)
    if (!row) return
    ctx = createObject(store.data, { ...row, items: [row] })
  }
  const filled = dataMapping(mapping, ctx)
  if (!filled || typeof filled !== 'object' || Array.isArray(filled)) return
  for (const [key, next] of Object.entries(filled as Record<string, unknown>)) {
    if (!key || key.startsWith('__')) continue
    setPathValue(store.data, key, next)
    scope.value?.set(key, next, 'input')
  }
}

function setError(name: string, message: string) {
  store.errors[name] = message
}

function validate(): boolean {
  store.errors = {}
  let ok = true
  for (const item of formItems()) {
    if (!item.name) continue
    if (!isVisible(item, store.data)) continue
    const message = validateValue(item, getPathValue(store.data, String(item.name)), store.data)
    if (message) {
      store.errors[String(item.name)] = message
      ok = false
    }
  }
  return ok
}

function reset() {
  store.data = { ...(props.data || {}), ...(props.schema.data || {}) }
  store.errors = {}
}

async function submit() {
  if (!validate()) {
    env.notify('error', '请检查表单')
    return
  }
  let remoteOk = true
  for (const item of formItems()) {
    if (!item.name || !isVisible(item, store.data)) continue
    if (!(await runValidateApi(item))) remoteOk = false
  }
  if (!remoteOk) {
    env.notify('error', '请检查表单')
    return
  }
  const target = typeof props.schema.target === 'string' ? props.schema.target.trim() : ''
  if (target) {
    await scoped.reload(target, store.data)
    await runOnEvent(props.schema, 'submit', {
      env,
      data: { ...props.data, ...store.data },
      scoped,
      overlay,
      form: formApi,
    })
    return
  }
  const api = props.schema.api
  if (!api) {
    if (props.schema.reload) {
      await scoped.reload(props.schema.reload, store.data)
    } else {
      env.notify('success', '已提交（未配置 api）')
    }
    await runOnEvent(props.schema, 'submit', {
      env,
      data: { ...props.data, ...store.data },
      scoped,
      overlay,
      form: formApi,
    })
    return
  }
  store.saving = true
  try {
    const result = await requestApi(api, { env, data: store.data, reason: 'submit' }, {
      defaultMethod: 'post',
      autoAppend: true,
    })
    if (result.skipped) return
    if (!result.ok) {
      applyServerErrors(result.payload.errors, store.errors)
      throw new Error(apiMessage(api, result.payload, 'failed'))
    }
    mergeApiData(store.data, result)
    if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
      scope.value?.merge(result.data as Record<string, unknown>, result.replaceData ? 'override' : 'merge', 'api')
    }
    env.notify('success', apiMessage(api, result.payload, 'success'))
    if (props.schema.reload) {
      await scoped.reload(props.schema.reload, store.data)
    }
    await runOnEvent(props.schema, 'submit', {
      env,
      data: { ...props.data, ...store.data },
      scoped,
      overlay,
      form: formApi,
    })
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '提交失败')
  } finally {
    store.saving = false
  }
}

const formApi = {
  name: String(props.schema.id || props.schema.name || ''),
  context: scoped,
  getValue,
  setValue,
  reset,
  reload: async (extra?: Record<string, any>, replace = false) => {
    if (extra && typeof extra === 'object') {
      if (replace) {
        for (const key of Object.keys(store.data)) delete store.data[key]
      }
      Object.assign(store.data, extra)
    }
    if (!isEffectiveApi(props.schema.initApi, { ...props.data, ...store.data })) return
    store.fetching = true
    try {
      const result = await requestApi(props.schema.initApi, { env, data: { ...props.data, ...store.data }, reason: 'init' })
      if (!result.skipped && result.ok) {
        mergeApiData(store.data, result)
        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          scope.value?.merge(result.data as Record<string, unknown>, result.replaceData ? 'override' : 'merge', 'api')
        }
      } else if (!result.skipped && !result.ok) {
        env.notify('error', apiMessage(props.schema.initApi, result.payload, 'failed'))
      }
    } finally {
      store.fetching = false
    }
  },
  getData: () => ({ ...store.data }),
  setData: (values: Record<string, any>, replace = false, reason: ChangeReason = 'action') => {
    if (replace) {
      for (const key of Object.keys(store.data)) delete store.data[key]
    }
    Object.assign(store.data, values)
    scope.value?.merge(values, replace ? 'override' : 'merge', reason)
  },
  submit,
  validate,
}

provideForm({
  store,
  mode: String(props.schema.mode || 'normal'),
  isStatic: () => formItemStatic(props.schema, { ...props.data, ...store.data }),
  getValue,
  setValue,
  submit,
  reset,
  setError,
})
provideFormApi(formApi)
parentScoped?.register(formApi)
registerWizardValidate(validate)

onMounted(() => {
  if (isEffectiveApi(props.schema.initApi, { ...props.data, ...store.data }, props.schema.initFetch, props.schema.initFetchOn)) {
    void formApi.reload()
  }
})
watch(
  () => store.data,
  () => {
    clearHiddenFormValues(formItems(), store.data)
  },
  { deep: true },
)
watch(
  () => [props.schema.initApi, props.data, store.data] as const,
  (curr, prev) => {
    if (!prev) return
    const prevData = { ...(prev[1] || {}), ...(prev[2] || {}) }
    const currData = { ...(curr[1] || {}), ...(curr[2] || {}) }
    if (isApiOutdated(prev[0], curr[0], prevData, currData)) void formApi.reload()
  },
)
onBeforeUnmount(() => {
  parentScoped?.unregister(formApi)
  hub.remove(store.id)
  for (const timer of autoFillTimers.values()) clearTimeout(timer)
  autoFillTimers.clear()
})
</script>

<template>
  <LazyComponent :default-visible="!lazyLoad">
    <component
      :is="wrapTag"
      class="w-full min-w-0"
      :class="isInline ? 'vamis-form vamis-form--inline' : 'vamis-form'"
      :style="labelWidthStyle"
      @submit.prevent="submit"
      @keydown.enter="onNestedEnter"
    >
      <Card
        v-if="wrapWithPanel"
        :class="panelClass"
      >
        <CardHeader v-if="panelTitle" :class="headerClass">
          <CardTitle :class="titleClass">{{ panelTitle }}</CardTitle>
        </CardHeader>
        <CardContent :class="bodyClass">
          <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
        </CardContent>
        <pre v-if="schema.debug" class="vamis-form-debug">{{ debugJson }}</pre>
        <CardFooter v-if="showActionBar" :class="actionsClass">
          <template v-if="hasCustomActions">
            <SchemaRenderer v-for="(node, i) in actions" :key="'a'+i" :schema="node" :extra-data="store.data" />
          </template>
          <template v-else>
            <Button :type="submitButtonType" :disabled="store.saving" @click="onDefaultSubmitClick">
              {{ store.saving ? '提交中…' : (schema.submitText || '提交') }}
            </Button>
            <Button v-if="showReset" type="button" variant="outline" @click="reset">
              重置
            </Button>
          </template>
        </CardFooter>
      </Card>
      <template v-else>
        <h2 v-if="panelTitle" class="mb-3 text-sm font-medium">{{ panelTitle }}</h2>
        <div :class="bodyClass">
          <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
        </div>
        <pre v-if="schema.debug" class="vamis-form-debug">{{ debugJson }}</pre>
        <div v-if="showActionBar" :class="cn(actionsClass, 'flex gap-2 border-t-0 pt-3')">
          <template v-if="hasCustomActions">
            <SchemaRenderer v-for="(node, i) in actions" :key="'a'+i" :schema="node" :extra-data="store.data" />
          </template>
          <template v-else>
            <Button :type="submitButtonType" :disabled="store.saving" @click="onDefaultSubmitClick">
              {{ store.saving ? '提交中…' : (schema.submitText || '提交') }}
            </Button>
            <Button v-if="showReset" type="button" variant="outline" @click="reset">
              重置
            </Button>
          </template>
        </div>
      </template>
    </component>
  </LazyComponent>
</template>
