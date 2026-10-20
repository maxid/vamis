<script setup lang="ts">
import { computed } from 'vue'
import { SchemaRenderer, asArray, type SchemaObject } from '@varmis/core'
import { Alert, AlertDescription, AlertTitle } from '@varmis/ui'

const props = defineProps<{ schema: SchemaObject }>()
const body = computed(() => asArray(props.schema.body))
const variant = computed(() =>
  props.schema.level === 'danger' || props.schema.level === 'error' ? 'destructive' : 'default',
)
</script>

<template>
  <Alert :variant="variant">
    <AlertTitle v-if="schema.title">{{ schema.title }}</AlertTitle>
    <AlertDescription>
      <template v-if="body.length">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" />
      </template>
      <span v-else>{{ schema.tpl || schema.msg || schema.body || '' }}</span>
    </AlertDescription>
  </Alert>
</template>
