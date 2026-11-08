<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { POPUP_DEFAULT_HEIGHT, resolveOverlayContainer, type OverlayContainer } from '@vamis/core'

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    container?: OverlayContainer
    showConfirm?: boolean
    /** 底栏高度。默认 400（Amis `.PopUp`）；Select 传 320（`.Select-popup`）。 */
    height?: number | string
  }>(),
  { title: '', showConfirm: true, height: POPUP_DEFAULT_HEIGHT },
)

const emit = defineEmits<{ cancel: []; confirm: [] }>()

const target = computed(() => resolveOverlayContainer(props.container))
const visible = ref(false)
const phase = ref<'in' | 'out' | ''>('')
const heightStyle = computed(() => {
  const h = props.height
  if (h == null || h === '') return undefined
  return { height: typeof h === 'number' ? `${h}px` : String(h) }
})

let leaveTimer: ReturnType<typeof setTimeout> | undefined
let prevOverflow = ''

function clearLeaveTimer() {
  if (!leaveTimer) return
  clearTimeout(leaveTimer)
  leaveTimer = undefined
}

function lockScroll(lock: boolean) {
  if (typeof document === 'undefined') return
  if (lock) {
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return
  }
  document.body.style.overflow = prevOverflow
}

function hide() {
  clearLeaveTimer()
  visible.value = false
  phase.value = ''
  lockScroll(false)
}

function onPanelAnimEnd(event: AnimationEvent) {
  if (event.target !== event.currentTarget) return
  if (phase.value === 'out') hide()
  else if (phase.value === 'in') phase.value = ''
}

watch(
  () => props.show,
  (show) => {
    clearLeaveTimer()
    if (show) {
      visible.value = true
      phase.value = 'in'
      lockScroll(true)
      return
    }
    if (!visible.value) return
    phase.value = 'out'
    // 对齐 Amis PopUp Transition timeout 500；CSS 实际是 --animation-duration 0.2s。
    leaveTimer = setTimeout(hide, 500)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearLeaveTimer()
  if (visible.value) lockScroll(false)
})
</script>

<template>
  <Teleport :to="target">
    <div
      v-if="visible"
      class="vamis-popup"
      :class="{ 'is-in': phase === 'in', 'is-out': phase === 'out' }"
      :style="heightStyle"
      role="dialog"
      aria-modal="true"
      @animationend="onPanelAnimEnd"
    >
      <div class="vamis-popup__mask" @click="emit('cancel')" />
      <div class="vamis-popup__inner">
        <div v-if="showConfirm" class="vamis-popup__bar">
          <button type="button" class="vamis-popup__cancel" @click="emit('cancel')">取消</button>
          <div class="vamis-popup__title">{{ title }}</div>
          <button type="button" class="vamis-popup__ok" @click="emit('confirm')">确认</button>
        </div>
        <div class="vamis-popup__body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
