<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  avatarAlt,
  avatarCrossOrigin,
  avatarDraggable,
  avatarFit,
  avatarGap,
  avatarIcon,
  avatarIconKind,
  avatarIconSizePx,
  avatarKeepImageAfterError,
  avatarRadius,
  avatarSizePx,
  avatarSrc,
  avatarText,
  avatarTextScale,
  resolveInlineStyle,
  useData,
  useEnv,
  type SchemaObject,
} from '@vamis/core'
import BadgeHost from './BadgeHost.vue'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, unknown>
  disabled?: boolean
}>()
const env = useEnv()
const parentData = useData()
const data = computed(() => {
  const own = props.schema.data
  if (!own || typeof own !== 'object' || Array.isArray(own)) return parentData.value
  return { ...parentData.value, ...(own as Record<string, unknown>) }
})

const src = computed(() => avatarSrc(props.schema, data.value))
const text = computed(() => avatarText(props.schema, data.value))
const icon = computed(() => avatarIcon(props.schema, data.value))
const alt = computed(() => avatarAlt(props.schema, data.value))
const size = computed(() => avatarSizePx(props.schema))
const fit = computed(() => avatarFit(props.schema))
const gap = computed(() => avatarGap(props.schema))
const radius = computed(() => avatarRadius(props.schema))
const draggable = computed(() => avatarDraggable(props.schema))
const crossOrigin = computed(() => avatarCrossOrigin(props.schema))
const iconPx = computed(() => avatarIconSizePx(props.schema))
const iconIsUrl = computed(() => avatarIconKind(icon.value) === 'url')
const paint = computed(() => resolveInlineStyle(props.schema.style, data.value))

const showImg = ref(true)
watch(
  src,
  (value) => {
    showImg.value = Boolean(value)
  },
  { immediate: true },
)

const view = computed(() => {
  if (src.value && showImg.value) return 'src'
  if (text.value) return 'text'
  return 'icon'
})

const frameRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const scale = ref(1)

function setScaleByGap() {
  const node = frameRef.value
  const child = textRef.value
  if (!node || !child) {
    scale.value = 1
    return
  }
  scale.value = avatarTextScale(node.offsetWidth, child.offsetWidth, gap.value)
}

let ro: ResizeObserver | null = null
onMounted(() => {
  ro = new ResizeObserver(() => setScaleByGap())
  if (frameRef.value) ro.observe(frameRef.value)
  void nextTick(setScaleByGap)
})
onBeforeUnmount(() => {
  ro?.disconnect()
})
watch([() => view.value, text, gap, size], () => {
  void nextTick(setScaleByGap)
})

function onImgError(event: Event) {
  showImg.value = avatarKeepImageAfterError(props.schema, env.trusted === true, event)
}

const frameStyle = computed(() => ({
  width: `${size.value}px`,
  height: `${size.value}px`,
  lineHeight: `${size.value}px`,
  borderRadius: radius.value,
  background: paint.value.background || paint.value.backgroundColor || '#d1d5db',
  color: paint.value.color,
}))
</script>

<template>
  <BadgeHost :schema="schema" :data="data">
    <span
      ref="frameRef"
      data-vamis-avatar
      class="relative inline-flex shrink-0 items-center justify-center overflow-hidden text-center [&:hover_i]:scale-110 [&:hover_img]:scale-110"
      :style="frameStyle"
    >
      <img
        v-if="view === 'src'"
        :src="src"
        :alt="alt"
        :draggable="draggable"
        :crossorigin="crossOrigin"
        class="h-full w-full"
        :style="{ objectFit: fit }"
        @error="onImgError"
      />
      <span
        v-else-if="view === 'text'"
        ref="textRef"
        class="absolute left-1/2 whitespace-nowrap"
        :style="{
          transform: `scale(${scale}) translateX(-50%)`,
          transformOrigin: '0 center',
        }"
      >{{ text }}</span>
      <img
        v-else-if="iconIsUrl"
        :src="icon"
        alt=""
        class="h-full w-full object-contain"
      />
      <i
        v-else
        :class="icon"
        aria-hidden="true"
        :style="{ fontSize: `${iconPx}px` }"
      />
    </span>
  </BadgeHost>
</template>
