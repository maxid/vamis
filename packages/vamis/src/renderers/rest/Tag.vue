<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, resolveClassName, type SchemaObject } from '@vamis/core'
import { readValue } from './format'

const PRESET = ['inactive', 'active', 'success', 'processing', 'error', 'warning'] as const
type Preset = (typeof PRESET)[number]

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

function asText(raw: unknown): string {
  if (raw == null || raw === '') return ''
  if (typeof raw === 'object') {
    const rec = raw as Record<string, unknown>
    if (rec.label != null) return String(rec.label)
    if (rec.value != null) return String(rec.value)
    return ''
  }
  return String(raw)
}

const label = computed(() => {
  const fromValue = readValue(props.schema, props.data)
  if (fromValue != null && fromValue !== '') return asText(fromValue)
  const raw = props.schema.label
  if (raw == null) return ''
  return typeof raw === 'string' ? filterTpl(raw, props.data) : asText(raw)
})

const displayMode = computed(() => {
  const raw = props.schema.displayMode
  const mode =
    typeof raw === 'string' && raw.includes('${') ? filterTpl(raw, props.data) : raw
  if (mode === 'rounded' || mode === 'status') return mode
  return 'normal'
})

const color = computed(() => {
  const raw = props.schema.color
  if (raw == null || raw === '') return ''
  return typeof raw === 'string' ? filterTpl(String(raw), props.data) : String(raw)
})

const isPreset = computed(() => PRESET.includes(color.value as Preset))
const customColor = computed(() => (color.value && !isPreset.value ? color.value : ''))

const tagStyle = computed(() => {
  const mode = displayMode.value
  const custom = customColor.value
  const style: Record<string, string> = {}
  if (mode === 'normal' && custom) style.backgroundColor = custom
  if (mode === 'rounded' && custom) {
    style.borderColor = custom
    style.color = custom
  }
  if (mode === 'status' && custom) style['--tag-status-color'] = custom
  const extra = props.schema.style
  if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
    for (const [key, value] of Object.entries(extra as Record<string, unknown>)) {
      if (value == null) continue
      style[key] = String(value)
    }
  }
  return style
})

const className = computed(() => {
  const mode = displayMode.value
  const classes = ['vamis-tag', `vamis-tag--${mode}`]
  const extra = resolveClassName(props.schema.className, props.data)
  if (extra) classes.push(extra)
  if (color.value) classes.push('vamis-tag--has-color')
  if (isPreset.value) classes.push(`vamis-tag--${mode}--${color.value}`)
  if (props.schema.disabled) classes.push('is-disabled')
  return classes.join(' ')
})
</script>

<template>
  <span :class="className" :style="tagStyle">
    <span class="vamis-tag__text" :title="label || undefined">
      <span v-if="displayMode === 'status'" class="vamis-tag__prev" aria-hidden="true" />
      {{ label }}
    </span>
  </span>
</template>
