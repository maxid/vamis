<script setup lang="ts">
import { computed } from 'vue'
import {
  taskBtnText,
  taskCanOperate,
  taskCanRetry,
  taskItems,
  taskLabel,
  taskNameLabel,
  taskOperationLabel,
  taskRemark,
  taskRemarkLabel,
  taskRetryBtnText,
  taskStatus,
  taskStatusLabel,
  taskStatusText,
  useData,
  type SchemaObject,
} from '@vamis/core'
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, unknown>
  disabled?: boolean
}>()
const data = useData()
const items = computed(() => taskItems(props.schema, data.value))
const nameCol = computed(() => taskNameLabel(props.schema))
const statusCol = computed(() => taskStatusLabel(props.schema))
const remarkCol = computed(() => taskRemarkLabel(props.schema))
const opCol = computed(() => taskOperationLabel(props.schema))
const goText = computed(() => taskBtnText(props.schema))
const retryText = computed(() => taskRetryBtnText(props.schema))

function statusVariant(item: unknown) {
  const status = taskStatus(item)
  if (status === 3 || status === 5) return 'destructive' as const
  if (status === 4) return 'default' as const
  if (status === 2) return 'secondary' as const
  return 'outline' as const
}
</script>

<template>
  <div data-vamis-tasks :name="typeof schema.name === 'string' ? schema.name : undefined">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{{ nameCol }}</TableHead>
          <TableHead>{{ opCol }}</TableHead>
          <TableHead>{{ statusCol }}</TableHead>
          <TableHead>{{ remarkCol }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(item, i) in items" :key="i">
          <TableCell>{{ taskLabel(item, data) }}</TableCell>
          <TableCell>
            <Button
              v-if="taskCanRetry(item)"
              size="sm"
              variant="destructive"
              type="button"
            >{{ retryText }}</Button>
            <Button
              v-else-if="taskStatus(item) !== 2"
              size="sm"
              variant="outline"
              type="button"
              :disabled="!taskCanOperate(item)"
            >{{ goText }}</Button>
          </TableCell>
          <TableCell>
            <Badge :variant="statusVariant(item)">{{ taskStatusText(schema, item) }}</Badge>
          </TableCell>
          <TableCell class="text-muted-foreground">{{ taskRemark(item, data) }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
