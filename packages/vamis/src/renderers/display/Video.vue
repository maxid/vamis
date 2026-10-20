<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'
import { readSrc } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const src = computed(() => readSrc(props.schema, props.data))
const poster = computed(() => filterTpl(props.schema.poster || '', props.data))
</script>

<template>
  <div data-slot="video" class="max-w-full">
    <video
      v-if="src"
      class="w-full rounded-md border bg-black"
      controls
      :src="src"
      :poster="poster || undefined"
      :autoplay="schema.autoPlay === true"
      :muted="schema.muted === true"
      :loop="schema.loop === true"
    />
    <div v-else class="rounded-md border border-dashed px-3 py-6 text-sm text-muted-foreground">未配置视频 src</div>
  </div>
</template>
