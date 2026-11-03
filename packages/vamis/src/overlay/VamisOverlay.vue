<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
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
  }>(),
  { gap: 2 },
)

const emit = defineEmits<{ outside: []; placed: [] }>()

const layerEl = ref<HTMLElement | null>(null)
const coords = ref({ top: 0, left: 0 })
const to = computed(() => resolveOverlayContainer(props.container))

function place() {
  const el = props.target
  if (!el) return
  const width = layerEl.value?.offsetWidth
  coords.value = overlayPosition(el, { gap: props.gap, width })
}

async function placeAfterPaint() {
  if (!props.show) return
  await nextTick()
  place()
  await nextTick()
  place()
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
  () => [props.show, props.target, props.container] as const,
  () => {
    void placeAfterPaint()
  },
  { immediate: true },
)

if (typeof document !== 'undefined') {
  document.addEventListener('mousedown', onDocPointer, true)
  window.addEventListener('resize', onReposition)
  window.addEventListener('scroll', onReposition, true)
}

onBeforeUnmount(() => {
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
      data-vamis-overlay-layer
      :style="{ top: `${coords.top}px`, left: `${coords.left}px` }"
      @mousedown.stop
    >
      <slot />
    </div>
  </Teleport>
</template>
