<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  SchemaRenderer,
  createVamisEvent,
  eventEvalData,
  filterTpl,
  iconVendor,
  isApiOutdated,
  isEffectiveApi,
  overlayContainerFrom,
  requestApi,
  resolveClassName,
  resolveIcon,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { cn, VamisClear, VamisPasswordToggle } from '@vamis/ui'
import { controlInputValue, useForm } from '../../formContext'
import { optionValuesEqual, type OptionItem } from '../../options'
import FormItem from '../FormItem.vue'
import IconMark from '../IconMark.vue'
import Spinner from '../Spinner.vue'
import VamisOverlay from '../../overlay/VamisOverlay.vue'
import {
  appendCreatableOption,
  applyTextEmptyValue,
  dumpTextValue,
  filterTextOptions,
  highlightTextMatches,
  inputNativeType,
  isTextSuggestMode,
  normalizeAddOn,
  parseTextValue,
  readTextOptions,
  showPasswordReveal,
  textValueToString,
  transformInputText,
} from './input-text'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
  disabled?: boolean
}>()

const form = useForm()
const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const viewData = useData()

const inputEl = ref<HTMLInputElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)
const inputWrapEl = ref<HTMLElement | null>(null)
const focused = ref(false)
const open = ref(false)
const draft = ref('')
const highlight = ref(-1)
const revealed = ref(false)
const triggerWidth = ref(0)
const remote = ref<OptionItem[]>([])
const loading = ref(false)
const pristine = ref<unknown>(undefined)
let autoCompleteTimer: ReturnType<typeof setTimeout> | undefined

