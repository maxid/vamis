<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  tableViewBorder,
  tableViewBorderColor,
  tableViewCaption,
  tableViewCaptionSide,
  tableViewCols,
  tableViewPadding,
  tableViewRows,
  tableViewSpan,
  tableViewTdStyle,
  tableViewTrStyle,
  tableViewWidth,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data?: Record<string, unknown> }>()
const data = computed(() => props.data || {})
const width = computed(() => tableViewWidth(props.schema))
const padding = computed(() => tableViewPadding(props.schema))
const border = computed(() => tableViewBorder(props.schema))
const borderColor = computed(() => tableViewBorderColor(props.schema))
const caption = computed(() => tableViewCaption(props.schema, data.value))
const captionSide = computed(() => tableViewCaptionSide(props.schema))
const cols = computed(() => tableViewCols(props.schema, data.value))
const rows = computed(() => tableViewRows(props.schema, data.value))
const tableOpts = computed(() => ({
  border: border.value,
  borderColor: borderColor.value,
  padding: padding.value,
}))
</script>

<template>
  <table data-slot="table-view" :style="{ width, borderCollapse: 'collapse' }">
    <caption v-if="caption" :style="{ captionSide, textAlign: 'center' }">{{ caption }}</caption>
    <colgroup v-if="cols.length">
      <col v-for="(col, i) in cols" :key="i" :span="col.span" :style="col.style as Record<string, string>" />
    </colgroup>
    <tbody>
      <tr v-for="(row, ri) in rows" :key="ri" :style="tableViewTrStyle(row)">
        <td
          v-for="(cell, ci) in row.tds"
          :key="ci"
          :colspan="tableViewSpan(cell.colspan)"
          :rowspan="tableViewSpan(cell.rowspan)"
          :align="(cell.align as any) || 'left'"
          :valign="(cell.valign as any) || 'middle'"
          :style="tableViewTdStyle(cell, tableOpts)"
        >
          <SchemaRenderer v-for="(node, ni) in asArray(cell.body as any)" :key="ni" :schema="node" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
