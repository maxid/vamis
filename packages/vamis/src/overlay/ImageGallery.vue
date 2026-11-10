<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { overlayContainerFrom, overlayIsMobile, useEnv, type ImageToolbarAction } from '@vamis/core'
import { VamisClose, VamisGalleryToolIcon } from '@vamis/ui'

export type ImageGalleryItem = {
  src: string
  originalSrc: string
  title?: string
  caption?: string
}

const props = defineProps<{
  items: ImageGalleryItem[]
  index?: number
  showToolbar?: boolean
  enlargeWithGallary?: boolean
  toolbarActions?: ImageToolbarAction[]
}>()

const emit = defineEmits<{ close: [] }>()
const env = useEnv()
const container = computed(() => overlayContainerFrom(undefined, env) || 'body')
const current = ref(props.index ?? 0)
const scale = ref(1)
const rotate = ref(0)
const tx = ref(0)
const ty = ref(0)
const dragging = ref(false)
const start = { x: 0, y: 0, tx: 0, ty: 0 }
const stage = ref<HTMLElement | null>(null)

const item = computed(() => props.items[current.value] || props.items[0])
const showStrip = computed(
  () => props.items.length > 1 && props.enlargeWithGallary !== false,
)
const actions = computed(() => props.toolbarActions || [])
const imgStyle = computed(() => ({
  transform: `translate(${tx.value}px, ${ty.value}px) scale(${scale.value}) rotate(${rotate.value}deg)`,
}))

function resetView() {
  scale.value = 1
  rotate.value = 0
  tx.value = 0
  ty.value = 0
}

watch(
  () => props.index,
  (next) => {
    current.value = next ?? 0
    resetView()
  },
)

function close() {
  emit('close')
}

function go(next: number) {
  if (next < 0 || next >= props.items.length) return
  current.value = next
  resetView()
}

function onToolbar(action: ImageToolbarAction) {
  if (action.disabled) return
  if (action.key === 'rotateLeft') {
    rotate.value -= 90
    tx.value = 0
    ty.value = 0
    return
  }
  if (action.key === 'rotateRight') {
    rotate.value += 90
    tx.value = 0
    ty.value = 0
    return
  }
  if (action.key === 'zoomIn') {
    scale.value += 0.5
    tx.value = 0
    ty.value = 0
    return
  }
  if (action.key === 'zoomOut') {
    if (scale.value - 0.5 <= 0) return
    scale.value -= 0.5
    tx.value = 0
    ty.value = 0
    return
  }
  if (action.key === 'scaleOrigin') {
    scale.value = 1
    tx.value = 0
    ty.value = 0
  }
}

function onWheel(event: WheelEvent) {
  if (!props.showToolbar) return
  event.preventDefault()
  if (event.deltaY > 0) onToolbar({ key: 'zoomOut' })
  else onToolbar({ key: 'zoomIn' })
}

function onMouseDown(event: MouseEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  dragging.value = true
  start.x = event.clientX
  start.y = event.clientY
  start.tx = tx.value
  start.ty = ty.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(event: MouseEvent) {
  tx.value = start.tx + event.clientX - start.x
  ty.value = start.ty + event.clientY - start.y
}

function onMouseUp() {
  dragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  if (event.key === 'ArrowLeft') go(current.value - 1)
  if (event.key === 'ArrowRight') go(current.value + 1)
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  stage.value?.addEventListener('wheel', onWheel, { passive: false })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  stage.value?.removeEventListener('wheel', onWheel)
})

const mobile = overlayIsMobile(undefined, env)
</script>

<template>
  <Teleport :to="container">
    <div class="vamis-image-gallery" :class="{ 'is-mobile': mobile }" role="dialog" aria-modal="true">
      <div class="vamis-image-gallery__mask" @click="close" />
      <div class="vamis-image-gallery__panel">
        <button
          type="button"
          class="vamis-image-gallery__close"
          data-tooltip="关闭"
          data-position="left"
          aria-label="关闭"
          @click="close"
        >
          <VamisClose />
        </button>
        <div class="vamis-image-gallery__title">{{ item?.title }}</div>
        <div v-if="item?.caption" class="vamis-image-gallery__caption">{{ item.caption }}</div>
        <div
          ref="stage"
          class="vamis-image-gallery__main"
          :class="{ 'is-dragging': dragging }"
          @mousedown="onMouseDown"
        >
          <img v-if="item" draggable="false" :src="item.originalSrc || item.src" :alt="item.title || ''" :style="imgStyle" />
          <div v-if="showToolbar && actions.length" class="vamis-image-gallery__toolbar">
            <button
              v-for="action in actions"
              :key="action.key"
              type="button"
              class="vamis-image-gallery__tool"
              :class="{ 'is-disabled': action.disabled || (action.key === 'zoomOut' && scale - 0.5 <= 0) }"
              :disabled="action.disabled || (action.key === 'zoomOut' && scale - 0.5 <= 0)"
              :aria-label="action.label || action.key"
              :data-tooltip="action.label || action.key"
              data-position="top"
              @click="onToolbar(action)"
            >
              <span class="vamis-image-gallery__tool-icon" :class="action.iconClassName">
                <VamisGalleryToolIcon :name="action.icon || action.key" />
              </span>
            </button>
          </div>
          <button
            v-if="showStrip"
            type="button"
            class="vamis-image-gallery__nav is-prev"
            :class="{ 'is-disabled': current <= 0 }"
            :disabled="current <= 0"
            aria-label="上一张"
            @click="go(current - 1)"
          >
            ‹
          </button>
          <button
            v-if="showStrip"
            type="button"
            class="vamis-image-gallery__nav is-next"
            :class="{ 'is-disabled': current >= items.length - 1 }"
            :disabled="current >= items.length - 1"
            aria-label="下一张"
            @click="go(current + 1)"
          >
            ›
          </button>
        </div>
        <div v-if="showStrip" class="vamis-image-gallery__footer">
          <button
            v-for="(thumb, i) in items"
            :key="i"
            type="button"
            class="vamis-image-gallery__thumb"
            :class="{ 'is-active': i === current }"
            @click="go(i)"
          >
            <img :src="thumb.src" alt="" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
