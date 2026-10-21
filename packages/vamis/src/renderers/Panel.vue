<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { Card, CardContent, CardHeader, CardTitle } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body))
</script>

<template>
  <Card class="w-full min-w-0">
    <CardHeader v-if="schema.title" class="border-b">
      <CardTitle>{{ schema.title }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </CardContent>
  </Card>
</template>
