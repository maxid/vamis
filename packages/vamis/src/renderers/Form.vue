<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
  evalExpression,
  filterTpl,
  formItemStatic,
  formItemSubmitOnChange,
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
  statusStaticOf,
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
import FormRow from './form/FormRow.vue'

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
const PERSIST_KEY = typeof props.schema.persistData === 'string' ? props.schema.persistData : ''

/** Amis persistData：localStorage 恢复 + 只存 persistDataKeys（缺省全存）。 */
function readPersisted(defaults: Record<string, any>): Record<string, any> {
  if (!PERSIST_KEY || typeof localStorage === 'undefined') return cloneData(defaults)
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return defaults
    const keys = asArray(props.schema.persistDataKeys).map(String)
    const picked: Record<string, any> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (!keys.length || keys.includes(key)) picked[key] = value
    }
    return cloneData({ ...defaults, ...picked })
  } catch {
    return cloneData(defaults)
  }
}

function persistNow() {
  if (!PERSIST_KEY || typeof localStorage === 'undefined') return
  try {
    const keys = asArray(props.schema.persistDataKeys).map(String)
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(store.data)) {
      if (key.startsWith('__')) continue
      if (keys.length && !keys.includes(key)) continue
      out[key] = value
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(out))
  } catch {
    /* 隐私模式 / QuotaExceeded 时静默 */
  }
}

function clearPersisted() {
  if (!PERSIST_KEY || typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(PERSIST_KEY)
  } catch {
    /* ignore */
  }
}

const initialFormData = applyFormItemDefaults(
  collectFormItems(asArray(props.schema.body || props.schema.controls)),
  { ...(props.data || {}), ...(props.schema.data || {}) },
)

function cloneData(data: Record<string, any>): Record<string, any> {
  try {
    return structuredClone(data)
  } catch {
    return JSON.parse(JSON.stringify(data))
  }
}

const store = hub.add({
  id: createStoreId('form'),
  type: 'form',
  name: props.schema.name,
  data: readPersisted(initialFormData),
})

const rootEl = ref<HTMLElement | null>(null)
let initedFired = false
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
const isRow = computed(() => String(props.schema.mode || '') === 'row')
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
  if (props.schema.preventEnterSubmit === true) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
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
  void emitFormEvent('change')
  if (item && formItemSubmitOnChange(item, props.schema)) void submit()
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
  const api = autoFillApi(item)
  if ((item.options || item.source || item.autoComplete) && !api) return
  let ctx: Record<string, unknown> = { ...store.data, [name]: value, __term: value }
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

function formEventCtx(extra: Record<string, unknown> = {}) {
  return {
    env,
    data: { ...props.data, ...store.data, ...extra },
    scoped,
    overlay,
    form: formApi,
  }
}

/** 对齐 Amis onEvent：inited / change / validate* / submit* / initApiFinished。 */
async function emitFormEvent(eventName: string, extra: Record<string, unknown> = {}) {
  await runOnEvent(props.schema, eventName, formEventCtx(extra))
}

function messageOf(key: 'saveSuccess' | 'saveFailed' | 'validateFailed' | 'fetchSuccess' | 'fetchFailed', fallback: string) {
  const messages = props.schema.messages
  if (messages && typeof messages === 'object' && !Array.isArray(messages)) {
    const value = (messages as Record<string, unknown>)[key]
    if (typeof value === 'string' && value) return filterTpl(value, store.data)
  }
  return fallback
}

function trimDeep(value: unknown): unknown {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) return value.map(trimDeep)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) out[key] = trimDeep(item)
    return out
  }
  return value
}