const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const labelField = computed(() => String(props.schema.labelField || 'label'))
const valueField = computed(() => String(props.schema.valueField || 'value'))
const delimiter = computed(() => String(props.schema.delimiter || ','))
const multiple = computed(() => props.schema.multiple === true)
const joinValues = computed(() => props.schema.joinValues !== false)
const extractValue = computed(() => props.schema.extractValue === true)
const creatable = computed(() => props.schema.creatable !== false)
const clearable = computed(() => props.schema.clearable === true)
const showCounter = computed(() => props.schema.showCounter === true)
const trimContents = computed(() => props.schema.trimContents !== false)
const clearValueOnEmpty = computed(() => props.schema.clearValueOnEmpty === true)
const maxLength = computed(() => {
  const n = Number(props.schema.maxLength)
  return Number.isFinite(n) && n > 0 ? n : undefined
})
const minLength = computed(() => {
  const n = Number(props.schema.minLength)
  return Number.isFinite(n) && n > 0 ? n : undefined
})
const transform = computed(() => {
  const raw = props.schema.transform
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  return raw as { lowerCase?: boolean; upperCase?: boolean }
})
const borderMode = computed(() => {
  const raw = String(props.schema.borderMode || 'full')
  return raw === 'half' || raw === 'none' ? raw : 'full'
})
const baseNativeType = computed(() => inputNativeType(props.schema.type))
const nativeType = computed(() => (baseNativeType.value === 'password' && revealed.value ? 'text' : baseNativeType.value))
const canRevealPassword = computed(() => showPasswordReveal(props.schema) && !props.disabled)
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))
const nativeAutoComplete = computed(() =>
  props.schema.nativeAutoComplete == null ? 'off' : String(props.schema.nativeAutoComplete),
)
const placeholder = computed(() =>
  props.schema.placeholder != null ? filterTpl(String(props.schema.placeholder), viewData.value) : '',
)
const prefixText = computed(() =>
  props.schema.prefix != null && props.schema.prefix !== ''
    ? filterTpl(String(props.schema.prefix), viewData.value)
    : '',
)
const suffixText = computed(() =>
  props.schema.suffix != null && props.schema.suffix !== ''
    ? filterTpl(String(props.schema.suffix), viewData.value)
    : '',
)
const addOn = computed(() => normalizeAddOn(props.schema.addOn))
const suggest = computed(() => isTextSuggestMode(props.schema))
const options = computed(() => {
  const local = props.schema.options ? readTextOptions(props.schema.options, labelField.value, valueField.value) : []
  const extra = remote.value.length ? remote.value : []
  return extra.length ? extra : local
})
const selected = computed(() =>
  parseTextValue(
    name.value ? form?.getValue(name.value) : undefined,
    options.value,
    multiple.value,
    joinValues.value,
    delimiter.value,
  ),
)
const rawValue = computed(() => (name.value ? form?.getValue(name.value) : undefined))
const displayValue = computed(() => textValueToString(rawValue.value))
const inputModel = computed(() => {
  if (suggest.value && multiple.value) return draft.value
  if (suggest.value && !creatable.value) {
    if (focused.value || draft.value) return draft.value
    return selected.value[0]?.label ?? ''
  }
  return displayValue.value
})
const counterText = computed(() => {
  const len = displayValue.value.length
  return maxLength.value != null ? `${len}/${maxLength.value}` : String(len)
})
const counterOver = computed(() => maxLength.value != null && displayValue.value.length > maxLength.value)
const showClear = computed(
  () => clearable.value && !props.disabled && rawValue.value != null && rawValue.value !== '',
)
const selectedValues = computed(() => (multiple.value ? selected.value.map((item) => item.value) : []))
const filteredOptions = computed(() => {
  const keyword = suggest.value ? inputModel.value : ''
  const filtered = filterTextOptions(options.value, keyword, selectedValues.value, {
    skipLocal: !!props.schema.autoComplete,
  })
  return appendCreatableOption(filtered, keyword, selectedValues.value, creatable.value, multiple.value)
})
const showSuggest = computed(() => suggest.value && open.value && (filteredOptions.value.length || loading.value))
/** 对齐 Amis InputText：`loading` 时控件右侧 `Spinner icon=reload size=sm`。 */
const loadingSpinnerSchema = computed(() => ({
  show: loading.value,
  icon: 'reload',
  size: 'sm',
  spinnerClassName: 'vamis-text-control__spinner',
}))
const inputControlClass = computed(() =>
  cn(
    'vamis-text-control__input',
    `vamis-text-control__input--${borderMode.value}`,
    suggest.value && 'vamis-text-control__input--suggest',
    multiple.value && 'vamis-text-control__input--multiple',
    resolveClassName(props.schema.inputControlClassName, viewData.value),
  ),
)
const nativeClass = computed(() =>
  cn(
    'vamis-text-control__native',
    canRevealPassword.value && 'vamis-text-control__native--password',
    resolveClassName(props.schema.nativeInputClassName, viewData.value),
  ),
)
const addOnIcon = computed(() => {
  if (!addOn.value || addOn.value.kind !== 'text' || addOn.value.icon == null) return null
  const raw = addOn.value.icon
  const value = typeof raw === 'string' ? filterTpl(raw, viewData.value) : raw
  return resolveIcon(value, { vendor: iconVendor(props.schema) })
})

function eventPayload(value: unknown) {
  return {
    ...viewData.value,
    value,
    ...(name.value ? { [name.value]: value } : {}),
  }
}

