<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  filterTpl,
  iconVendor,
  overlayContainerFrom,
  remarkHasTip,
  remarkHostClassName,
  remarkIconRaw,
  remarkIsMobile,
  remarkLabel,
  remarkLayerSchema,
  remarkMouseEnterDelay,
  remarkMouseLeaveDelay,
  remarkRootClose,
  remarkShape,
  remarkTriggers,
  remarkDialogSchema,
  resolveClassName,
  resolveIcon,
  resolveInlineStyle,
  tooltipEnterable,
  useData,
  useEnv,
  useOverlay,
  type SchemaObject,
} from '@vamis/core'
import VamisTooltipLayer from '../../overlay/VamisTooltipLayer.vue'
import IconMark from '../IconMark.vue'

const props = defineProps<{ schema: SchemaObject; data?: Record<string, any> }>()
const injected = useData()
const env = useEnv()
const overlay = useOverlay()
const data = computed(() => props.data || injected.value)
const triggerEl = ref<HTMLElement | null>(null)
const open = ref(false)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const mobile = computed(() => remarkIsMobile(props.schema, env))
const hasTip = computed(() => remarkHasTip(props.schema, data.value))
const triggers = computed(() => remarkTriggers(props.schema))
const shape = computed(() => remarkShape(props.schema))
const label = computed(() => remarkLabel(props.schema, data.value))
const icon = computed(() => {
  const raw = remarkIconRaw(props.schema)
  const value = typeof raw === 'string' ? filterTpl(raw, data.value) : raw
  return resolveIcon(value, { vendor: iconVendor(props.schema) })
})
const hostClass = computed(() => resolveClassName(remarkHostClassName(props.schema), data.value))
const hostStyle = computed(() => resolveInlineStyle(props.schema.style, data.value))
const layerTooltip = computed(() => remarkLayerSchema(props.schema, data.value))
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))
const enterable = computed(() => tooltipEnterable(layerTooltip.value))
const canFocus = computed(() => !mobile.value && triggers.value.includes('focus'))
const iconClass = computed(() =>
  ['vamis-remark__icon', shape.value === 'circle' ? 'vamis-remark__icon--circle' : ''].filter(Boolean).join(' '),
)

function clearTimers() {
  if (enterTimer.value) clearTimeout(enterTimer.value)
  if (leaveTimer.value) clearTimeout(leaveTimer.value)
  enterTimer.value = null
  leaveTimer.value = null
}

function setOpen(next: boolean) {
  if (mobile.value || !hasTip.value) {
    open.value = false
    return
  }
  open.value = next
}

function show() {
  clearTimers()
  const wait = remarkMouseEnterDelay(props.schema)
  if (!wait) {
    setOpen(true)
    return
  }
  enterTimer.value = setTimeout(() => setOpen(true), wait)
}

function hide(immediate = false) {
  clearTimers()
  const wait = immediate ? 0 : remarkMouseLeaveDelay(props.schema)
  if (!wait) {
    setOpen(false)
    return
  }
  leaveTimer.value = setTimeout(() => setOpen(false), wait)
}

function onEnter() {
  if (mobile.value) return
  if (triggers.value.includes('hover')) show()
}

function onLeave() {
  if (mobile.value) return
  if (triggers.value.includes('hover')) hide()
}

function onLayerEnter() {
  if (!enterable.value) return
  clearTimers()
  setOpen(true)
}

function onLayerLeave() {
  if (!enterable.value) return
  if (triggers.value.includes('hover')) hide()
}

function onClick() {
  if (mobile.value) {
    if (!hasTip.value) return
    overlay?.openDialog(remarkDialogSchema(props.schema, data.value), data.value)
    return
  }
  if (!triggers.value.includes('click')) return
  if (open.value) hide(true)
  else show()
}

function onFocus() {
  if (mobile.value) return
  if (triggers.value.includes('focus')) show()
}

function onBlur() {
  if (mobile.value) return
  if (triggers.value.includes('focus')) hide()
}

function onOutside() {
  if (remarkRootClose(props.schema) && open.value) setOpen(false)
}

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<template>
  <div
    ref="triggerEl"
    class="vamis-remark"
    :class="hostClass"
    :style="hostStyle"
    :tabindex="canFocus ? 0 : undefined"
    data-vamis-remark
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="onClick"
    @focusin="onFocus"
    @focusout="onBlur"
  >
    <span v-if="label">{{ label }}</span>
    <span :class="iconClass" aria-hidden="true">
      <svg
        v-if="icon.kind === 'empty'"
        viewBox="0 0 12 12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text font-size="12" fill="currentColor">
          <tspan x="3" y="10.5">？</tspan>
        </text>
      </svg>
      <IconMark v-else :icon="icon" />
    </span>
  </div>
  <VamisTooltipLayer
    v-if="hasTip && !mobile"
    :show="open"
    :target="triggerEl"
    :container="overlayContainer"
    :tooltip="layerTooltip"
    :data="data"
    @outside="onOutside"
    @enter="onLayerEnter"
    @leave="onLayerLeave"
  />
</template>
