<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, filterTpl, type SchemaObject } from '@vamis/core'
import { resolveItems } from './utils'

const colorClass: Record<string, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-destructive',
  info: 'bg-primary',
  primary: 'bg-primary',
}

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const items = computed(() => {
  const list = resolveItems(props.schema, props.data, ['items']) as SchemaObject[]
  return props.schema.reverse ? [...list].reverse() : list
})
const horizontal = computed(() => props.schema.direction === 'horizontal')

function timeText(item: SchemaObject) {
  return filterTpl(item.time || '', props.data)
}
function titleText(item: SchemaObject) {
  return typeof item.title === 'string' ? filterTpl(item.title, { ...props.data, ...item }) : ''
}
function detailText(item: SchemaObject) {
  return filterTpl(item.detail || '', { ...props.data, ...item })
}
function dotClass(item: SchemaObject) {
  const color = String(item.color || '')
  return colorClass[color] || (color.startsWith('#') ? '' : 'bg-primary')
}
function dotStyle(item: SchemaObject) {
  const color = String(item.color || '')
  return color.startsWith('#') ? { backgroundColor: color } : undefined
}
</script>

<template>
  <ol
    :class="[
      schema.className,
      horizontal ? 'flex flex-wrap gap-6' : 'relative space-y-4 border-l border-border pl-4',
    ]"
  >
    <li
      v-for="(item, i) in items"
      :key="i"
      class="relative"
      :class="horizontal ? 'min-w-[8rem] flex-1 border-t border-border pt-4' : ''"
    >
      <span
        class="absolute h-2.5 w-2.5 rounded-full"
        :class="[
          dotClass(item),
          horizontal ? 'top-0 left-0 -translate-y-1/2' : 'top-1.5 -left-[1.3125rem]',
        ]"
        :style="dotStyle(item)"
      />
      <p class="text-xs text-muted-foreground">{{ timeText(item) }}</p>
      <SchemaRenderer v-if="item.title && typeof item.title === 'object'" :schema="item.title" />
      <p v-else-if="titleText(item)" class="text-sm font-medium">{{ titleText(item) }}</p>
      <p v-if="detailText(item)" class="mt-1 text-xs text-muted-foreground">{{ detailText(item) }}</p>
    </li>
  </ol>
</template>
