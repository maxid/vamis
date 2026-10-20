<script setup lang="ts">
import type { SchemaObject } from './types'

defineProps<{
  schema: SchemaObject
  reason?: string
}>()
</script>

<template>
  <div
    class="rounded-md border border-dashed border-primary/40 bg-accent/40 px-3 py-2 text-sm text-muted-foreground"
    data-slot="unknown-renderer"
  >
    <p class="font-medium text-foreground">
      未知类型：<code class="font-mono text-primary">{{ schema.type || '(missing type)' }}</code>
    </p>
    <p class="mt-1">{{ reason || '运行时没有对应渲染器，已占位，页面继续执行。' }}</p>
  </div>
</template>
