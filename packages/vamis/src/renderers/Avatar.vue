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
  useData,
  type SchemaObject,
} from '@vamis/core'
import { CircleUserRoundIcon } from '@vamis/ui'
import BadgeHost from './BadgeHost.vue'

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

const frameStyle = computed(() => ({
  width: `${size.value}px`,
  height: `${size.value}px`,
  lineHeight: `${size.value}px`,
  borderRadius: radius.value,
  fontSize: `${Math.max(10, Math.round(size.value * 0.4))}px`,
}))
</script>

<template>
  <BadgeHost :schema="schema" :data="data">
    <span
      data-vamis-avatar
      class="inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted text-center font-medium"
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
  </BadgeHost>
</template>
