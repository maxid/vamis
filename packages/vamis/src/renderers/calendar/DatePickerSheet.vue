<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  CALENDAR_PICKER_ITEM_HEIGHT,
  CALENDAR_PICKER_VISIBLE,
  resolveOverlayContainer,
  type CalendarPickerOption,
} from '@vamis/core'
import CalendarWheel from '../display/CalendarWheel.vue'
import PickerFade from './PickerFade.vue'

const props = defineProps<{
  show: boolean
  title: string
  columns: CalendarPickerOption[][]
  values: number[]
  container?: string | HTMLElement | null
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
  'update:values': [number[]]
}>()

const pickerHeight = CALENDAR_PICKER_ITEM_HEIGHT * CALENDAR_PICKER_VISIBLE
const target = computed(() => resolveOverlayContainer(props.container))
const visible = ref(false)
const phase = ref<'in' | 'out' | ''>('')

let leaveTimer: ReturnType<typeof setTimeout> | undefined
let prevOverflow = ''

function onCol(index: number, value: number) {
  const next = props.values.slice()
  next[index] = value
  emit('update:values', next)
}

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
      class="vamis-date-sheet"
      :class="{ 'is-in': phase === 'in', 'is-out': phase === 'out' }"
      role="presentation"
    >
      <div class="vamis-date-sheet__mask" @click="emit('cancel')" />
      <div
        class="vamis-date-sheet__panel"
        role="dialog"
        aria-modal="true"
        @animationend="onPanelAnimEnd"
      >
        <div class="vamis-date-sheet__bar">
          <button type="button" class="vamis-date-sheet__cancel" @click="emit('cancel')">取消</button>
          <div class="vamis-date-sheet__title">{{ title }}</div>
          <button type="button" class="vamis-date-sheet__ok" @click="emit('confirm')">确认</button>
        </div>
        <div class="vamis-date-sheet__columns" :style="{ height: `${pickerHeight}px` }">
          <CalendarWheel
            v-for="(col, i) in columns"
            :key="i"
            :model-value="values[i] ?? col[0]?.value ?? 0"
            :options="col"
            @update:model-value="onCol(i, $event)"
          />
          <PickerFade class="vamis-date-sheet__fade" />
          <div class="vamis-date-sheet__frame" :style="{ height: `${CALENDAR_PICKER_ITEM_HEIGHT}px` }" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
