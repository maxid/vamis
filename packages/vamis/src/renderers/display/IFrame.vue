<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'
import { cssSize, readSrc } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const src = computed(() => readSrc(props.schema, props.data))
const safe = computed(() => {
  const url = src.value
  if (!url) return false
  if (/^data:([a-zA-Z0-9+.-]+\/[a-zA-Z0-9+.-]+);base64,/i.test(url)) return true
  return /^(\.\/|\.\.\/|\/|(blob:)?https?:\/\/|\/\/)/i.test(url)
})
const width = computed(() => cssSize(props.schema.width, '100%'))
const height = computed(() => cssSize(props.schema.height, '360px'))
const iframeTitle = computed(
  () => (typeof props.schema.title === 'string' && props.schema.title) || props.schema.name || 'iframe',
)
</script>

<template>
  <div data-slot="iframe">
    <iframe
      v-if="safe"
      class="w-full rounded-md border bg-background"
      :src="src"
      :name="schema.name"
      :title="iframeTitle"
      :width="width"
      :height="height"
      :style="{ width, height, minHeight: '160px' }"
      :allow="schema.allow"
      :sandbox="schema.sandbox"
      :referrerpolicy="schema.referrerpolicy"
    />
    <div v-else class="rounded-md border border-dashed px-3 py-6 text-sm text-muted-foreground">
      {{ src ? 'iframe src 不合法，已拒绝加载' : '未配置 iframe src' }}
    </div>
  </div>
</template>
