<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, resolveIcon, type SchemaObject } from '@vamis/core'
import IconMark from './IconMark.vue'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const data = computed(() => props.data || {})

const DEFAULTS: Record<string, { label: string; icon: string; color: string }> = {
  '0': { label: '失败', icon: 'fail', color: 'var(--destructive)' },
  '1': { label: '成功', icon: 'success', color: 'var(--success)' },
  success: { label: '成功', icon: 'success', color: 'var(--success)' },
  pending: { label: '运行中', icon: 'rolling', color: 'var(--primary)' },
  queue: { label: '排队中', icon: 'warning', color: 'var(--warning)' },
  schedule: { label: '调度中', icon: 'schedule', color: 'var(--info)' },
  fail: { label: '失败', icon: 'fail', color: 'var(--destructive)' },
  warning: { label: '警告', icon: 'warning', color: 'var(--warning)' },
  info: { label: '信息', icon: 'info', color: 'var(--info)' },
}
const ICONS: Record<string, string> = {
  success: 'fa fa-check-circle',
  fail: 'fa fa-times-circle',
  warning: 'fa fa-exclamation-circle',
  rolling: 'fa fa-spinner',
  schedule: 'fa fa-clock',
  info: 'fa fa-info-circle',
  'fa fa-times-circle': 'fa fa-times-circle',
}

const raw = computed(() => {
  const value = props.schema.value
  if (value != null) return value
  return props.schema.name ? data.value[String(props.schema.name)] : undefined
})
const key = computed(() => (raw.value == null ? '' : String(raw.value)))

function customOf(source: Record<string, unknown>, value: string) {
  return source[value] && typeof source[value] === 'object' ? (source[value] as Record<string, unknown>) : undefined
}

const source = computed(() => {
  const rawSource = props.schema.source
  if (!rawSource || typeof rawSource !== 'object' || Array.isArray(rawSource)) return {}
  return rawSource as Record<string, unknown>
})
const custom = computed(() => customOf(source.value, key.value))

const label = computed(() => {
  const sourceLabel = custom.value?.label
  if (sourceLabel != null) return filterTpl(String(sourceLabel), data.value)
  const labelMap = props.schema.labelMap
  if (labelMap && typeof labelMap === 'object' && key.value in (labelMap as Record<string, unknown>)) {
    return filterTpl(String((labelMap as Record<string, unknown>)[key.value]), data.value)
  }
  return DEFAULTS[key.value]?.label ?? (raw.value == null || raw.value === '' ? '' : key.value)
})
const icon = computed(() => {
  const customIcon = custom.value?.icon
  if (customIcon != null) return resolveIcon(String(customIcon), { vendor: 'fa' })
  const map = props.schema.map
  const mapped = map && typeof map === 'object' ? (map as Record<string, unknown>)[key.value] : undefined
  if (mapped != null) return resolveIcon(String(mapped), { vendor: 'fa' })
  const def = DEFAULTS[key.value]?.icon
  return def ? resolveIcon(ICONS[def] || def, { vendor: 'fa' }) : null
})
const color = computed(() => {
  const customColor = custom.value?.color
  if (customColor != null) return String(customColor)
  return DEFAULTS[key.value]?.color
})
const className = computed(() => (custom.value?.className != null ? String(custom.value.className) : ''))
const placeholder = computed(() => String(props.schema.placeholder ?? '-'))
const empty = computed(() => !label.value && !icon.value)
</script>

<template>
  <span class="vamis-status inline-flex items-center gap-1 text-sm" :class="className" :style="color ? { color } : undefined">
    <IconMark v-if="icon" :icon="icon" img-class="inline-block size-3.5" />
    <span v-if="label">{{ label }}</span>
    <span v-else-if="empty" class="text-muted-foreground">{{ placeholder }}</span>
  </span>
</template>
