<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@varmis/core'
import { Card, CardContent, CardHeader, CardTitle } from '@varmis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body))
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ schema.title || '对话框' }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </CardContent>
  </Card>
</template>