async function emitEvent(eventName: string, value: unknown, native?: Event): Promise<boolean> {
  const event = createVamisEvent(eventName, eventPayload(value), native)
  await runOnEvent(props.schema, eventName, {
    env,
    data: eventEvalData(eventPayload(value), event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return !event.prevented
}

function writeValue(next: unknown) {
  if (!name.value || !form) return
  form.setValue(name.value, next)
}

function commitNormal(raw: string, fromSelect = false) {
  let next = fromSelect ? raw : transformInputText(raw, transform.value)
  if (trimContents.value) next = next.trim()
  return applyTextEmptyValue(next, clearValueOnEmpty.value)
}

function commitSelected(items: OptionItem[]) {
  return dumpTextValue(items, multiple.value, joinValues.value, extractValue.value, delimiter.value)
}

function measureTrigger() {
  triggerWidth.value = inputWrapEl.value?.offsetWidth || rootEl.value?.offsetWidth || 0
}

function openSuggest() {
  if (!suggest.value || props.disabled) return
  open.value = true
  measureTrigger()
}

function syncHighlight() {
  highlight.value = filteredOptions.value.length ? 0 : -1
}

async function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  const typed = transformInputText(el.value, transform.value)
  if (suggest.value && (multiple.value || !creatable.value)) {
    draft.value = typed
    openSuggest()
    syncHighlight()
    scheduleAutoComplete(typed)
    if (el.value !== typed) el.value = typed
    return
  }
  const next = commitNormal(typed)
  if (!(await emitEvent('change', next, event))) return
  writeValue(next)
  if (suggest.value) {
    openSuggest()
    syncHighlight()
    scheduleAutoComplete(typed)
  }
}

async function onFocus(event: FocusEvent) {
  focused.value = true
  if (suggest.value) {
    if (multiple.value || !creatable.value) draft.value = ''
    openSuggest()
    syncHighlight()
    scheduleAutoComplete(draft.value)
  }
  await emitEvent('focus', rawValue.value, event)
}

async function onBlur(event: FocusEvent) {
  focused.value = false
  open.value = false
  if (!suggest.value && trimContents.value && typeof rawValue.value === 'string') {
    const trimmed = rawValue.value.trim()
    if (trimmed !== rawValue.value) {
      const next = applyTextEmptyValue(trimmed, clearValueOnEmpty.value)
      writeValue(next)
    }
  }
  if (suggest.value && (multiple.value || !creatable.value)) draft.value = ''
  await emitEvent('blur', rawValue.value, event)
}

async function onClick(event: MouseEvent) {
  if (!suggest.value || props.disabled) return
  openSuggest()
  if (!focused.value) inputEl.value?.focus()
  await emitEvent('click', rawValue.value, event)
}

async function toggleRevealPassword() {
  if (!canRevealPassword.value) return
  const eventName = revealed.value ? 'encrypt' : 'review'
  if (!(await emitEvent(eventName, rawValue.value))) return
  revealed.value = !revealed.value
}

async function pickOption(option: OptionItem) {
  if (option.disabled) return
  let next: unknown
  if (multiple.value) {
    next = commitSelected([...selected.value, option])
    draft.value = ''
  } else {
    next = commitSelected([option])
    draft.value = ''
    open.value = false
  }
  if (!(await emitEvent('change', next))) return
  writeValue(next)
}

async function removeSelected(index: number) {
  const nextItems = selected.value.filter((_, i) => i !== index)
  const next = nextItems.length ? commitSelected(nextItems) : applyTextEmptyValue('', clearValueOnEmpty.value)
  if (!(await emitEvent('change', next))) return
  writeValue(next)
}

async function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
    return
  }
  if (suggest.value && event.key === 'ArrowDown' && filteredOptions.value.length) {
    event.preventDefault()
    open.value = true
    highlight.value = Math.min(filteredOptions.value.length - 1, highlight.value + 1)
    return
  }
  if (suggest.value && event.key === 'ArrowUp' && filteredOptions.value.length) {
    event.preventDefault()
    highlight.value = Math.max(0, highlight.value - 1)
    return
  }
  if (suggest.value && event.key === 'Enter' && highlight.value >= 0 && filteredOptions.value[highlight.value]) {
    event.preventDefault()
    await pickOption(filteredOptions.value[highlight.value])
    return
  }
  if (event.key === 'Backspace' && !inputModel.value && selected.value.length) {
    event.preventDefault()
    await removeSelected(selected.value.length - 1)
    return
  }
  if (event.key !== 'Enter') return
  if (!suggest.value) return
  const typed = inputModel.value
  if (!typed) {
    open.value = false
    return
  }
  if (!creatable.value) return
  event.preventDefault()
  let next: unknown
  if (multiple.value) {
    if (selected.value.some((item) => optionValuesEqual(item.value, typed))) next = commitSelected(selected.value)
    else next = commitSelected([...selected.value, { label: typed, value: typed }])
    draft.value = ''
  } else {
    next = commitNormal(typed)
  }
  if (!(await emitEvent('enter', next, event))) return
  if (!(await emitEvent('change', next, event))) return
  writeValue(next)
  open.value = false
}

async function resetValue() {
  const next = pristine.value !== undefined ? pristine.value : props.schema.resetValue ?? props.schema.value ?? ''
  if (!(await emitEvent('change', next))) return
  writeValue(next)
}

