<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

const props = withDefaults(
  defineProps<{
    target?: HTMLElement | null
    minThumbSize?: number
  }>(),
  {
    minThumbSize: 24,
  },
)

const trackEl = ref<HTMLElement | null>(null)
const thumbEl = ref<HTMLElement | null>(null)
const visible = ref(false)
const thumbSize = ref(0)
const thumbOffset = ref(0)
const maxScroll = ref(0)
const currentScroll = ref(0)

const thumbStyle = computed(() => ({
  height: `${thumbSize.value}px`,
  transform: `translateY(${thumbOffset.value}px)`,
}))

let boundTarget: HTMLElement | null = null
let resizeObserver: ResizeObserver | undefined
let mutationObserver: MutationObserver | undefined
let observedContent: Element | null = null
let measureFrame = 0
let measureTimer: ReturnType<typeof setTimeout> | undefined
let dragStartY = 0
let dragStartScroll = 0
let dragging = false

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function measure() {
  const target = props.target
  if (!target) {
    visible.value = false
    thumbSize.value = 0
    thumbOffset.value = 0
    maxScroll.value = 0
    currentScroll.value = 0
    return
  }

  const viewport = Math.max(0, target.clientHeight)
  const trackHeight = Math.max(0, trackEl.value?.clientHeight || viewport)
  const content = Math.max(viewport, target.scrollHeight)
  const overflow = trackHeight > 0 && content - viewport > 1

  visible.value = overflow
  maxScroll.value = Math.max(0, content - viewport)
  currentScroll.value = clamp(target.scrollTop, 0, maxScroll.value)

  if (!overflow) {
    thumbSize.value = 0
    thumbOffset.value = 0
    return
  }

  const size = Math.min(
    trackHeight,
    Math.max(props.minThumbSize, Math.round((trackHeight * viewport) / content)),
  )
  const travel = Math.max(0, trackHeight - size)
  const progress = maxScroll.value > 0 ? currentScroll.value / maxScroll.value : 0

  thumbSize.value = size
  thumbOffset.value = Math.round(travel * progress * 100) / 100
}

function scheduleMeasure() {
  if (measureFrame || measureTimer) return
  if (typeof requestAnimationFrame === 'function') {
    measureFrame = requestAnimationFrame(() => {
      measureFrame = 0
      measure()
    })
    return
  }
  measureTimer = setTimeout(() => {
    measureTimer = undefined
    measure()
  }, 0)
}

function observeContent(target: HTMLElement) {
  if (!resizeObserver) return
  const content = target.firstElementChild
  if (content === observedContent) return
  if (observedContent) resizeObserver.unobserve(observedContent)
  observedContent = content
  if (content) resizeObserver.observe(content)
}

function cleanupTarget() {
  boundTarget?.removeEventListener('scroll', measure)
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  resizeObserver = undefined
  mutationObserver = undefined
  observedContent = null
  boundTarget = null

  if (measureFrame && typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(measureFrame)
  }
  measureFrame = 0
  if (measureTimer) clearTimeout(measureTimer)
  measureTimer = undefined
  stopDrag()
}

function bindTarget(target: HTMLElement | null | undefined) {
  cleanupTarget()
  boundTarget = target || null
  if (!target) {
    measure()
    return
  }

  target.addEventListener('scroll', measure, { passive: true })
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(target)
    observeContent(target)
  }
  if (typeof MutationObserver !== 'undefined') {
    mutationObserver = new MutationObserver(() => {
      observeContent(target)
      scheduleMeasure()
    })
    mutationObserver.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }
  measure()
}

function scrollToTrackPosition(clientY: number) {
  const target = props.target
  const track = trackEl.value
  if (!target || !track || !visible.value || maxScroll.value <= 0) return
  const rect = track.getBoundingClientRect()
  const size = thumbSize.value
  const travel = Math.max(0, rect.height - size)
  const thumbTop = clientY - rect.top - size / 2
  const progress = travel > 0 ? clamp(thumbTop / travel, 0, 1) : 0
  target.scrollTop = progress * maxScroll.value
  measure()
}

function onTrackPointerDown(event: PointerEvent) {
  if (event.target === thumbEl.value) return
  scrollToTrackPosition(event.clientY)
}

function onThumbPointerDown(event: PointerEvent) {
  const target = props.target
  if (!target || !visible.value) return
  event.preventDefault()
  dragging = true
  dragStartY = event.clientY
  dragStartScroll = target.scrollTop
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopDrag, { once: true })
}

function onPointerMove(event: PointerEvent) {
  const target = props.target
  const track = trackEl.value
  if (!dragging || !target || !track) return
  const travel = Math.max(0, track.clientHeight - thumbSize.value)
  if (travel <= 0 || maxScroll.value <= 0) return
  const next = dragStartScroll + ((event.clientY - dragStartY) / travel) * maxScroll.value
  target.scrollTop = clamp(next, 0, maxScroll.value)
}

function stopDrag() {
  if (!dragging) return
  dragging = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopDrag)
}

watch(() => props.target, bindTarget, { immediate: true, flush: 'post' })

onMounted(measure)
onBeforeUnmount(cleanupTarget)
</script>

<template>
  <div
    ref="trackEl"
    class="vamis-scrollbar"
    :class="{ 'is-visible': visible }"
    data-vamis-scrollbar
    role="scrollbar"
    aria-orientation="vertical"
    aria-valuemin="0"
    :aria-valuemax="maxScroll"
    :aria-valuenow="Math.round(currentScroll)"
    :aria-hidden="visible ? 'false' : 'true'"
    @pointerdown="onTrackPointerDown"
  >
    <div
      ref="thumbEl"
      class="vamis-scrollbar__thumb"
      data-vamis-scrollbar-thumb
      :style="thumbStyle"
      @pointerdown.stop="onThumbPointerDown"
    />
  </div>
</template>
