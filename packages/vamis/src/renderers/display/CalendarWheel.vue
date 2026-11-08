<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  CALENDAR_PICKER_ITEM_HEIGHT as ITEM,
  CALENDAR_PICKER_VISIBLE as VISIBLE,
  type CalendarPickerOption,
} from '@vamis/core'

const props = defineProps<{
  options: CalendarPickerOption[]
  modelValue: number
}>()

const emit = defineEmits<{ 'update:modelValue': [number] }>()

const baseOffset = (ITEM * (VISIBLE - 1)) / 2
const index = computed(() => {
  const i = props.options.findIndex((item) => item.value === props.modelValue)
  return i < 0 ? 0 : i
})
const offset = ref(-index.value * ITEM)
const duration = ref(0)
let dragging = false
let dragged = false
let skipClick = false
let startY = 0
let startOffset = 0

watch(
  () => props.modelValue,
  () => {
    if (dragging) return
    duration.value = 200
    offset.value = -index.value * ITEM
  },
)

function snap(next: number) {
  const i = Math.min(props.options.length - 1, Math.max(0, next))
  duration.value = 200
  offset.value = -i * ITEM
  const item = props.options[i]
  if (item && item.value !== props.modelValue) emit('update:modelValue', item.value)
}

/** 对齐 Amis PickerColumn：鼠标滚轮不改值，只挡住页面跟着滚。 */
function onWheel(event: WheelEvent) {
  event.preventDefault()
}

/** 对齐 Amis：只有 touch 能拖；鼠标左键拖不动，只能点 li。 */
function onPointerDown(event: PointerEvent) {
  if (event.pointerType !== 'touch') return
  dragging = true
  dragged = false
  startY = event.clientY
  startOffset = offset.value
  duration.value = 0
}

function onPointerMove(event: PointerEvent) {
  if (!dragging) return
  const delta = event.clientY - startY
  if (Math.abs(delta) > 4) {
    if (!dragged) {
      dragged = true
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    }
    offset.value = startOffset + delta
  }
}

function onPointerUp(event: PointerEvent) {
  if (!dragging) return
  dragging = false
  const el = event.currentTarget as HTMLElement
  if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
  if (dragged) {
    skipClick = true
    snap(Math.round(-offset.value / ITEM))
    setTimeout(() => {
      skipClick = false
    }, 0)
  }
}

function onItemClick(i: number) {
  if (skipClick) return
  snap(i)
}
</script>

<template>
  <div
    class="vamis-cal-wheel"
    @wheel.prevent="onWheel"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <ul
      class="vamis-cal-wheel-list"
      :style="{
        transform: `translate3d(0, ${offset + baseOffset}px, 0)`,
        transitionDuration: `${duration}ms`,
      }"
    >
      <li
        v-for="(item, i) in options"
        :key="item.value"
        class="vamis-cal-wheel-item"
        :class="{ 'is-on': i === index }"
        @click="onItemClick(i)"
      >{{ item.text }}</li>
    </ul>
  </div>
</template>

<style scoped>
.vamis-cal-wheel {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}
.vamis-cal-wheel-list {
  margin: 0;
  padding: 0;
  list-style: none;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.23, 1, 0.68, 1);
}
.vamis-cal-wheel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  line-height: 48px;
  font-size: 16px;
  font-weight: 400;
  color: var(--cal-fg, var(--foreground));
  cursor: pointer;
}
.vamis-cal-wheel-item.is-on {
  color: var(--cal-picker-title, var(--foreground));
}
</style>
