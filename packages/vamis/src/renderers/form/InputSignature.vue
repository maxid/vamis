<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Button } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { useFieldValue, useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()
const form = useForm()
const fieldApi = useFieldValue()
const canvas = ref<HTMLCanvasElement | null>(null)
let drawing = false

onMounted(() => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return
  ctx.strokeStyle = '#111'
  ctx.lineWidth = 2
})

function pos(event: MouseEvent) {
  const el = canvas.value!
  const rect = el.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}
function start(event: MouseEvent) {
  if (props.disabled) return
  drawing = true
  const ctx = canvas.value?.getContext('2d')
  const { x, y } = pos(event)
  ctx?.beginPath()
  ctx?.moveTo(x, y)
}
function move(event: MouseEvent) {
  if (!drawing) return
  const ctx = canvas.value?.getContext('2d')
  const { x, y } = pos(event)
  ctx?.lineTo(x, y)
  ctx?.stroke()
}
function end() {
  drawing = false
  if (props.schema.name && canvas.value) fieldApi.setValue(props.schema.name, canvas.value.toDataURL())
}
function clear() {
  const el = canvas.value
  el?.getContext('2d')?.clearRect(0, 0, el.width, el.height)
  if (props.schema.name) fieldApi.setValue(props.schema.name, '')
}
</script>

<template>
  <FormItem :schema="schema">
    <div class="space-y-2">
      <canvas
        ref="canvas"
        width="360"
        height="140"
        class="vamis-signature w-full rounded-md border"
        @mousedown="start"
        @mousemove="move"
        @mouseup="end"
        @mouseleave="end"
      />
      <Button type="button" size="sm" variant="outline" :disabled="disabled" @click="clear">清空签名</Button>
    </div>
  </FormItem>
</template>
