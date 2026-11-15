<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  filterTpl,
  resolveClassName,
  resolveIcon,
  runOnEvent,
  useEnv,
  useScoped,
  type ResolvedIcon,
  type SchemaObject,
} from '@vamis/core'
import { VamisClose, VamisIcon } from '@vamis/ui'
import IconMark from '../IconMark.vue'
import { readValue } from './format'

const PRESET = ['inactive', 'active', 'success', 'processing', 'error', 'warning'] as const
type Preset = (typeof PRESET)[number]

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const scoped = useScoped()
const checked = ref(props.schema.checked === true)

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

const statusIcon = computed<ResolvedIcon>(() => {
  if (displayMode.value !== 'status') return { kind: 'empty' }
  return resolveIcon(props.schema.icon)
})
const useDefaultDot = computed(
  () => displayMode.value === 'status' && statusIcon.value.kind === 'empty',
)
const closeIcon = computed<ResolvedIcon>(() => resolveIcon(props.schema.closeIcon))
const useDefaultClose = computed(() => closeIcon.value.kind === 'empty')

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

const checkable = computed(() => props.schema.checkable === true)
const closable = computed(() => props.schema.closable === true)

async function emitTagEvent(eventName: string, native: Event) {
  const payload = { ...props.data, label: label.value }
  const event = createVamisEvent(eventName, payload, native)
  await runOnEvent(props.schema, eventName, {
    env,
    data: eventEvalData(payload, event),
    scoped,
    event,
  })
  return !event.prevented
}

async function onClick(event: MouseEvent) {
  if (props.schema.disabled === true) return
  if (!(await emitTagEvent('click', event))) return
  if (checkable.value) checked.value = !checked.value
}

async function onClose(event: MouseEvent) {
  event.stopPropagation()
  if (props.schema.disabled === true) return
  await emitTagEvent('close', event)
}

const className = computed(() => {
  const mode = displayMode.value
  const classes = ['vamis-tag', `vamis-tag--${mode}`]
  const extra = resolveClassName(props.schema.className, props.data)
  if (extra) classes.push(extra)
  if (color.value) classes.push('vamis-tag--has-color')
  if (isPreset.value) classes.push(`vamis-tag--${mode}--${color.value}`)
  if (props.schema.disabled) classes.push('is-disabled')
  if (checkable.value) classes.push('is-checkable')
  if (checkable.value && checked.value) classes.push('is-checked')
  return classes.join(' ')
})
</script>

<template>
  <span
    :class="className"
    :style="tagStyle"
    @click="onClick"
    @mouseenter="emitTagEvent('mouseenter', $event)"
    @mouseleave="emitTagEvent('mouseleave', $event)"
  >
    <span class="vamis-tag__text" :title="label || undefined"
      ><span v-if="displayMode === 'status'" class="vamis-tag__prev" aria-hidden="true"
        ><IconMark v-if="!useDefaultDot" :icon="statusIcon" /><VamisIcon name="status-dot" v-else class="icon vamis-tag-default-icon" /></span
      >{{ label }}</span
    >
    <span v-if="closable" class="vamis-tag__close" role="button" aria-label="关闭" @click="onClose">
      <IconMark v-if="!useDefaultClose" :icon="closeIcon" />
      <VamisClose v-else />
    </span>
  </span>
</template>
