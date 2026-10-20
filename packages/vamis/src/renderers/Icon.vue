<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaObject } from '@vamis/core'

const props = defineProps<{ schema: SchemaObject }>()
const name = computed(() => String(props.schema.icon || props.schema.className || 'icon'))
const short = computed(() => name.value.split(/[\s_-]/).filter(Boolean).pop() || 'icon')
</script>

<template>
  <span class="inline-flex h-7 min-w-7 items-center justify-center rounded-md border bg-muted px-2 font-mono text-[10px] uppercase">
    {{ short }}
  </span>
</template>
