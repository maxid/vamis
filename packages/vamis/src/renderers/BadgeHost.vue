<script setup lang="ts">
import { computed } from 'vue'
import {
  badgeAnimation,
  badgeClassName,
  badgeDisplayText,
  badgeLevel,
  badgeMode,
  badgeOffsetStyle,
  badgePosition,
  badgeRibbonOutSize,
  badgeSizePx,
  badgeStyle,
  badgeVisible,
  hasBadge,
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
const present = computed(() => hasBadge(props.schema))
const show = computed(() => badgeVisible(props.schema, data.value))
const mode = computed(() => badgeMode(props.schema))
const mark = computed(() => badgeDisplayText(props.schema, data.value))
const place = computed(() => badgePosition(props.schema))
const level = computed(() => badgeLevel(props.schema, data.value))
const size = computed(() => badgeSizePx(props.schema))
const pulse = computed(() => badgeAnimation(props.schema) && mode.value === 'dot')
const extraClass = computed(() => resolveClassName(badgeClassName(props.schema), data.value))
const extraStyle = computed(() => resolveInlineStyle(badgeStyle(props.schema), data.value))
const outSize = computed(() => badgeRibbonOutSize(props.schema))

const sizeStyle = computed(() => {
  const px = size.value
  if (mode.value === 'dot') return { width: `${px}px`, height: `${px}px` }
  if (mode.value === 'ribbon') {
    return { height: `${px}px`, lineHeight: `${px}px`, fontSize: `${px}px` }
  }
  return {
    borderRadius: `${px / 2}px`,
    height: `${px + 2}px`,
    lineHeight: `${px}px`,
  }
})

const markStyle = computed(() => ({
  ...badgeOffsetStyle(props.schema),
  ...sizeStyle.value,
  ...extraStyle.value,
}))

const animBorder = computed(() => {
  const bg = extraStyle.value.background || extraStyle.value.backgroundColor
  return bg || 'var(--badge-danger-bg)'
})
</script>

<template>
  <slot v-if="!present" />
  <span v-else class="vamis-badge" :class="extraClass" data-vamis-badge-host>
    <slot />
    <span
      v-if="show && mode === 'ribbon'"
      data-vamis-badge
      class="vamis-badge__ribbon-out"
      :class="`vamis-badge__ribbon-out--${place}`"
      :style="{ width: `${outSize}px`, height: `${outSize}px` }"
    >
      <span
        class="vamis-badge__ribbon"
        :class="[`vamis-badge__ribbon--${place}`, `vamis-badge--${level}`]"
        :style="markStyle"
      >
        {{ mark }}
      </span>
    </span>
    <span
      v-else-if="show"
      data-vamis-badge
      :class="[`vamis-badge__${mode}`, `vamis-badge--${place}`, `vamis-badge--${level}`]"
      :style="markStyle"
    >
      <template v-if="mode === 'text'">{{ mark }}</template>
      <span
        v-if="pulse"
        class="vamis-badge__anim"
        :style="{ borderColor: animBorder }"
        aria-hidden="true"
      />
    </span>
  </span>
</template>
