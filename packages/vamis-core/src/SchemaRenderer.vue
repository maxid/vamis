<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { resolveRenderer } from './factory'
import { isDisabled, isVisible } from './formula'
import { resolveClassName, resolveCssVars, resolveInlineStyle } from './style'
import { provideData, provideScope, useData, useEnv, useScope } from './context'
import { createScope, type Scope } from './scope'
import { useScoped } from './scoped'
import { useOverlay } from './overlay'
import { useFormApi } from './form-api'
import { createVamisEvent, eventEvalData, runOnEvent } from './actions/run'
import { EDITOR_PATH_MIME, useEditorSelection } from './editor-selection'
import Placeholder from './Placeholder.vue'
import type { SchemaNode, SchemaObject } from './types'

const SELF_CLICK_TYPES = new Set(['action', 'button', 'submit', 'reset'])

const props = defineProps<{
  schema?: SchemaNode | null
  extraData?: Record<string, unknown>
}>()

const parentData = useData()
const parentScope = useScope()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const form = useFormApi()
const normalized = computed<SchemaObject | null>(() => {
  const schema = props.schema
  if (schema == null || schema === false) return null
  if (typeof schema === 'string') return { type: 'tpl', tpl: schema }
  if (typeof schema !== 'object') return { type: 'tpl', tpl: String(schema) }
  return schema as SchemaObject
})
const renderer = computed(() => resolveRenderer(normalized.value?.type))
const schemaData = computed(() => {
  const schema = normalized.value
  if (schema?.data && typeof schema.data === 'object') {
    return schema.data as Record<string, unknown>
  }
  return {}
})
const overlayInit = computed(() => ({
  ...schemaData.value,
  ...(props.extraData || {}),
}))
const hasOverlay = computed(() => Object.keys(overlayInit.value).length > 0)
const scopeMode = computed<'inherit' | 'self' | 'isolate'>(() => {
  const def = renderer.value
  if (def?.scope) return def.scope
  if (def?.isolateScope) return 'self'
  return 'inherit'
})
const needsChildScope = computed(() => scopeMode.value !== 'inherit' || hasOverlay.value)
const childScope = shallowRef<Scope | null>(null)
watch(
  () => [needsChildScope.value, scopeMode.value, props.schema] as const,
  () => {
    if (!needsChildScope.value) {
      childScope.value = null
      return
    }
    childScope.value = createScope(
      overlayInit.value,
      scopeMode.value === 'isolate' ? undefined : parentScope.value,
      { isolate: scopeMode.value === 'isolate' },
    )
  },
  { immediate: true },
)
watch(
  () => props.extraData,
  (val) => {
    if (!childScope.value || !val || typeof val !== 'object') return
    childScope.value.merge({ ...val })
  },
  { deep: true },
)
const currentScope = computed(() => childScope.value ?? parentScope.value)
provideScope(currentScope)
const data = computed(
  () => currentScope.value?.resolved() ?? { ...parentData.value, ...schemaData.value, ...(props.extraData || {}) },
)
provideData(data)

const visible = computed(() => (normalized.value ? isVisible(normalized.value, data.value) : false))
const disabled = computed(() =>
  normalized.value ? isDisabled(normalized.value, data.value) : false,
)
function shouldHandleHostEvent(eventName: string): boolean {
  const schema = normalized.value
  if (!schema?.onEvent?.[eventName]) return false
  if (eventName === 'click' && SELF_CLICK_TYPES.has(schema.type || '')) return false
  return true
}
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

async function onHostEvent(native: Event, eventName: string) {
  if (!normalized.value || !shouldHandleHostEvent(eventName)) return
  const event = createVamisEvent(eventName, data.value, native)
  await runOnEvent(normalized.value, eventName, {
    env,
    data: eventEvalData(data.value, event),
    scoped,
    overlay,
    form,
    scope: currentScope.value,
    event,
  })
  if (event.prevented) native.preventDefault()
  if (event.stopped) native.stopPropagation()
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
    @click="onHostEvent($event, 'click')"
    @mouseenter="onHostEvent($event, 'mouseenter')"
    @mouseleave="onHostEvent($event, 'mouseleave')"
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
    <component
      :is="renderer.component"
      v-if="renderer"
      :schema="normalized"
      :data="data"
      :disabled="disabled"
    />
    <Placeholder v-else :schema="normalized" />
  </div>
</template>
