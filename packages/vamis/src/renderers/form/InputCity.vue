<script setup lang="ts">
import { computed } from 'vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const CITIES = [
  { label: '北京', value: '110000', children: [{ label: '海淀', value: '110108' }, { label: '朝阳', value: '110105' }] },
  { label: '上海', value: '310000', children: [{ label: '浦东', value: '310115' }, { label: '黄浦', value: '310101' }] },
  { label: '广东', value: '440000', children: [{ label: '广州', value: '440100' }, { label: '深圳', value: '440300' }] },
]

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const parts = computed({
  get: () => {
    const raw = props.schema.name ? form?.getValue(props.schema.name) : ''
    if (raw && typeof raw === 'object') return { province: String((raw as any).code || (raw as any).province || ''), city: String((raw as any).city || '') }
    const text = String(raw || '')
    const [province, city] = text.split(',').map((item) => item.trim())
    return { province: province || '', city: city || '' }
  },
  set: (next) => {
    if (!props.schema.name) return
    form?.setValue(props.schema.name, props.schema.extractValue === false ? next : [next.province, next.city].filter(Boolean).join(','))
  },
})
const cities = computed(() => CITIES.find((item) => item.value === parts.value.province)?.children || [])
</script>

<template>
  <FormItem :schema="schema">
    <div class="grid gap-2 sm:grid-cols-2">
      <Select :model-value="parts.province || undefined" :disabled="disabled" @update:model-value="parts = { province: String($event), city: '' }">
        <SelectTrigger><SelectValue placeholder="省" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="item in CITIES" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
        </SelectContent>
      </Select>
      <Select :model-value="parts.city || undefined" :disabled="disabled" @update:model-value="parts = { ...parts, city: String($event) }">
        <SelectTrigger><SelectValue placeholder="市" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="item in cities" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </FormItem>
</template>
