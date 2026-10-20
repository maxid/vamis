<script setup lang="ts">
import type { SchemaObject } from '@vamis/core'

defineProps<{ schema: SchemaObject }>()
</script>

<template>
  <div class="flex items-center gap-2 text-sm text-muted-foreground">
    <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    <span>{{ schema.tip || schema.body || '加载中' }}</span>
  </div>
</template>