async function clearValue() {
  let next: unknown = props.schema.resetValue ?? ''
  if (clearValueOnEmpty.value && (next === '' || next == null)) next = undefined
  if (!(await emitEvent('clear', next))) return
  if (!(await emitEvent('change', next))) return
  writeValue(next)
  draft.value = ''
}

function focus() {
  const el = inputEl.value
  if (!el) return
  el.focus()
  const len = el.value.length
  if (!len) return
  try {
    if (el.type === 'email') {
      el.type = 'text'
      el.setSelectionRange(len, len)
      el.type = 'email'
    } else {
      el.setSelectionRange(len, len)
    }
  } catch {
    /* native types like date do not support selection */
  }
}

function onSuggestOutside() {
  open.value = false
}

async function loadSource() {
  const source = props.schema.source
  if (!source) return
  if (typeof source === 'string' && source.includes('$') && !source.includes('/') && !/^[a-z]+:/i.test(source)) {
    const key = source.replace(/^\$\{?|\}$/g, '')
    remote.value = readTextOptions(viewData.value[key], labelField.value, valueField.value)
    return
  }
  if (!isEffectiveApi(source as any, viewData.value)) return
  loading.value = true
  try {
    const result = await requestApi(source as any, { env, data: viewData.value, reason: 'init' })
    if (result.skipped || !result.ok) return
    remote.value = readTextOptions(result.data?.options || result.data?.items || result.data, labelField.value, valueField.value)
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '选项加载失败')
  } finally {
    loading.value = false
  }
}

function scheduleAutoComplete(term: string) {
  const api = props.schema.autoComplete
  if (!api || api === false) return
  if (autoCompleteTimer) clearTimeout(autoCompleteTimer)
  autoCompleteTimer = setTimeout(() => {
    void loadAutoComplete(term)
  }, 250)
}

async function loadAutoComplete(term: string) {
  const api = props.schema.autoComplete
  if (!api || api === false || !isEffectiveApi(api as any, viewData.value)) return
  loading.value = true
  try {
    const result = await requestApi(api as any, { env, data: { ...viewData.value, term }, reason: 'init' })
    if (result.skipped || !result.ok) return
    remote.value = readTextOptions(result.data?.options || result.data?.items || result.data, labelField.value, valueField.value)
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '自动补全失败')
  } finally {
    loading.value = false
  }
}

const textApi = {
  get name() {
    return String(props.schema.id || props.schema.name || '')
  },
  reload: loadSource,
  getData: () => (name.value ? { value: form?.getValue(name.value) } : {}),
  setData(values: Record<string, unknown>) {
    if (!values || typeof values !== 'object') return
    if ('value' in values) writeValue(values.value)
    else if (name.value && name.value in values) writeValue(values[name.value])
  },
  async doAction(action: unknown) {
    const type =
      action && typeof action === 'object' ? String((action as { actionType?: string }).actionType || '') : ''
    if (type === 'clear') await clearValue()
    else if (type === 'reset') await resetValue()
    else if (type === 'focus') await nextTick(focus)
  },
}

scoped?.register(textApi)

onMounted(() => {
  pristine.value = name.value ? form?.getValue(name.value) : props.schema.value
  if (props.schema.source) void loadSource()
  if (isEffectiveApi(props.schema.autoComplete as any, viewData.value)) void loadAutoComplete('')
})
onBeforeUnmount(() => {
  scoped?.unregister(textApi)
  if (autoCompleteTimer) clearTimeout(autoCompleteTimer)
})

watch(
  () => [props.schema.source, viewData.value] as const,
  (curr, prev) => {
    if (!prev) return
    if (isApiOutdated(prev[0] as any, curr[0] as any, prev[1], curr[1])) void loadSource()
  },
)

watch(
  () => props.schema.revealPassword,
  (next) => {
    if (next === false) revealed.value = false
  },
)
</script>

