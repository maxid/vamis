<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  collapseItemKey,
  createVamisEvent,
  evalExpression,
  eventEvalData,
  normalizeActiveKeys,
  runOnEvent,
  toggleCollapse,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaNode,
  type SchemaObject,
} from '@vamis/core'
import { provideCollapseGroup } from './collapseGroup'
import { useForm } from '../formContext'

const props = defineProps<{ schema: SchemaObject }>()

const data = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()
const form = useForm()

const accordion = computed(() => props.schema.accordion === true)
const activeKeys = ref(normalizeActiveKeys(props.schema.activeKey, accordion.value))
const expandIcon = computed(() => (props.schema.expandIcon as SchemaNode | undefined) || undefined)
const expandIconPosition = computed(() =>
  props.schema.expandIconPosition === 'right' ? 'right' : 'left',
)
const enableFieldSetStyle = computed(() => {
  if (!form) return false
  const raw = props.schema.enableFieldSetStyle
  if (raw === false) return false
  if (raw === true || raw == null) return true
  if (typeof raw === 'string') return Boolean(evalExpression(raw, data.value))
  return true
})

watch(
  () => [props.schema.activeKey, accordion.value] as const,
  ([key, acc]) => {
    activeKeys.value = normalizeActiveKeys(key, acc)
  },
)

const items = computed(() =>
  asArray(props.schema.body || props.schema.accordions).map((node, index) => {
    if (node && typeof node === 'object') {
      const item = node as SchemaObject
      const next = item.type ? item : { ...item, type: 'collapse' }
      if (next.key == null || next.key === '') return { ...next, key: collapseItemKey(next, index) }
      return next
    }
    return { type: 'collapse', key: String(index), body: node } as SchemaObject
  }),
)

function isCollapsed(key: string) {
  return !activeKeys.value.includes(String(key))
}

async function emitChange(collapseId: string, collapsed: boolean) {
  const payload = {
    ...data.value,
    activeKeys: activeKeys.value.slice(),
    collapseId,
    collapsed,
  }
  const event = createVamisEvent('change', payload)
  await runOnEvent(props.schema, 'change', {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return event
}

async function toggle(key: string) {
  const next = toggleCollapse(activeKeys.value, key, accordion.value)
  activeKeys.value = next.activeKeys
  await emitChange(key, next.collapsed)
}

provideCollapseGroup({
  grouped: true,
  accordion,
  activeKeys,
  expandIcon,
  expandIconPosition,
  enableFieldSetStyle,
  isCollapsed,
  toggle,
})
</script>

<template>
  <div
    class="w-full min-w-0 overflow-hidden rounded-md border bg-card divide-y"
    :data-fieldset="enableFieldSetStyle ? 'true' : undefined"
  >
    <SchemaRenderer v-for="(node, i) in items" :key="collapseItemKey(node, i)" :schema="node" />
  </div>
</template>
