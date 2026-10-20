<script setup lang="ts">
import { computed } from 'vue'
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const value = computed({
  get: () => String((props.schema.name ? form?.getValue(props.schema.name) : '') || 'none'),
  set: (v: string) => props.schema.name && form?.setValue(props.schema.name, v),
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="flex gap-2">
      <Select :model-value="value.startsWith('daily') ? 'daily' : value" @update:model-value="value = String($event)">
        <SelectTrigger class="w-36"><SelectValue placeholder="频率" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">不重复</SelectItem>
          <SelectItem value="daily">每天</SelectItem>
          <SelectItem value="weekly">每周</SelectItem>
          <SelectItem value="monthly">每月</SelectItem>
        </SelectContent>
      </Select>
      <Input v-if="value !== 'none'" :model-value="value" :disabled="disabled" @update:model-value="value = String($event)" />
    </div>
  </FormItem>
</template>
