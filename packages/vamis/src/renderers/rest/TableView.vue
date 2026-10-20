<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, type SchemaObject } from '@vamis/core'
import { Table, TableBody, TableCell, TableRow } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const rows = computed(() => (props.schema.trs || []) as any[])
</script>

<template>
  <Table>
    <TableBody>
      <TableRow v-for="(row, ri) in rows" :key="ri">
        <TableCell
          v-for="(cell, ci) in row.tds || []"
          :key="ci"
          :colspan="cell.colspan"
          :rowspan="cell.rowspan"
          :style="{ background: cell.background, color: cell.color, textAlign: cell.align }"
        >
          <SchemaRenderer v-if="cell.body" :schema="cell.body" />
          <span v-else>{{ cell.text || cell.tpl }}</span>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
