<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { Button } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import NestedFormScope from '../../NestedFormScope.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const multiple = computed(() => !!props.schema.multiple)
const fields = computed(() => {
  const nested = props.schema.form && typeof props.schema.form === 'object' ? props.schema.form : props.schema
  return asArray((nested as SchemaObject).body || (nested as SchemaObject).controls)
})
const labelField = computed(() => String(props.schema.labelField || ''))
const btnLabel = computed(() => String(props.schema.btnLabel || '设置'))

const rows = computed<Record<string, any>[]>(() => {
  const value = props.schema.name ? form?.getValue(props.schema.name) : undefined
  if (multiple.value) {
    return Array.isArray(value) && value.length ? (value as Record<string, any>[]) : [{}]
  }
  return [value && typeof value === 'object' ? (value as Record<string, any>) : {}]
})

function persist(next: Record<string, any>[]) {
  if (!props.schema.name) return
  form?.setValue(props.schema.name, multiple.value ? next : next[0] || {})
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

function rowLabel(row: Record<string, any>, index: number) {
  if (labelField.value && row[labelField.value]) return String(row[labelField.value])
  return `${btnLabel.value} ${index + 1}`
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-3">
      <div v-for="(row, i) in rows" :key="i" class="rounded-md border bg-background p-3">
        <div class="mb-2 text-xs font-medium text-muted-foreground">{{ rowLabel(row, i) }}</div>
        <NestedFormScope :row="row" :persist="persistCurrent">
          <div class="grid gap-2">
            <SchemaRenderer v-for="(node, fi) in fields" :key="fi" :schema="node" />
          </div>
        </NestedFormScope>
        <div v-if="multiple && rows.length > 1" class="mt-2 flex justify-end">
          <Button type="button" size="sm" variant="ghost" :disabled="disabled" @click="remove(i)">删除</Button>
        </div>
      </div>
      <Button v-if="multiple" type="button" size="sm" variant="outline" :disabled="disabled" @click="add">
        {{ schema.addButtonText || '新增一项' }}
      </Button>
    </div>
  </FormItem>
</template>
