<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { eachResolvedValue, filterTpl, resolveValue, useData, useScoped, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data?: Record<string, any> }>()
const viewData = useData()
const scoped = useScoped()
const data = computed(() => ({ ...viewData.value, ...(props.data || {}) }))
const override = ref<number | null>(null)

const value = computed(() => {
  const fromProp = eachResolvedValue(props.schema, data.value)
  const raw = override.value != null ? override.value : resolveValue(fromProp ?? 0, data.value)
  const n = Number(raw)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
})
const mode = computed(() => {
  const raw = String(props.schema.mode || 'line')
  return raw === 'circle' || raw === 'dashboard' ? raw : 'line'
})
const strokeWidth = computed(() => {
  const n = Number(props.schema.strokeWidth)
  return Number.isFinite(n) && n > 0 ? n : mode.value === 'line' ? 8 : 8
})
const showLabel = computed(() => props.schema.showLabel !== false)
const label = computed(() => {
  if (!showLabel.value) return ''
  if (props.schema.valueTpl != null) return filterTpl(String(props.schema.valueTpl), { ...data.value, value: value.value })
  return `${Math.round(value.value)}%`
})
/** 对齐 Amis Progress defaultProps.map；`bg-*` 是 class 名，转成 token 当 bar 底。 */
const DEFAULT_MAP = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success', 'bg-success']
const BG_COLORS: Record<string, string> = {
  'bg-danger': 'var(--destructive)',
  'bg-warning': 'var(--warning)',
  'bg-info': 'var(--info)',
  'bg-success': 'var(--success)',
  'bg-primary': 'var(--primary)',
}
function resolveBarColor(raw: string) {
  return BG_COLORS[raw] || raw
}
const color = computed(() => {
  const map = props.schema.map == null ? DEFAULT_MAP : props.schema.map
  if (typeof map === 'string' && map) return resolveBarColor(map)
  if (Array.isArray(map)) {
    const numeric = map.filter((item) => item && typeof item === 'object') as Array<Record<string, unknown>>
    if (numeric.length) {
      const hit = [...numeric].sort((a, b) => Number(a.value) - Number(b.value)).find((item) => value.value <= Number(item.value))
      if (hit && typeof hit.color === 'string') return resolveBarColor(hit.color)
    }
    const strings = map.filter((item): item is string => typeof item === 'string')
    if (strings.length) {
      const idx = Math.min(strings.length - 1, Math.floor(value.value / (100 / strings.length)))
      return resolveBarColor(strings[idx])
    }
  }
  return 'var(--primary)'
})
const gapDegree = computed(() => {
  if (mode.value !== 'dashboard') return 0
  const n = Number(props.schema.gapDegree)
  return Number.isFinite(n) && n >= 0 ? n : 75
})
const radius = 40
const circumference = 2 * Math.PI * radius
const arcLength = computed(() => circumference * (1 - gapDegree.value / 360))
const dashOffset = computed(() => arcLength.value * (1 - value.value / 100))
const rotation = computed(() => (gapDegree.value ? 90 + gapDegree.value / 2 : -90))
const svgSize = 100
const thresholds = computed(() => {
  const raw = props.schema.threshold
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const rec = item as Record<string, unknown>
      const value = String(rec.value ?? '').replace('%', '')
      const n = Number(value)
      if (!Number.isFinite(n)) return null
      return { value: Math.min(100, Math.max(0, n)), color: String(rec.color || 'var(--foreground)') }
    })
    .filter(Boolean) as Array<{ value: number; color: string }>
})
const showThresholdText = computed(() => props.schema.showThresholdText === true)
const stripe = computed(() => props.schema.stripe === true)
const animate = computed(() => props.schema.animate !== false)

const progressApi = {
  name: String(props.schema.id || props.schema.name || ''),
  id: props.schema.id ? String(props.schema.id) : undefined,
  getData: () => ({ value: value.value }),
  setData(values: Record<string, unknown>) {
    if (values && 'value' in values) override.value = Number(values.value)
  },
  async doAction(action: { actionType?: string; value?: unknown; args?: { value?: unknown } }) {
    if (action?.actionType === 'reset') override.value = 0
    else if (action?.actionType === 'setValue') override.value = Number(action.args?.value ?? action.value)
  },
}
scoped?.register(progressApi as never)
onBeforeUnmount(() => scoped?.unregister(progressApi as never))
</script>

<template>
  <div data-vamis-progress class="vamis-progress" :data-mode="mode">
    <template v-if="mode === 'line'">
      <div class="vamis-progress__line">
        <span
          v-for="(item, i) in thresholds"
          :key="i"
          class="vamis-progress__threshold"
          :style="{ left: `${item.value}%`, borderColor: item.color }"
        >
          <span v-if="showThresholdText" class="vamis-progress__threshold-text">{{ item.value }}%</span>
        </span>
        <div class="vamis-progress__inter">
          <div
            class="vamis-progress__bar"
            :class="{ 'vamis-progress__stripe': stripe, 'vamis-progress__animate': animate }"
            :style="{ width: `${value}%`, height: `${strokeWidth}px`, background: color }"
            :title="`${Math.round(value)}%`"
          />
        </div>
      </div>
      <span v-if="showLabel" class="vamis-progress__text">{{ label }}</span>
    </template>
    <template v-else>
      <div class="relative" :style="{ width: `${svgSize + 8}px`, height: `${svgSize + 8}px` }">
        <svg :viewBox="`0 0 ${svgSize} ${svgSize}`" class="size-full" :style="{ transform: `rotate(${rotation}deg)` }">
          <circle :cx="svgSize / 2" :cy="svgSize / 2" :r="radius" fill="none" stroke="var(--muted)" :stroke-width="strokeWidth" />
          <circle
            :cx="svgSize / 2"
            :cy="svgSize / 2"
            :r="radius"
            fill="none"
            :stroke="color"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcLength} ${circumference}`"
            :stroke-dashoffset="dashOffset"
            :style="{ transition: animate ? 'stroke-dashoffset 0.3s ease' : undefined }"
          />
        </svg>
        <span v-if="showLabel" class="absolute inset-0 flex items-center justify-center text-sm">{{ label }}</span>
      </div>
    </template>
  </div>
</template>
