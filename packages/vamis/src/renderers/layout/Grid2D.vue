<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { cssSize, layoutNodes } from './utils'

const justifySelfMap: Record<string, string> = {
  left: 'start',
  right: 'end',
  center: 'center',
  auto: 'stretch',
}
const alignSelfMap: Record<string, string> = {
  top: 'start',
  bottom: 'end',
  middle: 'center',
  auto: 'stretch',
}

const props = defineProps<{ schema: SchemaObject }>()
const grids = computed(() => asArray(props.schema.grids) as SchemaObject[])

const gridStyle = computed(() => {
  const cols = Math.max(1, Number(props.schema.cols || 12))
  const gap = props.schema.gap ?? 0
  const gapRow = props.schema.gapRow ?? gap
  const rowHeight = cssSize(props.schema.rowHeight ?? 50) || '50px'
  const templateColumns = Array.from({ length: cols }, () => '1fr')
  let maxRow = 1
  for (const grid of grids.value) {
    const y = Number(grid.y || 1)
    const h = Number(grid.h || 1)
    maxRow = Math.max(maxRow, y + h - 1)
    if (grid.width) templateColumns[Math.max(0, Number(grid.x || 1) - 1)] = cssSize(grid.width) || String(grid.width)
  }
  const templateRows = Array.from({ length: maxRow }, () => rowHeight)
  for (const grid of grids.value) {
    if (grid.height) templateRows[Math.max(0, Number(grid.y || 1) - 1)] = cssSize(grid.height) || String(grid.height)
  }
  return {
    display: 'grid',
    width: props.schema.width === 'auto' || props.schema.width == null ? '100%' : cssSize(props.schema.width),
    columnGap: cssSize(gap) || gap,
    rowGap: cssSize(gapRow) || gapRow,
    gridTemplateColumns: templateColumns.join(' '),
    gridTemplateRows: templateRows.join(' '),
    ...(props.schema.style || {}),
  }
})

function cellStyle(grid: SchemaObject) {
  const x = Number(grid.x || 1)
  const y = Number(grid.y || 1)
  const w = Number(grid.w || 1)
  const h = Number(grid.h || 1)
  return {
    gridColumnStart: x,
    gridColumnEnd: x + w,
    gridRowStart: y,
    gridRowEnd: y + h,
    justifySelf: justifySelfMap[String(grid.align || 'auto')] || 'stretch',
    alignSelf: alignSelfMap[String(grid.valign || 'auto')] || 'stretch',
  }
}
</script>

<template>
  <div :class="schema.className" :style="gridStyle">
    <div
      v-for="(grid, i) in grids"
      :key="i"
      class="min-h-[3rem] rounded-md border bg-muted/60 p-2"
      :class="grid.gridClassName"
      :style="cellStyle(grid)"
    >
      <SchemaRenderer v-for="(node, j) in layoutNodes(grid)" :key="j" :schema="node" />
    </div>
  </div>
</template>
