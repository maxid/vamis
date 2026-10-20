<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { cssSize, layoutNodes } from './utils'

const props = defineProps<{ schema: SchemaObject }>()
const columns = computed(() => asArray(props.schema.columns || props.schema.body) as SchemaObject[])

const gap = computed(() => {
  const map: Record<string, string> = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    base: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }
  return map[String(props.schema.gap || 'xs')] || 'gap-1'
})

const align = computed(() => {
  const map: Record<string, string> = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  }
  return map[String(props.schema.align || '')] || 'justify-start'
})

const valign = computed(() => {
  const map: Record<string, string> = {
    top: 'items-start',
    middle: 'items-center',
    bottom: 'items-end',
    between: 'items-stretch',
  }
  return map[String(props.schema.valign || '')] || 'items-stretch'
})

function colStyle(col: SchemaObject) {
  const width = cssSize(col.width)
  return {
    width,
    height: cssSize(col.height),
    flex: width ? '0 0 auto' : '1 1 0%',
    ...(col.style || {}),
  }
}

function colValign(col: SchemaObject) {
  const map: Record<string, string> = {
    top: 'self-start',
    middle: 'self-center',
    bottom: 'self-end',
    between: 'self-stretch',
  }
  return map[String(col.valign || '')] || ''
}
</script>

<template>
  <div class="flex flex-wrap" :class="[schema.className, gap, align, valign]">
    <div
      v-for="(col, i) in columns"
      :key="i"
      class="min-w-0"
      :class="[col.columnClassName, colValign(col)]"
      :style="colStyle(col)"
    >
      <SchemaRenderer v-for="(node, j) in layoutNodes(col)" :key="j" :schema="node" />
    </div>
  </div>
</template>
