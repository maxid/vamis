<script setup lang="ts">
import { computed } from 'vue'
import {
  ACTION_TOOLTIP_OVERLAY,
  resolveClassName,
  resolveInlineStyle,
  tooltipContent,
  tooltipEnterable,
  tooltipOffset,
  tooltipPlacement,
  tooltipShowArrow,
  tooltipTheme,
  tooltipTitle,
  type OverlayContainer,
} from '@vamis/core'
import VamisOverlay from './VamisOverlay.vue'

const props = defineProps<{
  show: boolean
  target?: HTMLElement | null
  container?: OverlayContainer
  tooltip: Record<string, unknown>
  data?: Record<string, any>
}>()

const emit = defineEmits<{ outside: []; enter: []; leave: [] }>()

const bag = computed(() => props.data || {})
const title = computed(() => tooltipTitle(props.tooltip, bag.value))
const content = computed(() => tooltipContent(props.tooltip, bag.value))
const dark = computed(() => tooltipTheme(props.tooltip) === 'dark')
const arrow = computed(() => tooltipShowArrow(props.tooltip))
const enterable = computed(() => tooltipEnterable(props.tooltip))
const offset = computed(() => tooltipOffset(props.tooltip))
const place = computed(() => tooltipPlacement(props.tooltip))
const overlayPlacement = computed(() => {
  if (String(props.tooltip.placement || '') === 'auto') return 'auto'
  return ACTION_TOOLTIP_OVERLAY[place.value]
})
const extraClass = computed(() => resolveClassName(props.tooltip.tooltipClassName, bag.value))
const bodyClass = computed(() => resolveClassName(props.tooltip.tooltipBodyClassName, bag.value))
const arrowClassName = computed(() => resolveClassName(props.tooltip.tooltipArrowClassName, bag.value))
const extraStyle = computed(() => ({
  ...resolveInlineStyle(props.tooltip.tooltipStyle, bag.value),
  ...resolveInlineStyle(props.tooltip.style, bag.value),
}))
const layerClass = computed(() =>
  ['vamis-overlay--tooltip', enterable.value ? '' : 'is-ghost', extraClass.value].filter(Boolean).join(' '),
)
</script>

<template>
  <VamisOverlay
    :show="show"
    :target="target"
    :container="container"
    :placement="overlayPlacement"
    :gap="8"
    :offset="offset"
    :layer-class="layerClass"
    @outside="emit('outside')"
  >
    <div
      role="tooltip"
      class="vamis-tooltip"
      :class="[dark ? 'vamis-tooltip--dark' : 'vamis-tooltip--light', `vamis-tooltip--${place}`]"
      :style="extraStyle"
      :data-place="place"
      @mouseenter="enterable && emit('enter')"
      @mouseleave="enterable && emit('leave')"
    >
      <span
        v-if="arrow"
        class="vamis-tooltip__arrow"
        :class="arrowClassName"
        aria-hidden="true"
      />
      <div v-if="title" class="vamis-tooltip__title">{{ title }}</div>
      <div v-if="content" class="vamis-tooltip__body" :class="bodyClass">{{ content }}</div>
    </div>
  </VamisOverlay>
</template>
