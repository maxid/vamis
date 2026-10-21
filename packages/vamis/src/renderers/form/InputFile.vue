<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SchemaObject } from '@vamis/core'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const dragging = ref(false)
const current = computed(() => props.schema.name ? form?.getValue(props.schema.name) : null)
const fileName = computed(() => (current.value && typeof current.value === 'object' ? (current.value as any).name : ''))

function applyFile(file: File | undefined) {
  if (!props.schema.name) return
  form?.setValue(props.schema.name, file ? { name: file.name, size: file.size, type: file.type } : null)
}

function onChange(event: Event) {
  applyFile((event.target as HTMLInputElement).files?.[0])
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragging.value = false
  if (props.disabled) return
  applyFile(event.dataTransfer?.files?.[0])
}
</script>

<template>
  <FormItem :schema="schema">
    <label
      class="vamis-file-drop"
      :class="dragging ? 'border-ring bg-muted/70' : ''"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop="onDrop"
    >
      <input
        class="sr-only"
        type="file"
        :accept="schema.accept"
        :disabled="disabled"
        :multiple="!!schema.multiple"
        @change="onChange"
      >
      <span class="font-medium">{{ fileName || '点击或拖拽文件到此处' }}</span>
      <span class="text-xs text-muted-foreground">
        {{ fileName ? '本地文件，未上传' : (schema.accept || '任意类型') }}
      </span>
    </label>
  </FormItem>
</template>
