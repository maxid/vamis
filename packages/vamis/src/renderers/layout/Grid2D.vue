<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  grid2dCellStyle,
  grid2dContainerStyle,
  isVisible,
  resolveClassName,
  useData,
  type SchemaObject,
} from '@vamis/core'
import { layoutNodes } from './utils'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const grids = computed(() =>
  asArray(props.schema.grids).filter((grid) => isVisible(grid as SchemaObject, data.value)) as SchemaObject[],
)
const containerStyle = computed(() => grid2dContainerStyle(props.schema, grids.value))
</script>

<template>
  <div :style="containerStyle">
    <div
      v-for="(grid, i) in grids"
      :key="i"
      :class="resolveClassName(grid.gridClassName, data)"
      :style="grid2dCellStyle(grid)"
    >
      <SchemaRenderer v-for="(node, j) in layoutNodes(grid)" :key="j" :schema="node" />
    </div>
  </div>
</template>
