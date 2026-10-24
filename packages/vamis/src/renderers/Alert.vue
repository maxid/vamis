<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SchemaRenderer,
  alertActions,
  alertBody,
  alertIconSrc,
  alertLevel,
  alertShowClose,
  alertShowIcon,
  alertTitle,
  alertTitleNode,
  resolveClassName,
  useData,
  type SchemaObject,
} from '@vamis/core'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
  levelToAlertVariant,
} from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, unknown>
  disabled?: boolean
}>()
const parentData = useData()
const open = ref(true)
const data = computed(() => {
  const own = props.schema.data
  if (!own || typeof own !== 'object' || Array.isArray(own)) return parentData.value
  return { ...parentData.value, ...(own as Record<string, unknown>) }
})

const level = computed(() => alertLevel(props.schema, data.value))
const variant = computed(() => levelToAlertVariant(level.value))
const title = computed(() => alertTitle(props.schema, data.value))
const titleNode = computed(() => alertTitleNode(props.schema))
const body = computed(() => alertBody(props.schema))
const actions = computed(() => alertActions(props.schema))
const showIcon = computed(() => alertShowIcon(props.schema, data.value))
const showClose = computed(() => alertShowClose(props.schema))
const iconSrc = computed(() => alertIconSrc(props.schema, data.value))
const iconClass = computed(() => resolveClassName(props.schema.iconClassName, data.value))
const closeClass = computed(() => resolveClassName(props.schema.closeButtonClassName, data.value))
const levelIcon = computed(() => {
  if (level.value === 'success') return CircleCheckIcon
  if (level.value === 'warning') return TriangleAlertIcon
  if (level.value === 'danger') return OctagonXIcon
  return InfoIcon
})

function close() {
  open.value = false
}
</script>

<template>
  <Alert v-if="open" data-vamis-alert :variant="variant" :class="showClose ? 'pr-8' : ''">
    <img v-if="showIcon && iconSrc" :src="iconSrc" alt="" :class="['size-4 object-contain', iconClass]" />
    <component v-else-if="showIcon" :is="levelIcon" :class="iconClass" />
    <AlertTitle v-if="title || titleNode">
      <SchemaRenderer v-if="titleNode" :schema="titleNode" />
      <template v-else>{{ title }}</template>
    </AlertTitle>
    <AlertDescription v-if="body.length">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </AlertDescription>
    <div v-if="actions.length" class="col-start-2 mt-1 flex flex-wrap items-center gap-2">
      <SchemaRenderer v-for="(node, i) in actions" :key="i" :schema="node" />
    </div>
    <button
      v-if="showClose"
      type="button"
      class="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded text-current opacity-40 hover:opacity-70"
      :class="closeClass"
      aria-label="关闭提示"
      @click.stop="close"
    >
      <XIcon class="size-3.5" />
    </button>
  </Alert>
</template>
