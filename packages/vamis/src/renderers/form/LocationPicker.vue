<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const loc = computed({
  get: () => {
    const raw = props.schema.name ? form?.getValue(props.schema.name) : undefined
    if (raw && typeof raw === 'object') return { address: String((raw as any).address || ''), lng: String((raw as any).lng ?? ''), lat: String((raw as any).lat ?? '') }
    return { address: String(raw || ''), lng: '', lat: '' }
  },
  set: (next) => props.schema.name && form?.setValue(props.schema.name, next),
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="grid gap-2 sm:grid-cols-3">
      <Input class="sm:col-span-3" :model-value="loc.address" placeholder="地址" :disabled="disabled" @update:model-value="loc = { ...loc, address: String($event) }" />
      <Input :model-value="loc.lng" placeholder="经度" :disabled="disabled" @update:model-value="loc = { ...loc, lng: String($event) }" />
      <Input :model-value="loc.lat" placeholder="纬度" :disabled="disabled" @update:model-value="loc = { ...loc, lat: String($event) }" />
    </div>
  </FormItem>
</template>
