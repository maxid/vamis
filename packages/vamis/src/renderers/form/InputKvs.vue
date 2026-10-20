<script setup lang="ts">
import { computed } from 'vue'
import { Button, Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const groups = computed({
  get: () => {
    const raw = props.schema.name ? form?.getValue(props.schema.name) : []
    return Array.isArray(raw) && raw.length ? raw : [{ key: '', value: '' }]
  },
  set: (next) => props.schema.name && form?.setValue(props.schema.name, next),
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-2">
      <div v-for="(row, i) in groups" :key="i" class="flex gap-2">
        <Input :model-value="row.key" placeholder="key" :disabled="disabled" @update:model-value="groups = groups.map((item, idx) => idx === i ? { ...item, key: String($event) } : item)" />
        <Input :model-value="row.value" placeholder="value" :disabled="disabled" @update:model-value="groups = groups.map((item, idx) => idx === i ? { ...item, value: $event } : item)" />
        <Button type="button" size="sm" variant="ghost" :disabled="disabled" @click="groups = groups.filter((_, idx) => idx !== i)">删</Button>
      </div>
      <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="groups = [...groups, { key: '', value: '' }]">新增一组</Button>
    </div>
  </FormItem>
</template>
