<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const src = computed(() =>
  filterTpl(props.schema.src || props.schema.url || props.data?.[props.schema.name || ''] || '', props.data),
)
const title = computed(() => filterTpl(props.schema.title || props.schema.caption || '', props.data))
const height = computed(() => filterTpl(String(props.schema.height || ''), props.data))
const thumbMode = computed(() => (String(props.schema.thumbMode || 'cover') === 'contain' ? 'contain' : 'cover'))
const imgStyle = computed(() => {
  if (!height.value) return undefined
  return { height: height.value, width: '100%', objectFit: thumbMode.value }
})
</script>

<template>
  <figure class="block max-w-full" :class="height ? 'w-full' : 'inline-block'">
    <img
      v-if="src"
      :src="src"
      :alt="title || schema.name || 'image'"
      :class="height ? 'w-full' : 'max-h-48 rounded-md border object-cover'"
      :style="imgStyle"
    />
    <div v-else class="rounded-md border border-dashed px-3 py-6 text-xs text-muted-foreground">未配置图片 src</div>
    <figcaption v-if="title" class="mt-1 text-xs text-muted-foreground">{{ title }}</figcaption>
  </figure>
</template>
