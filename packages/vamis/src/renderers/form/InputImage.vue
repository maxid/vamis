<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const preview = ref('')
const current = computed(() => props.schema.name ? form?.getValue(props.schema.name) : null)

function onChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = file ? URL.createObjectURL(file) : ''
  if (!props.schema.name) return
  form?.setValue(props.schema.name, file ? { name: file.name, size: file.size, type: file.type } : null)
}
</script>

<template>
  <FormItem :schema="schema">
    <Input type="file" accept="image/*" :disabled="disabled" @change="onChange" />
    <img v-if="preview" :src="preview" alt="" class="mt-2 h-24 rounded-md border object-cover" />
    <p v-else-if="current" class="mt-1 text-xs text-muted-foreground">已选本地图片，未上传到服务器</p>
  </FormItem>
</template>
