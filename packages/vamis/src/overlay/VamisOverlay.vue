<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  OVERLAY_POPOVER_GAP,
  overlayPosition,
  resolveOverlayContainer,
  type OverlayContainer,
} from '@vamis/core'

const props = withDefaults(
  defineProps<{
    show: boolean
    target?: HTMLElement | null
    container?: OverlayContainer
    gap?: number
    placement?: string
    layerClass?: string
    offset?: [number, number]
  }>(),
  { gap: OVERLAY_POPOVER_GAP, placement: 'auto' },
)

const emit = defineEmits<{ outside: []; placed: [] }>()

const layerEl = ref<HTMLElement | null>(null)
const coords = ref({ top: 0, left: 0 })
const ready = ref(false)
const to = computed(() => resolveOverlayContainer(props.container))
let layerObserver: ResizeObserver | null = null
let targetObserver: ResizeObserver | null = null

function place() {
  const el = props.target
  if (!el) return false
  const layer = layerEl.value
  coords.value = overlayPosition(el, {
    gap: props.gap,
    width: layer?.offsetWidth,
    height: layer?.offsetHeight,
    placement: props.placement,
    offset: props.offset,
  })
  return true
}

async function placeAfterPaint() {
  if (!props.show) {
    ready.value = false
    return
  }
  await nextTick()
  place()
  await nextTick()
  if (place()) ready.value = true
  emit('placed')
}

function onDocPointer(event: MouseEvent) {
  if (!props.show) return
  const node = event.target as Node | null
  if (node && (props.target?.contains(node) || layerEl.value?.contains(node))) return
  emit('outside')
}

function onReposition() {
  if (props.show) place()
}

watch(
  () => [props.show, props.target, props.container, props.placement, props.offset, props.gap] as const,
  () => {
    if (!props.show) ready.value = false
    void placeAfterPaint()
  },
  { immediate: true },
)

watch(layerEl, (el) => {
  layerObserver?.disconnect()
  layerObserver = null
  if (!el || typeof ResizeObserver === 'undefined') return
  layerObserver = new ResizeObserver(() => place())
  layerObserver.observe(el)
})

watch(
  () => [props.show, props.target] as const,
  ([show, target]) => {
    targetObserver?.disconnect()
    targetObserver = null
    if (!show || !target || typeof ResizeObserver === 'undefined') return
    targetObserver = new ResizeObserver(() => place())
    targetObserver.observe(target)
  },
  { immediate: true },
)

if (typeof document !== 'undefined') {
  document.addEventListener('mousedown', onDocPointer, true)
  window.addEventListener('resize', onReposition)
  window.addEventListener('scroll', onReposition, true)
}

onBeforeUnmount(() => {
  layerObserver?.disconnect()
  targetObserver?.disconnect()
  if (typeof document === 'undefined') return
  document.removeEventListener('mousedown', onDocPointer, true)
  window.removeEventListener('resize', onReposition)
  window.removeEventListener('scroll', onReposition, true)
})
</script>

<template>
  <Teleport :to="to">
    <div
      v-if="show"
      ref="layerEl"
      class="vamis-overlay"
      :class="[layerClass, ready ? 'is-placed' : '']"
      data-vamis-overlay-layer
      :style="{ top: `${coords.top}px`, left: `${coords.left}px`, visibility: ready ? 'visible' : 'hidden' }"
      @mousedown.stop
    >
      <slot />
    </div>
  </Teleport>
</template>
