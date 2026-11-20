<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SchemaRenderer,
  alertActions,
  alertBody,
  alertIcon,
  alertIconSrc,
  alertLevel,
  alertShowClose,
  alertShowIcon,
  alertTitle,
  alertTitleNode,
  resolveIcon,
  resolveClassName,
  useData,
  type ResolvedIcon,
  type SchemaObject,
} from '@vamis/core'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  VAMIS_ICONS,
  VamisIcon,
  levelToAlertVariant,
  levelToFeedbackIcon,
  type VamisIconName,
} from '@vamis/ui'
import IconMark from './IconMark.vue'

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
const icon = computed(() => alertIcon(props.schema, data.value))
const iconSrc = computed(() => alertIconSrc(props.schema, data.value))
/* Amis Icon 顺序：注册 SVG 优先，其次 URL，最后按 class（含 Font Awesome）。 */
const builtinIcon = computed<VamisIconName | null>(() => {
  const name = icon.value
  return name && Object.prototype.hasOwnProperty.call(VAMIS_ICONS, name) ? (name as VamisIconName) : null
})
const resolvedIcon = computed<ResolvedIcon | null>(() => {
  if (!icon.value) return null
  if (iconSrc.value) return { kind: 'url', src: iconSrc.value }
  return resolveIcon(icon.value)
})
const rootClass = computed(() => resolveClassName(props.schema.className, data.value))
const iconClass = computed(() => resolveClassName(props.schema.iconClassName, data.value))
const closeClass = computed(() => resolveClassName(props.schema.closeButtonClassName, data.value))
const levelIcon = computed(() => levelToFeedbackIcon(level.value))

function close() {
  open.value = false
}
</script>

<template>
  <Alert
    v-if="open"
    data-vamis-alert
    :variant="variant"
    :data-variant="variant"
    class="vamis-alert"
    :class="[rootClass, { 'vamis-alert--has-title': !!title || !!titleNode }]"
  >
    <div
      v-if="showIcon"
      class="vamis-alert__icon"
      :class="{ 'vamis-alert__icon--custom': !!icon }"
    >
      <VamisIcon v-if="builtinIcon" :name="builtinIcon" :class="iconClass" />
      <IconMark v-else-if="resolvedIcon" :icon="resolvedIcon" :img-class="iconClass" />
      <component v-else :is="levelIcon" :class="iconClass" />
    </div>
    <div class="vamis-alert__content">
      <AlertTitle v-if="title || titleNode">
        <SchemaRenderer v-if="titleNode" :schema="titleNode" />
        <template v-else>{{ title }}</template>
      </AlertTitle>
      <AlertDescription v-if="body.length">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
      </AlertDescription>
    </div>
    <div v-if="actions.length" class="vamis-alert__actions">
      <SchemaRenderer v-for="(node, i) in actions" :key="i" :schema="node" />
    </div>
    <button
      v-if="showClose"
      type="button"
      class="vamis-alert__close"
      :class="closeClass"
      aria-label="关闭提示"
      @click.stop="close"
    >
      <VamisIcon name="close" class="vamis-alert__close-icon" />
    </button>
  </Alert>
</template>
