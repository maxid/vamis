<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createDefaultEnv,
  getByPath,
  isVisible,
  provideData,
  provideEnv,
  provideValueHost,
  setByPathCopy,
  type SchemaNode,
  type SchemaObject,
} from '@vamis/core'

const props = withDefaults(
  defineProps<{
    nodes?: SchemaNode | SchemaNode[]
    value?: SchemaObject
    path?: string
    readonly?: boolean
  }>(),
  { value: () => ({}), path: '' },
)
const emit = defineEmits<{
  patch: [field: string, value: unknown]
}>()

provideEnv(createDefaultEnv({ parseLocation: false }))

function list(value: SchemaNode | SchemaNode[] | undefined): SchemaNode[] {
  return asArray(value).filter((item): item is SchemaNode => item != null)
}

function visit(nodes: SchemaNode | SchemaNode[] | undefined, callback: (node: SchemaObject) => void) {
  for (const child of list(nodes)) {
    if (!child || typeof child !== 'object') continue
    callback(child)
    visit(child.body, callback)
    visit(child.controls, callback)
    visit(child.tabs, callback)
    visit(child.items, callback)
    visit(child.columns, callback)
  }
}

const fields = computed(() => {
  const result = new Map<string, SchemaObject>()
  visit(props.nodes, (node) => {
    if (node.name) result.set(node.name, node)
  })
  return result
})

const panelData = computed(() => {
  let data = props.value
  for (const [name, node] of fields.value) {
    let value = getByPath(props.value, name)
    if (typeof node.pipeIn === 'function') value = node.pipeIn(value, props.value)
    if (value === undefined && node.value !== undefined) value = node.value
    data = setByPathCopy(data, name, value)
  }
  return data
})
provideData(panelData)

provideValueHost({
  setValue(name, raw) {
    if (props.readonly) return
    const node = fields.value.get(name)
    let value = raw
    if (node?.type === 'json' && typeof raw === 'string') {
      try {
        value = raw.trim() ? JSON.parse(raw) : undefined
      } catch {
        return
      }
    }
    if (typeof node?.pipeOut === 'function') value = node.pipeOut(value)
    emit('patch', name, value)
  },
})

function normalizeNodes(nodes: SchemaNode | SchemaNode[] | undefined): SchemaNode[] {
  return list(nodes).map((child) => {
    if (!child || typeof child !== 'object') return child
    const next = { ...child }
    if (next.type === 'json') next.type = 'textarea'
    if (next.name && next.type !== 'event-editor') {
      next.mode = next.mode || 'horizontal'
      if (props.readonly) next.disabled = true
    }
    for (const key of ['body', 'controls', 'tabs', 'items', 'columns'] as const) {
      if (next[key] != null) next[key] = normalizeNodes(next[key] as SchemaNode[])
    }
    return next
  })
}

const normalizedNodes = computed(() => normalizeNodes(props.nodes))
</script>

<template>
  <div class="vamis-editor-controls">
    <template v-for="(child, index) in normalizedNodes" :key="`${path}.${index}`">
      <SchemaRenderer
        v-if="child && typeof child === 'object' && isVisible(child, panelData)"
        :schema="child"
      />
    </template>
  </div>
</template>
