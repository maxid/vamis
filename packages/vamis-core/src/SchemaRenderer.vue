<script setup lang="ts">
import { computed } from 'vue'
import { resolveRenderer } from './factory'
import { isDisabled, isVisible } from './formula'
import { resolveClassName, resolveCssVars, resolveInlineStyle } from './style'
import { provideData, useData, useEnv } from './context'
import { useScoped } from './scoped'
import { useOverlay } from './overlay'
import { useFormApi } from './form-api'
import { runOnEvent } from './actions/run'
import { EDITOR_PATH_MIME, useEditorSelection } from './editor-selection'
import Placeholder from './Placeholder.vue'
import type { SchemaNode, SchemaObject } from './types'

const SELF_CLICK_TYPES = new Set(['action', 'button', 'submit', 'reset'])

const props = defineProps<{
  schema?: SchemaNode | null
  extraData?: Record<string, unknown>
}>()

const parentData = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const form = useFormApi()
const schemaData = computed(() => {
  const schema = props.schema
  if (schema && typeof schema === 'object' && !Array.isArray(schema) && schema.data && typeof schema.data === 'object') {
    return schema.data as Record<string, unknown>
  }
  return {}
})
const data = computed(() => ({ ...parentData.value, ...schemaData.value, ...(props.extraData || {}) }))
provideData(data)

const normalized = computed<SchemaObject | null>(() => {
  const schema = props.schema
  if (schema == null || schema === false) return null
  if (typeof schema === 'string') return { type: 'tpl', tpl: schema }
  if (typeof schema !== 'object') return { type: 'tpl', tpl: String(schema) }
  return schema as SchemaObject
})

const visible = computed(() => (normalized.value ? isVisible(normalized.value, data.value) : false))
const disabled = computed(() =>
  normalized.value ? isDisabled(normalized.value, data.value) : false,
)
const renderer = computed(() => resolveRenderer(normalized.value?.type))
const wrapClick = computed(() => {
  const schema = normalized.value
  if (!schema?.onEvent?.click) return false
  return !SELF_CLICK_TYPES.has(schema.type || '')
})
const editor = useEditorSelection()
const editorPath = computed(() => {
  const schema = normalized.value
  if (!editor || !schema) return undefined
  return typeof schema.__editorPath === 'string' ? (schema.__editorPath as string) : undefined
})
const editorSelected = computed(
  () => !!editor && editorPath.value != null && editor.selectedPath.value === editorPath.value,
)
const editorDrop = computed(
  () => !!editor && editorPath.value != null && editor.dropPath?.value === editorPath.value,
)
const canDrag = computed(() => !!editor && !!editorPath.value)
const nodeClass = computed(() => resolveClassName(normalized.value?.className, data.value))
const nodeStyle = computed(() => ({
  ...resolveCssVars(
    normalized.value?.cssVars && typeof normalized.value.cssVars === 'object'
      ? (normalized.value.cssVars as Record<string, string>)
      : undefined,
  ),
  ...resolveInlineStyle(normalized.value?.style, data.value),
}))
const nodeId = computed(() => {
  const id = normalized.value?.id
  return typeof id === 'string' && id ? id : undefined
})

function onEditorDragStart(event: DragEvent) {
  if (!canDrag.value || editorPath.value == null) return
  const tag = (event.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    event.preventDefault()
    return
  }
  event.stopPropagation()
  event.dataTransfer?.setData(EDITOR_PATH_MIME, editorPath.value)
  event.dataTransfer!.effectAllowed = 'move'
  editor?.select(editorPath.value)
}

async function onHostClick() {
  if (!normalized.value) return
  await runOnEvent(normalized.value, 'click', {
    env,
    data: data.value,
    scoped,
    overlay,
    form,
  })
}
</script>

<template>
  <div
    v-if="visible && normalized"
    :id="nodeId"
    :data-editor-path="editorPath"
    :draggable="canDrag"
    :class="[
      nodeClass,
      editor && editorPath != null
        ? [
            'relative',
            canDrag ? 'cursor-grab' : '',
            editorSelected ? 'rounded-sm ring-2 ring-primary ring-offset-1' : 'rounded-sm hover:ring-1 hover:ring-primary/40',
            editorDrop ? 'ring-2 ring-dashed ring-primary' : '',
          ]
        : '',
    ]"
    :style="nodeStyle"
    @dragstart="onEditorDragStart"
  >
    <button
      v-if="canDrag"
      type="button"
      draggable="true"
      class="absolute -left-1 top-1 z-10 h-4 w-3 cursor-grab rounded-sm bg-primary text-[9px] leading-4 text-primary-foreground"
      aria-label="拖动节点"
      @click.stop
      @dragstart.stop="onEditorDragStart"
    >
      ⋮
    </button>
    <div v-if="wrapClick" @click="onHostClick">
      <component
        :is="renderer.component"
        v-if="renderer"
        :schema="normalized"
        :data="data"
        :disabled="disabled"
      />
      <Placeholder v-else :schema="normalized" />
    </div>
    <component
      :is="renderer.component"
      v-else-if="renderer"
      :schema="normalized"
      :data="data"
      :disabled="disabled"
    />
    <Placeholder v-else :schema="normalized" />
  </div>
</template>