<template>
  <FormItem :schema="schema">
    <div
      ref="rootEl"
      class="vamis-text-control"
      :class="{
        'vamis-text-control--with-addon': !!addOn,
        'is-focused': focused,
        'is-disabled': disabled,
      }"
    >
      <div
        v-if="addOn && addOn.position === 'left'"
        class="vamis-text-control__addon"
        :class="addOn.kind === 'action' ? 'vamis-text-control__addon--button' : 'vamis-text-control__addon--text'"
      >
        <SchemaRenderer v-if="addOn.kind === 'action'" :schema="addOn.schema" />
        <span v-else class="vamis-text-control__addon-text">
          <IconMark v-if="addOnIcon && addOnIcon.kind !== 'empty'" :icon="addOnIcon" img-class="size-4" />
          <template v-if="addOn.label">{{ filterTpl(addOn.label, viewData) }}</template>
        </span>
      </div>
      <div ref="inputWrapEl" :class="inputControlClass" @click="onClick">
        <span v-if="prefixText" class="vamis-text-control__affix vamis-text-control__prefix">{{ prefixText }}</span>
        <span
          v-for="(item, index) in multiple ? selected : []"
          :key="`${item.value}-${index}`"
          class="vamis-text-control__chip"
        >
          <span class="vamis-text-control__chip-label">{{ item.label }}</span>
          <button
            v-if="!disabled"
            type="button"
            class="vamis-text-control__chip-remove"
            aria-label="移除"
            @click.stop="removeSelected(index)"
          >
            ×
          </button>
        </span>
        <input
          ref="inputEl"
          :value="controlInputValue(inputModel)"
          :type="nativeType"
          :name="schema.name"
          :placeholder="(!multiple || !selected.length) && !focused ? placeholder : ''"
          :disabled="disabled"
          :maxlength="maxLength"
          :minlength="minLength"
          :autocomplete="nativeAutoComplete"
          :class="nativeClass"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeydown"
        >
        <button
          v-if="showClear"
          type="button"
          class="vamis-select__clear"
          aria-label="清除"
          @mousedown.prevent
          @click.stop="clearValue"
        >
          <VamisClear />
        </button>
        <button
          v-if="canRevealPassword"
          type="button"
          class="vamis-text-control__reveal"
          :aria-label="revealed ? '隐藏密码' : '显示密码'"
          @mousedown.prevent
          @click.stop="toggleRevealPassword"
        >
          <VamisPasswordToggle :revealed="revealed" />
        </button>
        <span
          v-if="showCounter"
          class="vamis-text-control__counter"
          :class="{ 'is-over': counterOver }"
        >{{ counterText }}</span>
        <span v-if="suffixText" class="vamis-text-control__affix vamis-text-control__suffix">{{ suffixText }}</span>
        <Spinner :schema="loadingSpinnerSchema" />
      </div>
      <VamisOverlay
        :show="showSuggest"
        :target="inputWrapEl"
        :container="overlayContainer"
        :gap="4"
        @outside="onSuggestOutside"
      >
        <div class="vamis-text-control__popover" :style="{ minWidth: triggerWidth ? `${triggerWidth}px` : undefined }">
          <button
            v-for="(option, index) in filteredOptions"
            :key="`${option.value}-${index}`"
            type="button"
            class="vamis-text-control__sug"
            :class="{ 'is-highlight': index === highlight, 'is-disabled': option.disabled, 'is-new': option.isNew }"
            :disabled="option.disabled"
            @mousedown.prevent
            @click.stop="pickOption(option)"
          >
            <span v-if="option.isNew">新增：{{ option.label }}</span>
            <span v-else>
              <span
                v-for="(part, partIndex) in highlightTextMatches(option.label, inputModel)"
                :key="partIndex"
                :class="{ 'is-matched': part.matched }"
              >{{ part.text }}</span>
            </span>
          </button>
          <div v-if="loading && !filteredOptions.length" class="vamis-text-control__sug is-muted">加载中…</div>
        </div>
      </VamisOverlay>
      <div
        v-if="addOn && addOn.position === 'right'"
        class="vamis-text-control__addon"
        :class="addOn.kind === 'action' ? 'vamis-text-control__addon--button' : 'vamis-text-control__addon--text'"
      >
        <SchemaRenderer v-if="addOn.kind === 'action'" :schema="addOn.schema" />
        <span v-else class="vamis-text-control__addon-text">
          <IconMark v-if="addOnIcon && addOnIcon.kind !== 'empty'" :icon="addOnIcon" img-class="size-4" />
          <template v-if="addOn.label">{{ filterTpl(addOn.label, viewData) }}</template>
        </span>
      </div>
    </div>
  </FormItem>
</template>
