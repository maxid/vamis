<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@vamis/core'
import { Card, CardContent, CardHeader, CardTitle } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body))
</script>

<template>
  <Card>
    <CardHeader v-if="schema.title">
      <CardTitle>{{ schema.title }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </CardContent>
  </Card>
</template>
