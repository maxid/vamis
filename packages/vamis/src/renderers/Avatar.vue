<script setup lang="ts">
import { computed } from 'vue'
import {
  avatarAlt,
  avatarDraggable,
  avatarFit,
  avatarGap,
  avatarKind,
  avatarRadius,
  avatarSizePx,
  avatarSrc,
  avatarText,
  badgeMode,
  badgePosition,
  badgeText,
  badgeVisible,
  useData,
  type SchemaObject,
} from '@vamis/core'
import { CircleUserRoundIcon } from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, unknown>
  disabled?: boolean
}>()
const parentData = useData()
const data = computed(() => {
  const own = props.schema.data
  if (!own || typeof own !== 'object' || Array.isArray(own)) return parentData.value
  return { ...parentData.value, ...(own as Record<string, unknown>) }
})

const kind = computed(() => avatarKind(props.schema, data.value))
const src = computed(() => avatarSrc(props.schema, data.value))
const text = computed(() => avatarText(props.schema, data.value))
const alt = computed(() => avatarAlt(props.schema, data.value))
const size = computed(() => avatarSizePx(props.schema))
const fit = computed(() => avatarFit(props.schema))
const gap = computed(() => avatarGap(props.schema))
const radius = computed(() => avatarRadius(props.schema))
const draggable = computed(() => avatarDraggable(props.schema))
const showBadge = computed(() => badgeVisible(props.schema))
const mark = computed(() => badgeText(props.schema, data.value))
const mode = computed(() => badgeMode(props.schema))
const place = computed(() => badgePosition(props.schema))

const frameStyle = computed(() => ({
  width: `${size.value}px`,
  height: `${size.value}px`,
  lineHeight: `${size.value}px`,
  borderRadius: radius.value,
  fontSize: `${Math.max(10, Math.round(size.value * 0.4))}px`,
}))

const badgeClass = computed(() => {
  const pos = place.value
  const corner =
    pos === 'top-left'
      ? '-top-1 -left-1'
      : pos === 'bottom-left'
        ? '-bottom-1 -left-1'
        : pos === 'bottom-right'
          ? '-bottom-1 -right-1'
          : '-top-1 -right-1'
  return corner
})
</script>

<template>
  <span class="relative inline-flex shrink-0" :style="{ width: frameStyle.width, height: frameStyle.height }">
    <span
      data-vamis-avatar
      class="inline-flex size-full items-center justify-center overflow-hidden bg-muted text-center font-medium"
      :style="frameStyle"
    >
      <img
        v-if="kind === 'src'"
        :src="src"
        :alt="alt"
        :draggable="draggable"
        class="h-full w-full"
        :style="{ objectFit: fit }"
      />
      <span v-else-if="kind === 'text'" class="block max-w-full truncate" :style="{ paddingInline: `${gap}px` }">{{
        text
      }}</span>
      <CircleUserRoundIcon v-else class="opacity-80" :style="{ width: `${size * 0.45}px`, height: `${size * 0.45}px` }" />
    </span>
    <span
      v-if="showBadge"
      data-vamis-badge
      class="absolute z-10 flex items-center justify-center bg-destructive text-destructive-foreground"
      :class="[
        badgeClass,
        mode === 'dot' ? 'size-2 rounded-full' : 'h-4 min-w-4 rounded-full px-1 text-[10px] leading-none',
      ]"
    >
      <template v-if="mode !== 'dot'">{{ mark }}</template>
    </span>
  </span>
</template>
