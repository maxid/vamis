<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'
import { normalizeOptions } from '../../options'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const columns = computed(() => normalizeOptions(props.schema.columns))
const rows = computed(() => normalizeOptions(props.schema.rows))
const selected = computed({
  get: () => {
    const raw = props.schema.name ? form?.getValue(props.schema.name) : []
    return Array.isArray(raw) ? raw.map(String) : []
  },
  set: (next: string[]) => props.schema.name && form?.setValue(props.schema.name, next),
})

function key(row: unknown, col: unknown) {
  return `${row}-${col}`
}
function toggle(row: unknown, col: unknown, checked: boolean) {
  const id = key(row, col)
  selected.value = checked ? [...selected.value.filter((item) => item !== id), id] : selected.value.filter((item) => item !== id)
}
</script>

<template>
  <FormItem :schema="schema">
    <table class="w-full text-sm">
      <thead>
        <tr>
          <th class="p-1 text-left" />
          <th v-for="col in columns" :key="String(col.value)" class="p-1 text-left font-medium">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="String(row.value)">
          <td class="p-1">{{ row.label }}</td>
          <td v-for="col in columns" :key="String(col.value)" class="p-1">
            <Checkbox
              :model-value="selected.includes(key(row.value, col.value))"
              :disabled="disabled"
              @update:model-value="toggle(row.value, col.value, $event === true)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </FormItem>
</template>
