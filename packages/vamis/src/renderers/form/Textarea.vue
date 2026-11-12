<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  filterTpl,
  formItemStatic,
  formItemStaticSchema,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { VamisClear } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()

const form = useForm()
const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const data = useData()

const inputEl = ref<HTMLTextAreaElement | null>(null)
const focused = ref(false)
const pristine = ref<unknown>(undefined)
/** 程序化清空会冲掉原生 undo 栈：记录被清掉的值，供 Ctrl/⌘+Z 后悔。 */
const undoStack = ref<string[]>([])

const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const rawValue = computed(() => (name.value ? form?.getValue(name.value) : props.schema.value))
const displayValue = computed(() => valueToString(rawValue.value))
const placeholder = computed(() =>
  props.schema.placeholder != null ? filterTpl(String(props.schema.placeholder), data.value) : '',
)
const readOnly = computed(() => props.schema.readOnly === true)
const locked = computed(() => props.disabled || readOnly.value)
const clearable = computed(() => props.schema.clearable === true)
const showCounter = computed(() => props.schema.showCounter === true)
const trimContents = computed(() => props.schema.trimContents !== false)
const maxLength = computed(() => {
  const n = Number(props.schema.maxLength)
  return Number.isFinite(n) && n > 0 ? n : undefined
})
const minRows = computed(() => {
  const n = Number(props.schema.minRows)
  return Number.isFinite(n) && n > 0 ? n : 3
})
const maxRows = computed(() => {
  const n = Number(props.schema.maxRows)
  return Number.isFinite(n) && n > 0 ? n : 20
})
const borderMode = computed(() => {
  const raw = String(props.schema.borderMode || 'full')
  return raw === 'half' || raw === 'none' ? raw : 'full'
})
const showClear = computed(() => clearable.value && !locked.value && displayValue.value !== '')
const counterText = computed(() => {
  const len = displayValue.value.length
  return maxLength.value != null ? `${len}/${maxLength.value}` : String(len)
})
const counterOver = computed(() => maxLength.value != null && displayValue.value.length > maxLength.value)
const isStatic = computed(() =>
  formItemStatic(props.schema, data.value, form?.isStatic?.() === true, undefined),
)
const staticNodes = computed<SchemaObject[]>(() => {
  if (!isStatic.value || formItemStaticSchema(props.schema)) return []
  const staticConf = props.schema.staticSchema
  const limit =
    staticConf && typeof staticConf === 'object' && !Array.isArray(staticConf)
      ? Number((staticConf as SchemaObject).limit)
      : NaN
  return [
    {
      type: 'multiline-text',
      maxRows: Number.isFinite(limit) && limit > 0 ? limit : 5,
      value: displayValue.value,
    },
  ]
})
const formItemSchema = computed(() => {
  if (!isStatic.value) return { ...props.schema, static: false }
  if (formItemStaticSchema(props.schema)) return props.schema
  return { ...props.schema, staticSchema: staticNodes.value }
})
const controlClass = computed(() => [
  `vamis-textarea-control--${borderMode.value}`,
  {
    'is-focused': focused.value,
    'is-disabled': props.disabled,
    'is-readonly': readOnly.value,
    'is-counter': showCounter.value,
  },
])

