<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  gridColumnBody,
  gridColumnClass,
  gridColumnVAlign,
  gridGapToken,
  gridHAlign,
  gridVAlign,
  resolveClassName,
  resolveInlineStyle,
  useData,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{
  schema: SchemaObject
}>()
const data = useData()
const columns = computed(() => asArray(props.schema.columns || props.schema.body))
const gap = computed(() => gridGapToken(props.schema))
const align = computed(() => gridHAlign(props.schema))
const valign = computed(() => gridVAlign(props.schema))

function colClass(col: unknown) {
  return resolveClassName((col as SchemaObject).columnClassName, data.value)
}

function colStyle(col: unknown) {
  return resolveInlineStyle((col as SchemaObject).style, data.value)
}
</script>

<template>
  <div
    data-vamis-grid
    :data-gap="gap"
    :data-align="align"
    :data-valign="valign"
  >
    <div
      v-for="(col, i) in columns"
      :key="i"
      :data-col="gridColumnClass(col)"
      :data-col-valign="gridColumnVAlign(col)"
      :class="colClass(col)"
      :style="colStyle(col)"
    >
      <SchemaRenderer
        v-for="(node, j) in gridColumnBody(col)"
        :key="j"
        :schema="node"
      />
    </div>
  </div>
</template>