function validate(extraRequired: string[] = []): boolean {
  store.errors = {}
  let ok = true
  const extra = new Set(extraRequired)
  for (const item of formItems()) {
    if (!item.name) continue
    if (!isVisible(item, store.data)) continue
    const itemName = String(item.name)
    const itemValue = getPathValue(store.data, itemName)
    const schema = extra.has(itemName) ? { ...item, required: true } : item
    const message = validateValue(schema, itemValue, store.data)
    if (message) {
      store.errors[itemName] = message
      ok = false
      void emitFormEvent('formItemValidateError', {
        __formName: itemName,
        __formValue: itemValue,
        __errors: message,
      })
    } else {
      void emitFormEvent('formItemValidateSucc', {
        __formName: itemName,
        __formValue: itemValue,
      })
    }
  }
  // Amis rules：组合校验，`name` 命中则高亮对应表单项，否则错误挂在表单底部。
  for (const raw of asArray(props.schema.rules)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue
    const rule = raw as Record<string, unknown>
    const expr = typeof rule.rule === 'string' ? rule.rule : ''
    if (!expr) continue
    let passed = true
    try {
      passed = !!evalExpression(expr, { ...store.data, data: store.data })
    } catch {
      passed = true
    }
    if (passed) continue
    ok = false
    const message = typeof rule.message === 'string' && rule.message ? rule.message : '表单校验失败'
    const rawNames = Array.isArray(rule.name) ? rule.name : rule.name == null ? [] : [rule.name]
    const names = rawNames.map(String).filter(Boolean)
    if (names.length) {
      for (const next of names) store.errors[next] = message
    } else {
      store.errors.__form = message
    }
  }
  void emitFormEvent(ok ? 'validateSucc' : 'validateError')
  return ok
}

function reset() {
  store.data = cloneData(initialFormData)
  store.errors = {}
}

function clear() {
  for (const item of formItems()) {
    if (!item.name) continue
    setPathValue(store.data, String(item.name), '')
    scope.value?.set(String(item.name), '', 'action')
  }
  store.errors = {}
}

let dialogFormBound = false

function closeOverlayDialog(values: Record<string, unknown>) {
  if (!dialogFormBound || !overlay?.state.dialog) return false
  overlay.closeDialog({ ...values })
  return true
}

async function submit() {
  if (props.schema.trimValues === true) {
    store.data = trimDeep(store.data) as Record<string, any>
  }
  if (!validate()) {
    env.notify('error', messageOf('validateFailed', '请检查表单'))
    return
  }
  let remoteOk = true
  for (const item of formItems()) {
    if (!item.name || !isVisible(item, store.data)) continue
    if (!(await runValidateApi(item))) remoteOk = false
  }
  if (!remoteOk) {
    env.notify('error', messageOf('validateFailed', '请检查表单'))
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
    closeOverlayDialog(store.data)
    return
  }
  const api = props.schema.api
  if (!api) {
    if (props.schema.reload) {
      await scoped.reload(props.schema.reload, store.data)
    } else if (!dialogFormBound) {
      env.notify('success', '已提交（未配置 api）')
    }
    await runOnEvent(props.schema, 'submit', {
      env,
      data: { ...props.data, ...store.data },
      scoped,
      overlay,
      form: formApi,
    })
    closeOverlayDialog(store.data)
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
    env.notify('success', messageOf('saveSuccess', apiMessage(api, result.payload, 'success')))
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
    await emitFormEvent('submitSucc', { result: result.payload })
    if (props.schema.clearPersistDataAfterSubmit !== false) clearPersisted()
    if (props.schema.resetAfterSubmit === true) reset()
    const redirect = props.schema.redirect
    if (typeof redirect === 'string' && redirect) {
      const payload = (result.payload || {}) as unknown as Record<string, unknown>
      env.jumpTo(filterTpl(redirect, { ...store.data, ...payload }))
    }
    closeOverlayDialog(store.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : '提交失败'
    env.notify('error', messageOf('saveFailed', message))
    void emitFormEvent('submitFail', { error })
  } finally {
    store.saving = false
  }
}

async function runInitApi(
  trigger: 'init' | 'reload',
  extra?: Record<string, any>,
  replace = false,
): Promise<Record<string, unknown> | null> {
  if (extra && typeof extra === 'object') {
    if (replace) {
      for (const key of Object.keys(store.data)) delete store.data[key]
    }
    Object.assign(store.data, extra)
  }
  if (!isEffectiveApi(props.schema.initApi, { ...props.data, ...store.data })) return null
  let last: Record<string, unknown> | null = null
  store.fetching = true
  try {
    const result = await requestApi(props.schema.initApi, { env, data: { ...props.data, ...store.data }, reason: 'init' })
    if (!result.skipped) {
      const payload = (result.payload || {}) as unknown as Record<string, unknown>
      last = {
        responseData: result.data,
        responseStatus: payload.status,
        responseMsg: payload.msg,
        error: !result.ok,
      }
      if (result.ok) {
        mergeApiData(store.data, result)
        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
          scope.value?.merge(result.data as Record<string, unknown>, result.replaceData ? 'override' : 'merge', 'api')
        }
      } else {
        env.notify('error', messageOf('fetchFailed', apiMessage(props.schema.initApi, result.payload, 'failed')))
      }
    }
  } finally {
    store.fetching = false
  }
  if (last) await emitFormEvent('initApiFinished', { ...last, __trigger: trigger })
  return last
}

