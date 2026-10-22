<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveValue, type SchemaObject } from '@vamis/core'
import {
  applyEditorTheme,
  editorChrome,
  mountCodeEditor,
  registerCustomLang,
  type CustomLang,
} from './code-highlight'
import { cssSize, readText } from './prop'

function schemaFlag(raw: unknown, defaultOn: boolean): boolean {
  if (raw === undefined || raw === null || raw === '') return defaultOn
  if (raw === false || raw === 0 || raw === 'false' || raw === 'off') return false
  if (raw === true || raw === 1 || raw === 'true' || raw === 'on') return true
  return defaultOn
}

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

const host = ref<HTMLElement | null>(null)
const darkDoc = ref(false)
let mo: MutationObserver | undefined
let session: Awaited<ReturnType<typeof mountCodeEditor>> | null = null
let disposed = false

onMounted(() => {
  const root = document.documentElement
  const sync = () => {
    darkDoc.value = root.classList.contains('dark')
  }
  sync()
  mo = new MutationObserver(sync)
  mo.observe(root, { attributes: true, attributeFilter: ['class'] })
  void mount()
})
onBeforeUnmount(() => {
  disposed = true
  mo?.disconnect()
  session?.dispose()
  session = null
})

const customLang = computed(() => {
  const raw = props.schema.customLang
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const rec = raw as CustomLang
  if (!Array.isArray(rec.tokens) || !rec.tokens.length) return undefined
  return rec
})

const language = computed(() => {
  if (customLang.value?.name) return customLang.value.name
  const raw = props.schema.language ?? 'plaintext'
  const resolved = typeof raw === 'string' ? resolveValue(raw, props.data) : raw
  return String(resolved || 'plaintext')
})

const source = computed(() => readText(props.schema, props.data))
const tabSize = computed(() => {
  const n = Number(props.schema.tabSize)
  return Number.isFinite(n) && n > 0 ? n : 4
})
const wordWrap = computed(() => schemaFlag(props.schema.wordWrap, true))
const editorTheme = computed(() => {
  const named = String(props.schema.editorTheme || '')
  if (named) return named
  return darkDoc.value ? 'vs-dark' : 'vs'
})
const dark = computed(() => editorTheme.value === 'vs-dark' || editorTheme.value === 'hc-black')
const folding = computed(() => schemaFlag(props.schema.folding, false))
const lineNumbers = computed((): 'on' | 'off' | 'relative' => {
  const raw = props.schema.lineNumbers
  if (raw === 'relative') return 'relative'
  if (raw === true || raw === 'on') return 'on'
  return 'off'
})
const maxHeight = computed(() => {
  if (props.schema.maxHeight == null || props.schema.maxHeight === '') return undefined
  const px = cssSize(props.schema.maxHeight, '')
  const n = Number.parseFloat(px)
  return Number.isFinite(n) && n > 0 ? n : undefined
})
const extra = computed(() => {
  const raw = props.schema.options
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  return raw as Record<string, unknown>
})

async function mount() {
  const el = host.value
  if (!el || disposed) return
  session?.dispose()
  session = await mountCodeEditor(el, {
    source: source.value,
    language: language.value,
    tabSize: tabSize.value,
    wordWrap: wordWrap.value,
    theme: editorTheme.value,
    customLang: customLang.value,
    lineNumbers: lineNumbers.value,
    folding: folding.value,
    maxHeight: maxHeight.value,
    extra: extra.value,
  })
  if (disposed) {
    session.dispose()
    session = null
  }
}

watch([source, language, tabSize, wordWrap, customLang, lineNumbers, folding, extra], () => {
  const current = session
  if (!current) return
  const model = current.editor.getModel()
  if (model && model.getValue() !== source.value) current.editor.setValue(source.value)
  if (model) {
    const monaco = current.monaco
    registerCustomLang(monaco, customLang.value)
    monaco.editor.setModelLanguage(model, language.value)
    current.editor.updateOptions({
      tabSize: tabSize.value,
      wordWrap: wordWrap.value ? 'on' : 'off',
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        horizontal: wordWrap.value ? 'hidden' : 'visible',
      },
      ...editorChrome({ lineNumbers: lineNumbers.value, folding: folding.value }),
      ...(extra.value || {}),
    })
  }
  current.fit()
})

watch(editorTheme, (theme) => {
  if (!session) return
  applyEditorTheme(session.monaco, theme)
})

const boxStyle = computed(() => {
  const style: Record<string, string> = {}
  const extraStyle = props.schema.style
  if (extraStyle && typeof extraStyle === 'object' && !Array.isArray(extraStyle)) {
    for (const [key, value] of Object.entries(extraStyle as Record<string, unknown>)) {
      if (value != null && value !== '') style[key] = String(value)
    }
  }
  if (maxHeight.value != null) {
    style.maxHeight = `${maxHeight.value}px`
    style.overflow = 'hidden'
  }
  return style
})
</script>

<template>
  <div
    ref="host"
    class="vamis-code vamis-code--editor w-full min-w-0 max-w-full overflow-hidden rounded-md"
    :class="dark ? 'vamis-code--dark' : ''"
    :style="boxStyle"
    :data-lang="language"
  />
</template>

<style scoped>
.vamis-code--editor {
  min-height: 1.5rem;
  min-width: 0;
  max-width: 100%;
}
.vamis-code--dark {
  background-color: #1e1e1e;
}
</style>
