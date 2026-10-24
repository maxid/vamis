<script setup lang="ts">
import { computed } from 'vue'
import {
  badgeAnimation,
  badgeDisplayText,
  badgeLevel,
  badgeMode,
  badgeOffset,
  badgePosition,
  badgeSizePx,
  badgeVisible,
  resolveClassName,
  resolveInlineStyle,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
}>()

const injected = useData()
const data = computed(() => ({ ...injected.value, ...(props.data || {}) }))
const show = computed(() => badgeVisible(props.schema, data.value))
const mode = computed(() => badgeMode(props.schema))
const mark = computed(() => badgeDisplayText(props.schema, data.value))
const place = computed(() => badgePosition(props.schema))
const level = computed(() => badgeLevel(props.schema))
const size = computed(() => badgeSizePx(props.schema))
const offset = computed(() => badgeOffset(props.schema))
const pulse = computed(() => badgeAnimation(props.schema))
const extraClass = computed(() => {
  const rec = props.schema.badge
  if (rec && typeof rec === 'object' && !Array.isArray(rec)) {
    return resolveClassName((rec as Record<string, unknown>).className, data.value)
  }
  return ''
})
const extraStyle = computed(() => {
  const rec = props.schema.badge
  if (rec && typeof rec === 'object' && !Array.isArray(rec)) {
    return resolveInlineStyle((rec as Record<string, unknown>).style, data.value)
  }
  return {}
})

const cornerClass = computed(() => {
  const pos = place.value
  if (mode.value === 'ribbon') {
    return pos.includes('left') ? 'left-0 top-0 origin-top-left' : 'right-0 top-0 origin-top-right'
  }
  if (pos === 'top-left') return '-top-1 -left-1'
  if (pos === 'bottom-left') return '-bottom-1 -left-1'
  if (pos === 'bottom-right') return '-bottom-1 -right-1'
  return '-top-1 -right-1'
})

const levelClass = computed(() => {
  const map: Record<string, string> = {
    danger: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-sky-600 text-white',
  }
  return map[level.value] || map.danger
})

const markStyle = computed(() => {
  const [x, y] = offset.value
  const px = size.value
  const style: Record<string, string> = { ...extraStyle.value }
  if (x || y) style.transform = `translate(${x}px, ${y}px)`
  if (mode.value === 'dot') {
    style.width = `${px}px`
    style.height = `${px}px`
  } else if (mode.value === 'ribbon') {
    style.height = `${px}px`
    style.lineHeight = `${px}px`
    style.fontSize = `${Math.max(10, px)}px`
  } else {
    style.height = `${px + 2}px`
    style.minWidth = `${px + 2}px`
    style.lineHeight = `${px}px`
    style.borderRadius = `${px / 2}px`
    style.fontSize = `${Math.max(10, Math.round(px * 0.7))}px`
  }
  return style
})
</script>

<template>
  <slot v-if="!show" />
  <span v-else class="relative inline-flex" data-vamis-badge-host>
    <slot />
    <span
      v-if="mode === 'ribbon'"
      data-vamis-badge
      class="pointer-events-none absolute z-10 overflow-hidden"
      :class="[cornerClass, extraClass]"
      :style="{ width: `${size * 2.2}px`, height: `${size * 2.2}px` }"
    >
      <span
        class="absolute top-[18%] w-[140%] text-center font-medium"
        :class="[levelClass, place.includes('left') ? '-rotate-45' : 'rotate-45']"
        :style="markStyle"
      >
        {{ mark }}
      </span>
    </span>
    <span
      v-else
      data-vamis-badge
      class="absolute z-10 flex items-center justify-center"
      :class="[
        cornerClass,
        extraClass,
        levelClass,
        mode === 'dot' ? 'rounded-full' : 'rounded-full px-1 text-[10px] leading-none',
      ]"
      :style="markStyle"
    >
      <template v-if="mode !== 'dot'">{{ mark }}</template>
      <span
        v-if="pulse"
        class="absolute inset-0 animate-ping rounded-full border border-current opacity-60"
        aria-hidden="true"
      />
    </span>
  </span>
</template>
