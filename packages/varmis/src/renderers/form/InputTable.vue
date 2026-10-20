<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@varmis/core'
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@varmis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import NestedFormScope from '../../NestedFormScope.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const columns = computed(() => asArray(props.schema.columns || props.schema.items) as SchemaObject[])

const rows = computed<Record<string, any>[]>(() => {
  const value = props.schema.name ? form?.getValue(props.schema.name) : undefined
  return Array.isArray(value) && value.length ? (value as Record<string, any>[]) : [{}]
})

function persist(next: Record<string, any>[]) {
  if (!props.schema.name) return
  form?.setValue(props.schema.name, next)
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
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="col in columns" :key="col.name || col.label">{{ col.label || col.name }}</TableHead>
            <TableHead class="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(row, i) in rows" :key="i">
            <TableCell v-for="col in columns" :key="col.name || col.label">
              <NestedFormScope :row="row" :persist="persistCurrent">
                <SchemaRenderer :schema="{ ...col, label: false }" />
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
