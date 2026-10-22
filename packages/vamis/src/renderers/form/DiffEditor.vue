<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  filterTpl,
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
  monacoOverflowHost,
  mountDiffEditor,
  normalizeEditorValue,
  syncOverflowHostTheme,
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
let mo: MutationObserver | undefined
let session: Awaited<ReturnType<typeof mountDiffEditor>> | null = null
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
  const raw = props.schema.language
  const resolved = typeof raw === 'string' ? resolveValue(raw, viewData.value) : raw
  return String(resolved || 'javascript')
})
const original = computed(() => {
  const raw = props.schema.diffValue
  const text = typeof raw === 'string' ? filterTpl(raw, viewData.value) : raw
  return normalizeEditorValue(text, language.value)
})
function boundModified(): unknown {
  if (props.schema.name && form) {
    const current = form.getValue(props.schema.name)
    if (current !== undefined) return current
  }
  return props.schema.value
}

const modified = computed(() => normalizeEditorValue(boundModified(), language.value))
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
  session = await mountDiffEditor(el, {
    original: original.value,
    modified: modified.value,
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
  const modifiedEditor = session.editor.getModifiedEditor()
  modifiedEditor.onDidChangeModelContent(() => {
    if (applying || !session) return
    const next = session.modified.getValue()
    if (props.schema.name) form?.setValue(props.schema.name, next)
    void emitEvent('change', next)
  })
  modifiedEditor.onDidFocusEditorWidget(() => {
    focused.value = true
    void emitEvent('focus', session?.modified.getValue() || modified.value)
  })
  modifiedEditor.onDidBlurEditorWidget(() => {
    focused.value = false
    void emitEvent('blur', session?.modified.getValue() || modified.value)
  })
}

watch(modified, (next) => {
  if (!session) return
  if (session.modified.getValue() !== next) {
    applying = true
    session.modified.setValue(next)
    applying = false
  }
})

watch(original, (next) => {
  if (!session) return
  if (session.original.getValue() !== next) session.original.setValue(next)
})

watch([language, extra, () => props.disabled], () => {
  if (!session) return
  session.monaco.editor.setModelLanguage(session.original, language.value)
  session.monaco.editor.setModelLanguage(session.modified, language.value)
  session.editor.updateOptions({
    ...(extra.value || {}),
    readOnly: !!props.disabled,
    originalEditable: false,
    fixedOverflowWidgets: true,
    overflowWidgetsDomNode: monacoOverflowHost(editorTheme.value),
  })
})

watch(editorTheme, (theme) => {
  if (!session) return
  applyEditorTheme(session.monaco, theme)
  syncOverflowHostTheme(session.editor, theme)
})
</script>

<template>
  <FormItem :schema="itemSchema">
    <div
      class="vamis-monaco relative w-full min-w-0 overflow-visible rounded-md border bg-background"
      :class="{ 'ring-1 ring-ring': focused }"
      :style="{ height: `${height}px` }"
    >
      <div ref="host" class="h-full w-full min-w-0" />
    </div>
  </FormItem>
</template>
