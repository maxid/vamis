<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { Card, CardContent } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body))
</script>

<template>
  <Card>
    <CardContent class="space-y-2 p-4">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </CardContent>
  </Card>
</template>
