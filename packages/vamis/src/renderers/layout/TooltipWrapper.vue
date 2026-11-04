<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  SchemaRenderer,
  overlayContainerFrom,
  tooltipBody,
  tooltipContent,
  tooltipDisabled,
  tooltipEnterable,
  tooltipInline,
  tooltipLayerSchema,
  tooltipMouseEnterDelay,
  tooltipMouseLeaveDelay,
  tooltipRootClose,
  tooltipTitle,
  tooltipTriggers,
  tooltipWrapperTag,
  useData,
  useEnv,
  type SchemaObject,
} from '@vamis/core'
import VamisTooltipLayer from '../../overlay/VamisTooltipLayer.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const data = useData()
const env = useEnv()
const triggerEl = ref<HTMLElement | null>(null)
const open = ref(false)
const enterTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const leaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const body = computed(() => tooltipBody(props.schema))
const title = computed(() => tooltipTitle(props.schema, data.value))
const content = computed(() => tooltipContent(props.schema, data.value))
const hasTip = computed(() => !!(title.value || content.value))
const triggers = computed(() => tooltipTriggers(props.schema))
const inline = computed(() => tooltipInline(props.schema))
const tag = computed(() => tooltipWrapperTag(props.schema))
const enterable = computed(() => tooltipEnterable(props.schema))
const blocked = computed(() => props.disabled || tooltipDisabled(props.schema))
const canFocus = computed(() => triggers.value.includes('focus'))
const overlayContainer = computed(() => overlayContainerFrom(props.schema, env))
const layerTooltip = computed(() => tooltipLayerSchema(props.schema))

function clearTimers() {
  if (enterTimer.value) clearTimeout(enterTimer.value)
  if (leaveTimer.value) clearTimeout(leaveTimer.value)
  enterTimer.value = null
  leaveTimer.value = null
}

function setOpen(next: boolean) {
  if (blocked.value && next) return
  if (!hasTip.value) return
  open.value = next
}

function show() {
  clearTimers()
  const wait = tooltipMouseEnterDelay(props.schema)
  if (!wait) {
    setOpen(true)
    return
  }
  enterTimer.value = setTimeout(() => setOpen(true), wait)
}

function hide() {
  clearTimers()
  const wait = tooltipMouseLeaveDelay(props.schema)
  if (!wait) {
    setOpen(false)
    return
  }
  leaveTimer.value = setTimeout(() => setOpen(false), wait)
}

function onEnter() {
  if (triggers.value.includes('hover')) show()
}

function onLeave() {
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
  if (!triggers.value.includes('click')) return
  if (open.value) hide()
  else show()
}

function onFocus() {
  if (triggers.value.includes('focus')) show()
}

function onBlur() {
  if (triggers.value.includes('focus')) hide()
}

function onOutside() {
  if (tooltipRootClose(props.schema) && open.value) setOpen(false)
}

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<template>
  <component
    :is="tag"
    ref="triggerEl"
    data-vamis-tooltip-wrapper
    :class="inline ? 'vamis-tooltip-wrapper vamis-tooltip-wrapper--inline' : 'vamis-tooltip-wrapper'"
    :tabindex="canFocus ? 0 : undefined"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @click="onClick"
    @focusin="onFocus"
    @focusout="onBlur"
  >
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </component>
  <VamisTooltipLayer
    v-if="hasTip"
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
