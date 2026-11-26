<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  comboApplyRadio,
  type SchemaObject,
} from '@vamis/core'
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@vamis/ui'
import { useFieldValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import NestedFormScope from '../../NestedFormScope.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fieldApi = useFieldValue()
const columns = computed(() => asArray(props.schema.columns || props.schema.items) as SchemaObject[])

const rows = computed<Record<string, any>[]>(() => {
  const value = props.schema.name ? fieldApi.getValue(props.schema.name) : undefined
  return Array.isArray(value) && value.length ? (value as Record<string, any>[]) : [{}]
})

function persist(next: Record<string, any>[]) {
  if (!props.schema.name) return
  fieldApi.setValue(props.schema.name, next)
}

function add() {
  persist([...rows.value.map((row) => ({ ...row })), {}])
}

function remove(index: number) {
  const next = rows.value.filter((_, i) => i !== index)
  persist(next.length ? next : [{}])
}

function persistCurrent() {
  persist(rows.value.map((row) => ({ ...row })))
}

function handleRadioChange(ctx: {
  index: number
  name: string
  trueValue: unknown
  falseValue: unknown
}) {
  if (props.disabled || !ctx.name) return
  const next = comboApplyRadio(
    rows.value,
    ctx.index,
    ctx.name,
    ctx.trueValue,
    ctx.falseValue,
  )
  if (!next) return
  persist(next)
  return false
}

function cellSchema(col: SchemaObject): SchemaObject {
  return { ...col, label: false }
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="col in columns" :key="`${col.name || col.label || ''}`">{{ col.label || col.name }}</TableHead>
            <TableHead class="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(row, i) in rows" :key="i">
            <TableCell v-for="col in columns" :key="`${col.name || col.label || ''}`">
              <NestedFormScope
                :row="row"
                :index="i"
                :persist="persistCurrent"
                :on-radio-change="handleRadioChange"
              >
                <SchemaRenderer :schema="cellSchema(col)" />
              </NestedFormScope>
            </TableCell>
            <TableCell>
              <Button type="button" size="sm" variant="ghost" :disabled="disabled" @click="remove(i)">删</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="add">新增一行</Button>
    </div>
  </FormItem>
</template>