const formApi = {
  name: String(props.schema.id || props.schema.name || ''),
  context: scoped,
  getValue,
  setValue,
  reset,
  clear,
  reload: async (extra?: Record<string, any>, replace = false) => {
    await runInitApi('reload', extra, replace)
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
  isStatic: () =>
    formItemStatic(
      props.schema,
      { ...props.data, ...store.data },
      false,
      statusStaticOf(props.schema),
    ),
  getValue,
  setValue,
  submit,
  reset,
  clear,
  setError,
})
provideFormApi(formApi)
parentScoped?.register(formApi)
registerWizardValidate(validate)

function focusFirstField() {
  const root = rootEl.value
  if (!root) return
  const candidates = root.querySelectorAll<HTMLElement>(
    'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])',
  )
  for (const el of candidates) {
    if (el.offsetParent !== null) {
      el.focus()
      return
    }
  }
}

onMounted(async () => {
  if (overlay?.state.dialog) {
    overlay.registerDialogForm(submit)
    dialogFormBound = true
  }
  let initResult: Record<string, unknown> | null = null
  if (
    isEffectiveApi(
      props.schema.initApi,
      { ...props.data, ...store.data },
      props.schema.initFetch,
      props.schema.initFetchOn,
    )
  ) {
    initResult = await runInitApi('init')
  }
  if (!initedFired) {
    initedFired = true
    await emitFormEvent('inited', initResult ? { ...initResult } : { error: false })
  }
  await nextTick()
  if (props.schema.autoFocus === true) focusFirstField()
  if (props.schema.submitOnInit === true) void submit()
})
watch(
  () => store.data,
  () => {
    clearHiddenFormValues(formItems(), store.data)
    persistNow()
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
  if (dialogFormBound) overlay?.unregisterDialogForm(submit)
  dialogFormBound = false
  parentScoped?.unregister(formApi)
  hub.remove(store.id)
  for (const timer of autoFillTimers.values()) clearTimeout(timer)
  autoFillTimers.clear()
})
</script>

<template>
  <LazyComponent :default-visible="!lazyLoad">
    <component
      ref="rootEl"
      :is="wrapTag"
      class="w-full min-w-0"
      :class="cn('vamis-form', isInline && 'vamis-form--inline', isRow && 'vamis-form--row')"
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
          <FormRow v-if="isRow" :nodes="body" :extra-data="store.data" />
          <template v-else>
            <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
          </template>
        </CardContent>
        <p v-if="store.errors.__form" class="m-t-xs text-xs text-destructive">{{ store.errors.__form }}</p>
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
          <FormRow v-if="isRow" :nodes="body" :extra-data="store.data" />
          <template v-else>
            <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
          </template>
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
