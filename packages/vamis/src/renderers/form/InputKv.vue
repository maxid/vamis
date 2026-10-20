<script setup lang="ts">
import { computed } from 'vue'
import { kvRowsFromValue, valueFromKvRows, type SchemaObject } from '@vamis/core'
import { Button, Input } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()

const rows = computed({
  get: () => kvRowsFromValue(props.schema.name ? form?.getValue(props.schema.name) : undefined),
  set: (next) => {
    if (!props.schema.name) return
    form?.setValue(props.schema.name, valueFromKvRows(next))
  },
})

function update(index: number, patch: { key?: string; value?: unknown }) {
  rows.value = rows.value.map((row, i) => (i === index ? { ...row, ...patch } : { ...row }))
}

function add() {
  rows.value = [...rows.value, { key: '', value: '' }]
}

function remove(index: number) {
  const next = rows.value.filter((_, i) => i !== index)
  rows.value = next.length ? next : [{ key: '', value: '' }]
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-2">
      <div v-for="(row, i) in rows" :key="i" class="flex items-center gap-2">
        <Input
          :model-value="row.key"
          :placeholder="schema.keyPlaceholder || 'Key'"
          :disabled="disabled"
          class="w-36"
          @update:model-value="update(i, { key: String($event) })"
        />
        <Input
          :model-value="row.value == null ? '' : String(row.value)"
          :placeholder="schema.valuePlaceholder || 'Value'"
          :disabled="disabled"
          class="flex-1"
          @update:model-value="update(i, { value: $event })"
        />
        <Button type="button" size="sm" variant="ghost" :disabled="disabled" @click="remove(i)">删</Button>
      </div>
      <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="add">新增键值</Button>
    </div>
  </FormItem>
</template>