function valueToString(value: unknown): string {
  if (value == null) return ''
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function eventPayload(value: unknown) {
  return {
    ...data.value,
    value,
    ...(name.value ? { [name.value]: value } : {}),
  }
}

async function emitEvent(eventName: string, value: unknown, native?: Event) {
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
  if (name.value && form) form.setValue(name.value, next)
}

async function onInput(event: Event) {
  const el = event.target as HTMLTextAreaElement
  const next = el.value
  // 用户开始重新输入后，把「清空」的后悔机会交还给原生 undo。
  undoStack.value = []
  if (!(await emitEvent('change', next, event))) {
    el.value = displayValue.value
    return
  }
  writeValue(next)
  await nextTick(resize)
}

async function onFocus(event: FocusEvent) {
  focused.value = true
  await emitEvent('focus', rawValue.value, event)
}

async function onBlur(event: FocusEvent) {
  focused.value = false
  if (trimContents.value && typeof rawValue.value === 'string') {
    const trimmed = rawValue.value.trim()
    if (trimmed !== rawValue.value) writeValue(trimmed)
  }
  await emitEvent('blur', rawValue.value, event)
}

async function clearValue() {
  const prev = displayValue.value
  if (prev !== '') undoStack.value.push(prev)
  const next = props.schema.resetValue ?? ''
  if (!(await emitEvent('change', next))) {
    undoStack.value.pop()
    return
  }
  writeValue(next)
  focus()
}

/** 清空后 Ctrl/⌘+Z 恢复上一份内容（Vamis 增强；原生 undo 不认程序化写入）。 */
async function onKeydown(event: KeyboardEvent) {
  const mod = event.metaKey || event.ctrlKey
  if (!mod || event.shiftKey || event.altKey) return
  if (event.key.toLowerCase() !== 'z') return
  if (!undoStack.value.length) return
  event.preventDefault()
  const prev = undoStack.value.pop() ?? ''
  if (!(await emitEvent('change', prev))) return
  writeValue(prev)
  await nextTick(() => {
    const el = inputEl.value
    if (!el) return
    el.focus()
    el.setSelectionRange(prev.length, prev.length)
    resize()
  })
}

async function resetValue() {
  const next = pristine.value !== undefined ? pristine.value : props.schema.resetValue ?? props.schema.value ?? ''
  if (!(await emitEvent('change', next))) return
  writeValue(next)
}

function focus() {
  const el = inputEl.value
  if (!el) return
  el.focus()
  const len = el.value.length
  if (len) el.setSelectionRange(len, len)
}

/** 量内容高度时临时关掉过渡再恢复，避免 auto / 中间高度截断 0.2s 动画。 */
function contentHeight(el: HTMLTextAreaElement): number {
  const prevHeight = el.style.height
  const prevTransition = el.style.transition
  el.style.transition = 'none'
  el.style.height = 'auto'
  const height = el.scrollHeight
  el.style.height = prevHeight
  el.style.transition = prevTransition
  void el.offsetHeight
  return height
}

/** Amis react-textarea-autosize：minRows–maxRows 之间随内容长高/收缩。 */
function resize() {
  const el = inputEl.value
  if (!el) return
  const lineHeight = 21
  const chrome = 10 // padding 4+4 + border 1+1
  const minHeight = minRows.value * lineHeight + chrome
  const maxHeight = maxRows.value * lineHeight + chrome
  const content = contentHeight(el)
  const next = Math.min(Math.max(content, minHeight), maxHeight)
  el.style.height = `${next}px`
  el.style.overflowY = content > maxHeight ? 'auto' : 'hidden'
}

watch([displayValue, showCounter, minRows, maxRows], () => void nextTick(resize))
onMounted(() => {
  pristine.value = rawValue.value
  void nextTick(resize)
})

function setData(values: Record<string, unknown>) {
  if (!values || typeof values !== 'object') return
  if ('value' in values) writeValue(values.value)
  else if (name.value && name.value in values) writeValue(values[name.value])
}

async function doAction(raw: unknown) {
  const action = raw as { actionType?: string; value?: unknown; args?: { value?: unknown } }
  const type = action?.actionType
  if (type === 'clear') {
    if (displayValue.value !== '') undoStack.value.push(displayValue.value)
    writeValue('')
    focus()
  } else if (type === 'reset') {
    writeValue(pristine.value !== undefined ? pristine.value : props.schema.resetValue ?? props.schema.value ?? '')
  } else if (type === 'focus') {
    await nextTick(focus)
  } else if (type === 'setValue') {
    writeValue(action.args?.value ?? action.value)
  }
}

function makeApi(apiName: string, id?: string) {
  return {
    name: apiName,
    id,
    setData,
    doAction,
    getValue: () => rawValue.value,
    getData: () => (name.value ? { value: rawValue.value, [name.value]: rawValue.value } : { value: rawValue.value }),
  }
}
const scopedId = String(props.schema.id || '')
const apis = [
  scopedId ? makeApi(scopedId, scopedId) : null,
  name.value && name.value !== scopedId ? makeApi(name.value) : null,
].filter(Boolean) as ReturnType<typeof makeApi>[]
for (const api of apis) scoped?.register(api)
onBeforeUnmount(() => {
  for (const api of apis) scoped?.unregister(api)
})
</script>

<template>
  <FormItem :schema="formItemSchema">
    <div class="vamis-textarea-control" :class="controlClass">
      <textarea
        ref="inputEl"
        class="vamis-textarea-control__native"
        :name="schema.name ? String(schema.name) : undefined"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readOnly"
        :maxlength="maxLength"
        :rows="minRows"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <button
        v-if="showClear"
        type="button"
        class="vamis-select__clear vamis-textarea-control__clear"
        aria-label="清除"
        @mousedown.prevent
        @click.stop="clearValue"
      >
        <VamisClear />
      </button>
      <span
        v-if="showCounter"
        class="vamis-textarea-control__counter"
        :class="{ 'is-over': counterOver }"
      >{{ counterText }}</span>
    </div>
  </FormItem>
</template>
