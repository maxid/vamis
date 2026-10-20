<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, type SchemaObject } from '@vamis/core'
import { Card, CardContent } from '@vamis/ui'
import { schemaNodes } from './prop'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => schemaNodes(props.schema.body))
const left = computed(() => schemaNodes(props.schema.left))
const right = computed(() => schemaNodes(props.schema.right))
const bodyWidth = computed(() => {
  if (!left.value.length && !right.value.length) return '100%'
  return String(props.schema.bodyWidth || '60%')
})
</script>

<template>
  <div data-slot="slider" class="flex min-h-[8rem] gap-2">
    <Card v-if="left.length" class="min-w-[8rem] flex-1 py-3">
      <CardContent class="space-y-2">
        <SchemaRenderer v-for="(node, i) in left" :key="`l-${i}`" :schema="node" />
      </CardContent>
    </Card>
    <Card class="py-3" :style="{ width: bodyWidth, flex: left.length || right.length ? 'none' : '1' }">
      <CardContent class="space-y-2">
        <SchemaRenderer v-for="(node, i) in body" :key="`b-${i}`" :schema="node" />
      </CardContent>
    </Card>
    <Card v-if="right.length" class="min-w-[8rem] flex-1 py-3">
      <CardContent class="space-y-2">
        <SchemaRenderer v-for="(node, i) in right" :key="`r-${i}`" :schema="node" />
      </CardContent>
    </Card>
  </div>
</template>
