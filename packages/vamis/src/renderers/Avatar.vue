<script setup lang="ts">
import { computed } from 'vue'
import { filterTpl, type SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const src = computed(() => filterTpl(props.schema.src || '', props.data))
const text = computed(() => filterTpl(props.schema.text || props.schema.name || 'U', props.data).slice(0, 2))
</script>

<template>
  <span class="inline-flex size-[var(--control-h)] items-center justify-center overflow-hidden rounded-full border bg-muted text-xs font-medium">
    <img v-if="src" :src="src" alt="" class="h-full w-full object-cover" />
    <span v-else>{{ text }}</span>
  </span>
</template>
