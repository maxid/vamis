<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, type SchemaObject } from '@vamis/core'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, any>
  items?: Record<string, any>[]
}>()

const columns = computed(() => (props.schema.columns || []) as SchemaObject[])
const rows = computed<Record<string, any>[]>(() => {
  if (Array.isArray(props.items)) return props.items
  const source = props.schema.source
  if (typeof source === 'string' && source.startsWith('$') && props.data) {
    const key = source.replace(/^\$\{?|\}$/g, '')
    const value = props.data[key]
    return Array.isArray(value) ? value : []
  }
  return Array.isArray(props.schema.data) ? props.schema.data : []
})
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead v-for="col in columns" :key="col.name || col.label">
          {{ col.label || col.name }}
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-if="!rows.length">
        <TableCell :colspan="Math.max(columns.length, 1)" class="py-8 text-center text-muted-foreground">
          暂无数据
        </TableCell>
      </TableRow>
      <TableRow v-for="(row, i) in rows" :key="row.id ?? i">
        <TableCell v-for="col in columns" :key="col.name || col.label">
          <SchemaRenderer
            v-if="col.type && col.type !== 'text' && col.type !== 'plain'"
            :schema="col"
            :extra-data="row"
          />
          <span v-else>{{ row[col.name] ?? '' }}</span>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
