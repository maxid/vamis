<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  EnvKey,
  createDefaultEnv,
  createVamisEvent,
  eventEvalData,
  resolveValue,
  runOnEvent,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import {
  applyEditorTheme,
  editorHeight,
  monacoOverflowHost,
  mountFormEditor,
  normalizeEditorValue,
  syncEditorPlaceholder,
  syncOverflowHostTheme,
} from '../display/code-highlight'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [string]
  focus: [string]
  blur: [string]
}>()

const form = useForm()
const env = inject(EnvKey, null) ?? createDefaultEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()

const host = ref<HTMLElement | null>(null)
const placeholderEl = ref<HTMLElement | null>(null)
const darkDoc = ref(false)
const focused = ref(false)
const fullscreen = ref(false)
let mo: MutationObserver | undefined
let session: Awaited<ReturnType<typeof mountFormEditor>> | null = null
let layoutSub: { dispose: () => void } | undefined
let disposed = false
let applying = false

function seedFormValue() {
  const name = props.schema.name
  if (!name || !form) return
  if (form.getValue(name) !== undefined) return
  if (props.schema.value == null || props.schema.value === '') return
  form.setValue(name, normalizeEditorValue(props.schema.value, language.value))
}

onMounted(() => {
  const root = document.documentElement
  const sync = () => {
    darkDoc.value = root.classList.contains('dark')
  }
  sync()
  mo = new MutationObserver(sync)
  mo.observe(root, { attributes: true, attributeFilter: ['class'] })
  seedFormValue()
  void mount()
})
onBeforeUnmount(() => {
  disposed = true
  mo?.disconnect()
  layoutSub?.dispose()
  layoutSub = undefined
  session?.dispose()
  session = null
})

const viewData = computed(() => props.data || form?.store.data || {})
const itemSchema = computed(() => {
  const next = { ...props.schema }
  delete next.size
  return next
})
const language = computed(() => {
  const type = String(props.schema.type || '')
  if (type === 'js-editor') return 'javascript'
  if (type === 'ts-editor') return 'typescript'
  if (type.endsWith('-editor') && type !== 'editor') return type.slice(0, -'-editor'.length)
  const raw = props.schema.language
  const resolved = typeof raw === 'string' ? resolveValue(raw, viewData.value) : raw
  return String(resolved || 'javascript')
})
function boundValue(): unknown {
  if (props.schema.name && form) {
    const current = form.getValue(props.schema.name)
    if (current !== undefined) return current
  }
  return props.schema.value
}

const value = computed(() => normalizeEditorValue(boundValue(), language.value))
const extra = computed(() => {
  const raw = props.schema.options
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  return raw as Record<string, unknown>
})
const editorTheme = computed(() => {
  const named = String(props.schema.editorTheme || '')
  if (named) return named
  return darkDoc.value ? 'vs-dark' : 'vs'
})
const height = computed(() => editorHeight(props.schema.size))
const fillParent = computed(() => props.schema.size === 'full')
const hideButtons = computed(() => props.schema.hideButtons === true)
const intellisense = computed(() => {
  const raw = props.schema.intellisense
  if (raw === false || raw === true || raw === 'schema') return raw
  return true
})
const allowFullscreen = computed(() => props.schema.allowFullscreen === true && !hideButtons.value)
const placeholder = computed(() => String(props.schema.placeholder || ''))
const empty = computed(() => !value.value)
const heightStyle = computed(() => {
  if (fullscreen.value || fillParent.value) return undefined
  const next = height.value
  return { height: typeof next === 'number' ? `${next}px` : next }
})

async function emitEvent(name: string, next: string) {
  const payload = {
    ...viewData.value,
    value: next,
    ...(props.schema.name ? { [props.schema.name]: next } : {}),
  }
  const event = createVamisEvent(name, payload)
  await runOnEvent(props.schema, name, {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
}

function syncPlaceholder() {
  if (!session) return
  syncEditorPlaceholder(session.monaco, session.editor, placeholderEl.value)
}

async function mount() {
  const el = host.value
  if (!el || disposed) return
  layoutSub?.dispose()
  layoutSub = undefined
  session?.dispose()
  session = await mountFormEditor(el, {
    value: value.value,
    language: language.value,
    theme: editorTheme.value,
    readOnly: !!props.disabled,
    extra: extra.value,
    intellisense: intellisense.value,
  })
  if (disposed) {
    session.dispose()
    session = null
    return
  }
  layoutSub = session.editor.onDidLayoutChange(syncPlaceholder)
  await nextTick()
  syncPlaceholder()
  session.editor.onDidChangeModelContent(() => {
    if (applying || !session) return
    const next = session.editor.getValue()
    if (props.schema.name) form?.setValue(props.schema.name, next)
    emit('change', next)
    void emitEvent('change', next)
  })
  session.editor.onDidFocusEditorWidget(() => {
    focused.value = true
    const next = session?.editor.getValue() || value.value
    emit('focus', next)
    void emitEvent('focus', next)
  })
  session.editor.onDidBlurEditorWidget(() => {
    focused.value = false
    const next = session?.editor.getValue() || value.value
    emit('blur', next)
    void emitEvent('blur', next)
  })
}

watch(value, (next) => {
  if (!session) return
  const model = session.editor.getModel()
  if (model && model.getValue() !== next) {
    applying = true
    session.editor.setValue(next)
    applying = false
  }
})

watch([language, intellisense], () => {
  if (!session) return
  if (intellisense.value === 'schema') {
    void mount()
    return
  }
  const model = session.editor.getModel()
  if (model) session.monaco.editor.setModelLanguage(model, language.value)
})

watch([extra, () => props.disabled], () => {
  if (!session) return
  session.editor.updateOptions({
    ...(extra.value || {}),
    readOnly: !!props.disabled,
    fixedOverflowWidgets: true,
    overflowWidgetsDomNode: monacoOverflowHost(editorTheme.value),
  })
  syncPlaceholder()
})

watch([placeholder, empty], async () => {
  await nextTick()
  syncPlaceholder()
})

watch(editorTheme, (theme) => {
  if (!session) return
  applyEditorTheme(session.monaco, theme)
  syncOverflowHostTheme(session.editor, theme)
})

watch(fullscreen, async () => {
  await nextTick()
  session?.editor.layout()
})
</script>

<template>
  <component
    :is="hideButtons ? 'div' : FormItem"
    v-bind="hideButtons ? { class: fillParent ? 'h-full w-full min-w-0' : 'w-full min-w-0' } : { schema: itemSchema }"
  >
    <Teleport to="body" :disabled="!fullscreen">
      <div
        class="vamis-monaco relative w-full min-w-0 overflow-visible rounded-md border bg-background"
        :class="{
          'ring-1 ring-ring': focused,
          'vamis-monaco--fullscreen': fullscreen,
          'h-full min-h-0': fullscreen || fillParent,
        }"
        :style="heightStyle"
      >
        <button
          v-if="allowFullscreen"
          type="button"
          class="absolute right-2 top-1 z-20 text-xs text-muted-foreground hover:text-foreground"
          @click="fullscreen = !fullscreen"
        >
          {{ fullscreen ? '退出全屏' : '全屏' }}
        </button>
        <span
          v-if="placeholder && empty"
          ref="placeholderEl"
          class="vamis-monaco-placeholder"
        >{{ placeholder }}</span>
        <div ref="host" class="h-full w-full min-w-0" />
      </div>
    </Teleport>
  </component>
</template>
