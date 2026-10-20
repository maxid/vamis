<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'
import { encodeBarcode } from './barcode'
import { readText } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const value = computed(() => readText(props.schema, props.data))
const encoded = computed(() => {
  if (!value.value) return null
  const options = (props.schema.options || {}) as Record<string, unknown>
  return encodeBarcode(value.value, {
    format: String(options.format || 'CODE128'),
    width: Number(props.schema.width || options.width) || 2,
    height: Number(props.schema.height || options.height) || 80,
    lineColor: String(options.lineColor || '#111827'),
    background: String(options.background || '#ffffff'),
    displayValue: options.displayValue !== false,
  })
})
</script>

<template>
  <div data-slot="barcode" data-testid="barcode" class="inline-block">
    <p v-if="!value" class="text-sm text-muted-foreground">未配置条码内容</p>
    <p v-else-if="!encoded" class="text-sm text-destructive">条码内容无法编码（Code 128 仅支持 ASCII 32–127）</p>
    <div v-else v-html="encoded.svg" />
  </div>
</template>
