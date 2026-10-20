<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { encodeQr, qrPath, type QrLevel } from './qr'
import { readText } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const value = computed(() => readText(props.schema, props.data, ['value', 'qrcode']))
const size = computed(() => Number(props.schema.codeSize) || 128)
const fg = computed(() => String(props.schema.foregroundColor || '#111827'))
const bg = computed(() => String(props.schema.backgroundColor || '#ffffff'))
const level = computed<QrLevel>(() => {
  const raw = String(props.schema.level || 'L').toUpperCase()
  return raw === 'M' || raw === 'Q' || raw === 'H' ? raw : 'L'
})
const modules = computed(() => (value.value ? encodeQr(value.value, level.value) : null))
const path = computed(() => (modules.value ? qrPath(modules.value) : ''))
const dim = computed(() => modules.value?.length || 0)
const logo = computed(() => {
  const settings = props.schema.imageSettings
  if (!settings || typeof settings !== 'object' || !settings.src) return null
  const src = filterTpl(settings.src, props.data)
  if (!src) return null
  const n = dim.value
  const width = Number(settings.width) || Math.round(n * 0.2)
  const height = Number(settings.height) || width
  const x = settings.x != null ? Number(settings.x) : (n - width) / 2
  const y = settings.y != null ? Number(settings.y) : (n - height) / 2
  return { src, width, height, x, y }
})
</script>

<template>
  <div data-slot="qrcode" class="inline-block">
    <p v-if="!value" class="text-sm text-muted-foreground">{{ schema.placeholder || '-' }}</p>
    <p v-else-if="!modules" class="text-sm text-destructive">内容过长，无法生成二维码</p>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      :width="size"
      :height="size"
      :viewBox="`-4 -4 ${dim + 8} ${dim + 8}`"
      role="img"
      :aria-label="value"
    >
      <rect :width="dim + 8" :height="dim + 8" x="-4" y="-4" :fill="bg" />
      <path :d="path" :fill="fg" />
      <image
        v-if="logo"
        :href="logo.src"
        :x="logo.x"
        :y="logo.y"
        :width="logo.width"
        :height="logo.height"
      />
    </svg>
  </div>
</template>
