<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  asArray,
  resolveClassName,
  useData,
  type SchemaObject,
} from '@vamis/core'
import { Card, CardContent, CardHeader, CardTitle, cn } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const body = computed(() => asArray(props.schema.body))
const headerClass = computed(() =>
  cn('border-b bg-muted', resolveClassName(props.schema.headerClassName, data.value)),
)
const bodyClass = computed(() =>
  cn('flex-1 space-y-3', resolveClassName(props.schema.bodyClassName, data.value)),
)
</script>

<template>
  <Card class="h-full w-full min-w-0">
    <CardHeader v-if="schema.title" :class="headerClass">
      <CardTitle>{{ schema.title }}</CardTitle>
    </CardHeader>
    <CardContent :class="bodyClass">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
    </CardContent>
  </Card>
</template>
