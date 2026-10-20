<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'
import { readSrc } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const src = computed(() => readSrc(props.schema, props.data))
</script>

<template>
  <div data-slot="audio">
    <audio
      v-if="src"
      class="w-full"
      controls
      :src="src"
      :autoplay="schema.autoPlay === true"
      :loop="schema.loop === true"
    />
    <div v-else class="rounded-md border border-dashed px-3 py-6 text-sm text-muted-foreground">未配置音频 src</div>
  </div>
</template>
