<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'
import { readRaw } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

const points = computed(() => {
  const raw = readRaw(props.schema, props.data)
  const list = Array.isArray(raw) ? raw : []
  return list.map((item) => {
    if (typeof item === 'number') return item
    if (item && typeof item === 'object' && 'value' in item) return Number((item as any).value) || 0
    return Number(item) || 0
  })
})
const width = computed(() => Number(props.schema.width) || 100)
const height = computed(() => Number(props.schema.height) || 30)
const path = computed(() => {
  if (points.value.length < 2) return ''
  const min = Math.min(...points.value)
  const max = Math.max(...points.value)
  const span = max - min || 1
  const w = width.value
  const h = height.value
  const step = w / (points.value.length - 1)
  return points.value
    .map((value, i) => {
      const x = i * step
      const y = h - ((value - min) / span) * (h - 2) - 1
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
})
const area = computed(() => {
  if (!path.value) return ''
  return `${path.value} L${width.value} ${height.value} L0 ${height.value} Z`
})
</script>

<template>
  <div data-slot="sparkline" class="inline-block">
    <p v-if="points.length < 2" class="text-xs text-muted-foreground">{{ schema.placeholder || '暂无趋势数据' }}</p>
    <svg
      v-else
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      class="overflow-visible"
      role="img"
    >
      <path :d="area" class="fill-primary/15" />
      <path :d="path" class="fill-none stroke-primary" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
    </svg>
  </div>
</template>
