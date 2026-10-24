<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  collapseItemKey,
  createVamisEvent,
  eventEvalData,
  filterTpl,
  runOnEvent,
  standaloneCollapsed,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaNode,
  type SchemaObject,
} from '@vamis/core'
import { useCollapseGroup } from './collapseGroup'

const props = defineProps<{
  schema: SchemaObject
  disabled?: boolean
}>()

const data = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()
const group = useCollapseGroup()

const itemKey = computed(() => collapseItemKey(props.schema, 0))
const collapsable = computed(() => props.schema.collapsable !== false)
const localCollapsed = ref(standaloneCollapsed(props.schema))

watch(
  () => [props.schema.collapsed, props.schema.active] as const,
  () => {
    if (!group) localCollapsed.value = standaloneCollapsed(props.schema)
  },
)

const collapsed = computed(() => {
  if (!collapsable.value) return false
  if (group) return group.isCollapsed(itemKey.value)
  return localCollapsed.value
})
const open = computed(() => !collapsed.value)
const locked = computed(() => props.disabled === true || props.schema.disabled === true)
const showArrow = computed(() => props.schema.showArrow !== false)
const iconRight = computed(() => {
  const pos = props.schema.expandIconPosition || group?.expandIconPosition.value
  return pos === 'right'
})
const expandIcon = computed(() => (props.schema.expandIcon as SchemaNode | undefined) || group?.expandIcon.value)
const headerNode = computed(() => {
  const raw = props.schema.header ?? props.schema.title ?? props.schema.label
  return raw as SchemaNode | undefined
})
const headerIsSchema = computed(() => {
  const raw = headerNode.value
  return raw != null && typeof raw === 'object'
})
const headerText = computed(() => {
  const raw = headerNode.value
  if (typeof raw === 'string' || typeof raw === 'number') return filterTpl(String(raw), data.value)
  return '折叠'
})
const body = computed(() => asArray(props.schema.body))
const headingClass = computed(() => String(props.schema.headingClassName || ''))
const bodyClass = computed(() => String(props.schema.bodyClassName || ''))
const grouped = computed(() => Boolean(group))
const fieldset = computed(() => Boolean(group?.enableFieldSetStyle.value))

async function emitChange(nextCollapsed: boolean) {
  const payload = { ...data.value, collapsed: nextCollapsed }
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

async function onToggle() {
  if (locked.value || !collapsable.value) return
  if (group) {
    const nextCollapsed = !group.isCollapsed(itemKey.value)
    const event = await emitChange(nextCollapsed)
    if (event.prevented) return
    await group.toggle(itemKey.value)
    return
  }
  const next = !localCollapsed.value
  const event = await emitChange(next)
  if (event.prevented) return
  localCollapsed.value = next
}
</script>

<template>
  <div
    class="w-full min-w-0 bg-card"
    :class="grouped ? '' : 'overflow-hidden rounded-md border'"
  >
    <button
      type="button"
      class="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] font-normal leading-[21px]"
      :class="[
        headingClass,
        iconRight ? 'flex-row-reverse' : '',
        locked || !collapsable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        fieldset ? 'font-medium' : '',
      ]"
      :disabled="locked || !collapsable"
      :aria-expanded="open"
      @click="onToggle"
    >
      <span
        v-if="showArrow && collapsable"
        class="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-transform"
        :class="open ? 'rotate-90' : ''"
        aria-hidden="true"
      >
        <SchemaRenderer v-if="expandIcon" :schema="expandIcon" />
        <svg v-else viewBox="0 0 16 16" class="size-3.5 fill-current" focusable="false">
          <path d="M6 3.2 11 8 6 12.8V3.2z" />
        </svg>
      </span>
      <span class="min-w-0 flex-1">
        <SchemaRenderer v-if="headerIsSchema" :schema="headerNode" />
        <template v-else>{{ headerText }}</template>
      </span>
    </button>
    <div v-show="open" class="border-t px-3 py-3" :class="bodyClass">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </div>
  </div>
</template>
