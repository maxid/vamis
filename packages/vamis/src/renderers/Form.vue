<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import {
  SchemaRenderer,
  apiMessage,
  apiTrackKey,
  asArray,
  createStoreId,
  mergeApiData,
  provideFormApi,
  requestApi,
  resolveClassName,
  runOnEvent,
  useEnv,
  useOverlay,
  useRendererHub,
  useScope,
  useScoped,
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
const scoped = useScoped()
const overlay = useOverlay()
const scope = useScope()
const store = hub.add({
  id: createStoreId('form'),
  type: 'form',
  name: props.schema.name,
  data: { ...(props.data || {}), ...(props.schema.data || {}) },
})

const body = computed(() => asArray(props.schema.body || props.schema.controls))
const actions = computed(() => asArray(props.schema.actions))
const actionsDefined = computed(() => Array.isArray(props.schema.actions))
const hasCustomActions = computed(() => actionsDefined.value && actions.value.length > 0)
const showActionBar = computed(() => (actionsDefined.value ? actions.value.length > 0 : true))
const wrapWithPanel = computed(() => props.schema.wrapWithPanel !== false)
const panelClass = computed(() =>
  cn(
    'vamis-form-panel w-full min-w-0 mb-[var(--panel-margin-bottom)]',
    resolveClassName(props.schema.panelClassName, props.data),
  ),
)
const isInline = computed(() => String(props.schema.mode || '') === 'inline')
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

function getValue(name: string) {
  return store.data[name]
}

function setValue(name: string, value: unknown) {
  store.data[name] = value
  scope.value?.set(name, value, 'input')
  if (store.errors[name]) delete store.errors[name]
}

function setError(name: string, message: string) {
  store.errors[name] = message
}

function validate(): boolean {
  store.errors = {}
  let ok = true
  for (const node of body.value) {
    if (!node || typeof node === 'string') continue
    const item = node as SchemaObject
    if (!item.name) continue
    const message = validateValue(item, store.data[item.name])
    if (message) {
      store.errors[item.name] = message
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
  const api = props.schema.api
  if (!api) {
    if (props.schema.reload) {
      await scoped?.reload(props.schema.reload, store.data)
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
      throw new Error(apiMessage(api, result.payload, 'failed'))
    }
    mergeApiData(store.data, result)
    if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
      scope.value?.merge(result.data as Record<string, unknown>, result.replaceData ? 'override' : 'merge', 'api')
    }
    env.notify('success', apiMessage(api, result.payload, 'success'))
    if (props.schema.reload) {
      await scoped?.reload(props.schema.reload, store.data)
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
    if (!props.schema.initApi) return
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
  getValue,
  setValue,
  submit,
  reset,
  setError,
})
provideFormApi(formApi)
scoped?.register(formApi)
registerWizardValidate(validate)

onMounted(() => {
  formApi.reload()
})
watch(
  () => apiTrackKey(props.schema.initApi, { ...props.data, ...store.data }),
  (key, prev) => {
    if (prev != null && key && key !== prev) void formApi.reload()
  },
)
onBeforeUnmount(() => {
  scoped?.unregister(formApi)
  hub.remove(store.id)
})
</script>

<template>
  <component
    :is="wrapTag"
    class="w-full min-w-0"
    :class="isInline ? 'vamis-form vamis-form--inline' : 'vamis-form'"
    @submit.prevent="submit"
    @keydown.enter="onNestedEnter"
  >
    <Card
      v-if="wrapWithPanel"
      :class="panelClass"
    >
      <CardHeader v-if="schema.title" class="border-b">
        <CardTitle>{{ schema.title }}</CardTitle>
      </CardHeader>
      <CardContent :class="isInline ? 'flex flex-wrap items-end' : 'space-y-0'">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
      </CardContent>
      <CardFooter v-if="showActionBar" class="vamis-form-actions w-full justify-end border-t">
        <template v-if="hasCustomActions">
          <SchemaRenderer v-for="(node, i) in actions" :key="'a'+i" :schema="node" />
        </template>
        <template v-else>
          <Button :type="submitButtonType" :disabled="store.saving" @click="onDefaultSubmitClick">
            {{ store.saving ? '提交中…' : (schema.submitText || '提交') }}
          </Button>
          <Button v-if="schema.reset !== false" type="button" variant="outline" @click="reset">
            重置
          </Button>
        </template>
      </CardFooter>
    </Card>
    <template v-else>
      <h2 v-if="schema.title" class="mb-3 text-sm font-medium">{{ schema.title }}</h2>
      <div :class="isInline ? 'flex flex-wrap items-end' : ''">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
      </div>
      <div v-if="showActionBar" class="vamis-form-actions flex w-full justify-end gap-2 pt-3">
        <template v-if="hasCustomActions">
          <SchemaRenderer v-for="(node, i) in actions" :key="'a'+i" :schema="node" />
        </template>
        <template v-else>
          <Button :type="submitButtonType" :disabled="store.saving" @click="onDefaultSubmitClick">
            {{ store.saving ? '提交中…' : (schema.submitText || '提交') }}
          </Button>
          <Button v-if="schema.reset !== false" type="button" variant="outline" @click="reset">
            重置
          </Button>
        </template>
      </div>
    </template>
  </component>
</template>
