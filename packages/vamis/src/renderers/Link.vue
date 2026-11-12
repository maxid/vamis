<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, filterTpl, resolveClassName, resolveIcon, type SchemaObject } from '@vamis/core'
import { cn } from '@vamis/ui'
import BadgeHost from './BadgeHost.vue'
import IconMark from './IconMark.vue'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

const data = computed(() => props.data || {})
const hrefRaw = computed(() => {
  const href = props.schema.href
  if (typeof href === 'string' && href) return filterTpl(href, data.value)
  if (props.schema.name) {
    const value = data.value[String(props.schema.name)]
    if (value != null && value !== '') return String(value)
  }
  return ''
})
const href = computed(() => (props.schema.disabled === true ? undefined : hrefRaw.value))
const label = computed(() => {
  if (props.schema.body != null) return props.schema.body
  return hrefRaw.value || 'link'
})
const text = computed(() =>
  typeof label.value === 'string' ? filterTpl(label.value, data.value) : '',
)
const bodyNode = computed<SchemaObject | null>(() =>
  label.value && typeof label.value === 'object' && !Array.isArray(label.value)
    ? ({ type: 'tpl', ...(label.value as SchemaObject) } as SchemaObject)
    : null,
)
const disabled = computed(() => props.schema.disabled === true)
const target = computed(() =>
  props.schema.htmlTarget != null && props.schema.htmlTarget !== ''
    ? String(props.schema.htmlTarget)
    : props.schema.blank === false
      ? '_self'
      : '_blank',
)
const title = computed(() =>
  props.schema.title != null ? filterTpl(String(props.schema.title), data.value) : undefined,
)
const icon = computed(() => (props.schema.icon ? resolveIcon(props.schema.icon, { vendor: 'fa' }) : null))
const rightIcon = computed(() =>
  props.schema.rightIcon ? resolveIcon(props.schema.rightIcon, { vendor: 'fa' }) : null,
)
const className = computed(() => resolveClassName(props.schema.className, data.value))
const linkClass = computed(() =>
  cn(
    'vamis-link inline-flex items-center gap-1 no-underline',
    disabled.value ? 'cursor-not-allowed text-muted-foreground' : 'text-primary hover:underline',
    className.value,
  ),
)
</script>

<template>
  <BadgeHost :schema="schema" :data="data">
    <a
      v-if="!disabled"
      :href="href || undefined"
      :target="target"
      :title="title"
      :class="linkClass"
      :style="schema.style"
    >
      <IconMark v-if="icon" :icon="icon" img-class="inline-block size-4" />
      <SchemaRenderer v-if="bodyNode" :schema="bodyNode" :extra-data="data" />
      <template v-else>{{ text }}</template>
      <IconMark v-if="rightIcon" :icon="rightIcon" img-class="inline-block size-4" />
    </a>
    <span v-else :class="linkClass" :title="title" :style="schema.style" aria-disabled="true">
      <IconMark v-if="icon" :icon="icon" img-class="inline-block size-4" />
      <SchemaRenderer v-if="bodyNode" :schema="bodyNode" :extra-data="data" />
      <template v-else>{{ text }}</template>
      <IconMark v-if="rightIcon" :icon="rightIcon" img-class="inline-block size-4" />
    </span>
  </BadgeHost>
</template>
