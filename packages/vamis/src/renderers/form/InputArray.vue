<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, flattenArrayRows, inflateArrayRows, type SchemaObject } from '@vamis/core'
import { Button } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import NestedFormScope from '../../NestedFormScope.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const item = computed(() => {
  const raw = asArray(props.schema.items || props.schema.item)
  const first = (raw[0] && typeof raw[0] === 'object' ? raw[0] : { type: 'input-text', name: 'item' }) as SchemaObject
  return { ...first, name: first.name || 'item', label: false as const }
})
const fieldName = computed(() => String(item.value.name || 'item'))
const flat = computed(() => props.schema.flat !== false)

const rows = computed<Record<string, any>[]>(() =>
  inflateArrayRows(props.schema.name ? form?.getValue(props.schema.name) : undefined, fieldName.value) as Record<string, any>[],
)

function persist(next: Record<string, any>[]) {
  if (!props.schema.name) return
  form?.setValue(props.schema.name, flattenArrayRows(next, fieldName.value, flat.value))
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
      <div v-for="(row, i) in rows" :key="i" class="flex items-start gap-2">
        <div class="min-w-0 flex-1">
          <NestedFormScope :row="row" :persist="persistCurrent">
            <SchemaRenderer :schema="item" />
          </NestedFormScope>
        </div>
        <Button type="button" size="sm" variant="ghost" :disabled="disabled" @click="remove(i)">删</Button>
      </div>
      <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="add">新增一项</Button>
    </div>
  </FormItem>
</template>
