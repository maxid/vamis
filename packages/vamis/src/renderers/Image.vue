<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const src = computed(() =>
  filterTpl(props.schema.src || props.schema.url || props.data?.[props.schema.name || ''] || '', props.data),
)
const title = computed(() => filterTpl(props.schema.title || props.schema.caption || '', props.data))
</script>

<template>
  <figure class="inline-block max-w-full">
    <img
      v-if="src"
      :src="src"
      :alt="title || schema.name || 'image'"
      class="max-h-48 rounded-md border object-cover"
    />
    <div v-else class="rounded-md border border-dashed px-3 py-6 text-xs text-muted-foreground">未配置图片 src</div>
    <figcaption v-if="title" class="mt-1 text-xs text-muted-foreground">{{ title }}</figcaption>
  </figure>
</template>
