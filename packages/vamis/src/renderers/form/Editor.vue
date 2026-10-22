<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  resolveValue,
  runOnEvent,
  useEnv,
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
  mountFormEditor,
  normalizeEditorValue,
} from '../display/code-highlight'

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

const host = ref<HTMLElement | null>(null)
const darkDoc = ref(false)
const focused = ref(false)
const fullscreen = ref(false)
let mo: MutationObserver | undefined
let session: Awaited<ReturnType<typeof mountFormEditor>> | null = null
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
const allowFullscreen = computed(() => props.schema.allowFullscreen === true)
const placeholder = computed(() => String(props.schema.placeholder || ''))
const empty = computed(() => !value.value)

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

async function mount() {
  const el = host.value
  if (!el || disposed) return
  session?.dispose()
  session = await mountFormEditor(el, {
    value: value.value,
    language: language.value,
    theme: editorTheme.value,
    readOnly: !!props.disabled,
    extra: extra.value,
  })
  if (disposed) {
    session.dispose()
    session = null
    return
  }
  session.editor.onDidChangeModelContent(() => {
    if (applying || !session) return
    const next = session.editor.getValue()
    if (props.schema.name) form?.setValue(props.schema.name, next)
    void emitEvent('change', next)
  })
  session.editor.onDidFocusEditorWidget(() => {
    focused.value = true
    void emitEvent('focus', session?.editor.getValue() || value.value)
  })
  session.editor.onDidBlurEditorWidget(() => {
    focused.value = false
    void emitEvent('blur', session?.editor.getValue() || value.value)
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

watch([language, extra, () => props.disabled], () => {
  if (!session) return
  const model = session.editor.getModel()
  if (model) session.monaco.editor.setModelLanguage(model, language.value)
  session.editor.updateOptions({
    ...(extra.value || {}),
    readOnly: !!props.disabled,
  })
})

watch(editorTheme, (theme) => {
  if (!session) return
  applyEditorTheme(session.monaco, theme)
})

watch(fullscreen, () => {
  session?.editor.layout()
})
</script>

<template>
  <FormItem :schema="itemSchema">
    <div
      class="vamis-monaco relative w-full min-w-0 overflow-hidden rounded-md border bg-background"
      :class="{
        'ring-1 ring-ring': focused,
        'fixed inset-0 z-50 rounded-none': fullscreen,
      }"
      :style="fullscreen ? undefined : { height: `${height}px` }"
    >
      <button
        v-if="allowFullscreen"
        type="button"
        class="absolute right-2 top-1 z-10 text-xs text-muted-foreground hover:text-foreground"
        @click="fullscreen = !fullscreen"
      >
        {{ fullscreen ? '退出全屏' : '全屏' }}
      </button>
      <span
        v-if="placeholder && empty"
        class="pointer-events-none absolute left-16 top-2 z-10 whitespace-pre-wrap text-sm text-muted-foreground"
      >{{ placeholder }}</span>
      <div ref="host" class="h-full w-full min-w-0" />
    </div>
  </FormItem>
</template>
