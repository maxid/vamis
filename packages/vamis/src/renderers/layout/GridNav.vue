<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, useEnv, type SchemaObject } from '@vamis/core'
import { Badge } from '@vamis/ui'
import { cssSize, resolveItems } from './utils'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const items = computed(() => resolveItems(props.schema, props.data, ['options', 'items']) as SchemaObject[])
const columns = computed(() => Math.max(1, Number(props.schema.columnNum || 4)))
const center = computed(() => props.schema.center !== false)
const bordered = computed(() => props.schema.border !== false)
const square = computed(() => props.schema.square === true)
const horizontal = computed(() => props.schema.direction === 'horizontal')
const gutter = computed(() => cssSize(props.schema.gutter ?? 0) || '0px')

function isUrl(value: string) {
  return /^https?:\/\//.test(value) || value.startsWith('data:') || value.startsWith('/')
}

function iconOf(item: SchemaObject) {
  return filterTpl(item.icon || '', props.data)
}

function textOf(item: SchemaObject) {
  return filterTpl(item.text || item.label || item.title || '', { ...props.data, ...item })
}

function onClick(item: SchemaObject) {
  const link = filterTpl(item.link || item.href || '', props.data)
  if (link) env.jumpTo(link)
}
</script>

<template>
  <div
    class="grid"
    :class="schema.className"
    :style="{
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: gutter,
    }"
  >
    <button
      v-for="(item, i) in items"
      :key="i"
      type="button"
      class="min-w-0 bg-card p-3 text-sm hover:bg-accent"
      :class="[
        schema.itemClassName,
        bordered ? 'border' : '',
        center ? 'items-center justify-center text-center' : 'items-start text-left',
        square ? 'aspect-square' : '',
        horizontal ? 'flex flex-row gap-2' : 'flex flex-col gap-2',
      ]"
      @click="onClick(item)"
    >
      <img
        v-if="iconOf(item) && isUrl(iconOf(item))"
        :src="iconOf(item)"
        alt=""
        class="h-8 w-8 object-contain"
      />
      <span
        v-else-if="iconOf(item)"
        class="inline-flex h-8 min-w-8 items-center justify-center rounded-md border bg-muted px-2 font-mono text-[10px] uppercase"
      >
        {{ iconOf(item).split(/[\s_-]/).filter(Boolean).pop() }}
      </span>
      <span :class="schema.contentClassName">{{ textOf(item) }}</span>
      <Badge v-if="item.badge" variant="secondary">
        {{ typeof item.badge === 'object' ? item.badge.text || item.badge.value || '' : item.badge }}
      </Badge>
    </button>
  </div>
</template>
