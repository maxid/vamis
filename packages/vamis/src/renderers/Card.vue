<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, filterTpl, popOverFieldSchema, type SchemaObject } from '@vamis/core'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vamis/ui'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const header = computed(() => (props.schema.header || {}) as SchemaObject)
const body = computed(() => asArray(props.schema.body))
const title = computed(() => filterTpl(header.value.title || props.schema.title || '', props.data))
const subTitle = computed(() => filterTpl(header.value.subTitle || props.schema.subTitle || '', props.data))
</script>

<template>
  <Card>
    <CardHeader v-if="title || subTitle">
      <CardTitle class="text-base">{{ title }}</CardTitle>
      <CardDescription v-if="subTitle">{{ subTitle }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-2">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="popOverFieldSchema(node)" />
    </CardContent>
  </Card>
</template>
