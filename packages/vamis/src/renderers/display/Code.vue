<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { resolveValue, type SchemaObject } from '@vamis/core'
import { colorize, escapeHtml, type CustomLang } from './code-highlight'
import { cssSize, readText } from './prop'

const WRAPPERS = new Set(['pre', 'code', 'div', 'span'])

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

const darkDoc = ref(false)
let mo: MutationObserver | undefined

onMounted(() => {
  const root = document.documentElement
  const sync = () => {
    darkDoc.value = root.classList.contains('dark')
  }
  sync()
  mo = new MutationObserver(sync)
  mo.observe(root, { attributes: true, attributeFilter: ['class'] })
})
onBeforeUnmount(() => mo?.disconnect())

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
const wordWrap = computed(() => props.schema.wordWrap !== false)
const editorTheme = computed(() => {
  const named = String(props.schema.editorTheme || '')
  if (named) return named
  return darkDoc.value ? 'vs-dark' : 'vs'
})
const dark = computed(() => editorTheme.value === 'vs-dark' || editorTheme.value === 'hc-black')
const isMultiLine = computed(() => source.value.split(/\r?\n/).length > 1)
const tag = computed(() => {
  const raw = String(props.schema.wrapperComponent || '').toLowerCase()
  if (WRAPPERS.has(raw)) return raw
  return isMultiLine.value ? 'pre' : 'code'
})
const html = ref('')
let colorizeGen = 0

watch(
  [source, language, tabSize, customLang, editorTheme],
  async () => {
    const gen = ++colorizeGen
    html.value = escapeHtml(source.value)
    const colored = await colorize(source.value, language.value, tabSize.value, customLang.value, editorTheme.value)
    if (gen === colorizeGen) html.value = colored
  },
  { immediate: true },
)
const boxStyle = computed(() => {
  const style: Record<string, string> = {}
  const extra = props.schema.style
  if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
    for (const [key, value] of Object.entries(extra as Record<string, unknown>)) {
      if (value != null && value !== '') style[key] = String(value)
    }
  }
  if (props.schema.maxHeight != null && props.schema.maxHeight !== '') {
    if (!style.maxHeight) style.maxHeight = cssSize(props.schema.maxHeight, '')
    if (!style.overflow) style.overflow = 'auto'
  }
  style.tabSize = String(tabSize.value)
  return style
})
const boxClass = computed(() =>
  [
    'vamis-code font-mono text-xs leading-5',
    tag.value === 'pre' ? 'vamis-code--pre m-0 block' : 'inline',
    dark.value ? 'vamis-code--dark' : 'text-foreground',
    wordWrap.value ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto',
  ]
    .filter(Boolean)
    .join(' '),
)
</script>

<template>
  <component
    :is="tag"
    :class="boxClass"
    :style="boxStyle"
    :data-lang="language"
    v-html="html"
  />
</template>

<style scoped>
.vamis-code--pre {
  padding: 0.75rem 1rem;
}
.vamis-code--dark {
  background-color: #1e1e1e;
  color: #d4d4d4;
  border-radius: var(--radius, 0.5rem);
}
</style>
