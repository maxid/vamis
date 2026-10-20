<script setup lang="ts">
import { computed } from 'vue'
import { Button, ScrollArea } from '@vamis/ui'
import type { SchemaObject } from '@vamis/core'
import JsonNode from './JsonNode.vue'
import { readRaw } from './prop'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

const parsed = computed(() => {
  let value = readRaw(props.schema, props.data)
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return value
    }
  }
  if (value == null) return undefined
  if (typeof value !== 'object') return { [typeof value]: value }
  return value
})
const levelExpand = computed(() => {
  const n = Number(props.schema.levelExpand)
  return Number.isFinite(n) ? n : 1
})

async function copy() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(parsed.value, null, 2))
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div data-slot="json" class="rounded-md border">
    <div v-if="schema.enableClipboard" class="flex justify-end border-b px-2 py-1">
      <Button size="xs" variant="ghost" @click="copy">复制</Button>
    </div>
    <ScrollArea class="max-h-80 p-3">
      <p v-if="parsed == null" class="text-sm text-muted-foreground">{{ schema.placeholder || '-' }}</p>
      <JsonNode
        v-else
        :value="parsed"
        :depth="0"
        :level-expand="levelExpand"
        :display-data-types="schema.displayDataTypes === true"
        :sort-keys="schema.sortKeys === true"
      />
    </ScrollArea>
  </div>
</template>
