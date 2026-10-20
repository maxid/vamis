<script setup lang="ts">
import { computed } from 'vue'
import { Badge, ScrollArea } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import { cssSize, readText } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const language = computed(() => String(props.schema.language || 'plaintext'))
const code = computed(() => readText(props.schema, props.data))
const maxHeight = computed(() => cssSize(props.schema.maxHeight, '24rem'))
const wrap = computed(() => props.schema.wordWrap !== false)
</script>

<template>
  <div data-slot="code" class="overflow-hidden rounded-md border bg-muted/30">
    <div class="flex items-center justify-between border-b px-3 py-1.5">
      <Badge variant="outline">{{ language }}</Badge>
    </div>
    <ScrollArea class="w-full" :style="{ maxHeight }">
      <pre
        class="p-3 font-mono text-xs leading-5 text-foreground"
        :class="wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'"
      ><code>{{ code }}</code></pre>
    </ScrollArea>
  </div>
</template>
