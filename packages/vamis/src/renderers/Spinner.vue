<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  SchemaRenderer,
  resolveClassName,
  spinnerBody,
  spinnerDelay,
  spinnerIconSrc,
  spinnerOverlay,
  spinnerShow,
  spinnerSize,
  spinnerTip,
  spinnerTipPlacement,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, unknown>
  disabled?: boolean
}>()
const data = useData()
const spinning = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const body = computed(() => spinnerBody(props.schema))
const tip = computed(() => spinnerTip(props.schema, data.value))
const overlay = computed(() => spinnerOverlay(props.schema))
const place = computed(() => spinnerTipPlacement(props.schema))
const iconSrc = computed(() => spinnerIconSrc(props.schema))
const asContainer = computed(() => body.value.length > 0)
const iconClass = computed(() => resolveClassName(props.schema.spinnerClassName, data.value))
const wrapClass = computed(() => resolveClassName(props.schema.spinnerWrapClassName, data.value))
const sizeClass = computed(() => {
  const size = spinnerSize(props.schema)
  if (size === 'sm') return 'h-4 w-4'
  if (size === 'lg') return 'h-12 w-12'
  return 'h-8 w-8'
})
const placeClass = computed(() => {
  const map: Record<string, string> = {
    top: 'flex-col-reverse',
    right: 'flex-row',
    bottom: 'flex-col',
    left: 'flex-row-reverse',
  }
  return map[place.value] || map.bottom
})
const tipSpace = computed(() => {
  const map: Record<string, string> = {
    top: 'mb-3',
    right: 'ml-3',
    bottom: 'mt-3',
    left: 'mr-3',
  }
  return map[place.value] || map.bottom
})

function clearTimer() {
  if (timer) clearTimeout(timer)
  timer = null
}

watch(
  () => [spinnerShow(props.schema, data.value), spinnerDelay(props.schema)] as const,
  ([show, delay]) => {
    clearTimer()
    if (!show) {
      spinning.value = false
      return
    }
    if (delay <= 0) {
      spinning.value = true
      return
    }
    spinning.value = false
    timer = setTimeout(() => {
      spinning.value = true
    }, delay)
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimer())
</script>

<template>
  <div
    v-if="asContainer"
    data-vamis-spinner
    class="relative h-full w-full"
    :class="wrapClass"
  >
    <div
      v-if="spinning && overlay"
      class="absolute inset-0 z-[10] bg-white/10 backdrop-blur-[1px]"
    />
    <div
      v-if="spinning"
      class="absolute left-1/2 top-1/2 z-[11] inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      :class="placeClass"
    >
      <img v-if="iconSrc" :src="iconSrc" alt="" :class="['object-contain', sizeClass, iconClass]" />
      <span
        v-else
        class="inline-block animate-spin rounded-full border-2 border-primary border-t-transparent"
        :class="[sizeClass, iconClass]"
      />
      <span v-if="tip" class="whitespace-nowrap text-xs text-primary" :class="tipSpace">{{ tip }}</span>
    </div>
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
  </div>
  <div
    v-else-if="spinning"
    data-vamis-spinner
    class="inline-flex items-center justify-center"
    :class="placeClass"
  >
    <img v-if="iconSrc" :src="iconSrc" alt="" :class="['object-contain', sizeClass, iconClass]" />
    <span
      v-else
      class="inline-block animate-spin rounded-full border-2 border-primary border-t-transparent"
      :class="[sizeClass, iconClass]"
    />
    <span v-if="tip" class="whitespace-nowrap text-xs text-primary" :class="tipSpace">{{ tip }}</span>
  </div>
</template>
